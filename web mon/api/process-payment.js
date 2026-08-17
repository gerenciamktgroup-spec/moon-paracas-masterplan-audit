import { adminDb, FieldValue, Timestamp } from "./_lib/firebase-admin.js";
import { cleanText, requireAllowedOrigin, setCors } from "./_lib/http.js";
import { observeRequest } from "./_lib/logger.js";

const RESERVATION_AMOUNT = 1000;
const HOLD_MINUTES = 15;
const LOT_ID_PATTERN = /^(?:LOTE-\d{1,3}|D-\d{1,3})$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TERMINAL_FAILURES = new Set(["rejected", "cancelled"]);

function validateRequest(req) {
  const { paymentData, reservationId, lotId, client } = req.body || {};
  const idempotencyKey = String(req.headers["x-idempotency-key"] || "").trim();

  if (!paymentData?.token || !paymentData?.payment_method_id) {
    throw new Error("La pasarela no entregó los datos de pago requeridos.");
  }
  if (!UUID_PATTERN.test(reservationId) || idempotencyKey !== reservationId) {
    throw new Error("La solicitud de pago no tiene una clave idempotente válida.");
  }
  if (!LOT_ID_PATTERN.test(lotId)) throw new Error("El lote indicado no es válido.");

  const normalizedClient = {
    name: cleanText(client?.name, 120),
    dni: cleanText(client?.dni, 20),
    email: cleanText(client?.email, 160).toLowerCase(),
    phone: cleanText(client?.phone, 32),
  };
  if (
    normalizedClient.name.length < 2 ||
    !/^\S+@\S+\.\S+$/.test(normalizedClient.email) ||
    !/^\d{8,12}$/.test(normalizedClient.dni.replace(/\D/g, "")) ||
    normalizedClient.phone.replace(/\D/g, "").length < 7
  ) {
    throw new Error("Los datos del titular de la reserva están incompletos.");
  }

  return { paymentData, reservationId, lotId, client: normalizedClient };
}

async function holdLot({ reservationId, lotId, client, commercial }) {
  const lotCollection = lotId.startsWith("D-") ? "dome_lots" : "lots";
  const lotRef = adminDb.collection(lotCollection).doc(lotId);
  const reservationRef = adminDb.collection("reservations").doc(reservationId);

  return adminDb.runTransaction(async (transaction) => {
    const [lotSnapshot, reservationSnapshot] = await Promise.all([
      transaction.get(lotRef),
      transaction.get(reservationRef),
    ]);

    if (!lotSnapshot.exists) throw new Error("El lote no existe en el inventario publicado.");

    const previousReservation = reservationSnapshot.data();
    if (previousReservation?.status === "paid") {
      return { alreadyPaid: true, paymentId: previousReservation.mpPaymentId };
    }

    const lot = lotSnapshot.data();
    const now = Timestamp.now();
    const holdExpired = lot.holdExpiresAt?.toMillis?.() < now.toMillis();
    const isSameHold = lot.pendingReservationId === reservationId;
    if (lot.status !== "available" && !isSameHold && !(lot.status === "offer" && holdExpired)) {
      throw new Error("El lote acaba de cambiar de estado. Selecciona otra alternativa.");
    }

    transaction.set(lotRef, {
      status: "offer",
      pendingReservationId: reservationId,
      holdExpiresAt: Timestamp.fromMillis(now.toMillis() + HOLD_MINUTES * 60_000),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    transaction.set(reservationRef, {
      lotId,
      lotCollection,
      project: lotCollection === "dome_lots" ? "Paracas Dome" : "Moon Paracas",
      client,
      commercial,
      amount: RESERVATION_AMOUNT,
      currency: "PEN",
      status: "processing",
      createdAt: previousReservation?.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { alreadyPaid: false, lotCollection };
  });
}

async function applyPaymentStatus({ reservationId, lotId, payment }) {
  const lotCollection = lotId.startsWith("D-") ? "dome_lots" : "lots";
  const lotRef = adminDb.collection(lotCollection).doc(lotId);
  const reservationRef = adminDb.collection("reservations").doc(reservationId);

  await adminDb.runTransaction(async (transaction) => {
    const [lotSnapshot, reservationSnapshot] = await Promise.all([
      transaction.get(lotRef),
      transaction.get(reservationRef),
    ]);
    if (!reservationSnapshot.exists) throw new Error("La reserva no existe.");

    const common = {
      mpPaymentId: String(payment.id),
      mpStatus: payment.status,
      mpStatusDetail: payment.status_detail || "",
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (payment.status === "approved") {
      transaction.set(lotRef, {
        status: "reserved",
        pendingReservationId: FieldValue.delete(),
        holdExpiresAt: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.set(reservationRef, {
        ...common,
        status: "paid",
        paidAt: FieldValue.serverTimestamp(),
        mpPaymentType: payment.payment_type_id || "",
        mpPaymentMethod: payment.payment_method_id || "",
        mpNetAmount: payment.transaction_details?.net_received_amount ?? payment.transaction_amount,
      }, { merge: true });
      return;
    }

    if (TERMINAL_FAILURES.has(payment.status)) {
      const lot = lotSnapshot.data();
      if (lot?.pendingReservationId === reservationId) {
        transaction.set(lotRef, {
          status: "available",
          pendingReservationId: FieldValue.delete(),
          holdExpiresAt: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      transaction.set(reservationRef, {
        ...common,
        status: "failed",
        failedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return;
    }

    transaction.set(reservationRef, { ...common, status: "pending" }, { merge: true });
  });
}

export default async function handler(req, res) {
  const log = observeRequest(req, res, "/api/process-payment");
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });
  if (!requireAllowedOrigin(req, res)) return;

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) return res.status(503).json({ error: "La pasarela de reservas aún no está configurada." });

  let input;
  try {
    input = validateRequest(req);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  const commercial = {
    monthlyAmount: Number(input.client && req.body?.client?.monthlyAmount) || 0,
    installmentsCount: Number(req.body?.client?.installmentsCount) || 0,
    isCash: Boolean(req.body?.client?.isCash),
    offerId: cleanText(req.body?.client?.offerId, 64),
    offerName: cleanText(req.body?.client?.offerName, 120),
    totalPrice: Number(req.body?.client?.totalPrice) || 0,
    addOnsTotal: Number(req.body?.client?.addOnsTotal) || 0,
    addOnIds: Array.isArray(req.body?.client?.addOnIds)
      ? req.body.client.addOnIds.slice(0, 20).map((value) => cleanText(value, 64))
      : [],
    downPaymentPercent: Number(req.body?.client?.downPaymentPercent) || 0,
  };

  try {
    const hold = await holdLot({ ...input, commercial });
    if (hold.alreadyPaid) {
      return res.status(200).json({ id: hold.paymentId, status: "approved", reused: true });
    }

    const paymentPayload = {
      ...input.paymentData,
      transaction_amount: RESERVATION_AMOUNT,
      description: `Separación de lote ${input.lotId}`,
      external_reference: input.reservationId,
      statement_descriptor: "MOON PARACAS",
      metadata: { reservation_id: input.reservationId, lot_id: input.lotId },
      payer: {
        ...input.paymentData.payer,
        email: input.client.email,
        first_name: input.client.name.split(" ")[0],
        last_name: input.client.name.split(" ").slice(1).join(" "),
        identification: { type: "DNI", number: input.client.dni.replace(/\D/g, "") },
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": input.reservationId,
      },
      body: JSON.stringify(paymentPayload),
    });
    const payment = await response.json();

    if (!response.ok) {
      await applyPaymentStatus({
        reservationId: input.reservationId,
        lotId: input.lotId,
        payment: { id: payment.id || "", status: "rejected", status_detail: payment.message || "gateway_error" },
      });
      return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({
        error: "Mercado Pago no pudo procesar la operación.",
        status_detail: payment.message || "gateway_error",
      });
    }

    await applyPaymentStatus({ reservationId: input.reservationId, lotId: input.lotId, payment });
    return res.status(200).json({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
    });
  } catch (error) {
    log.error(error, "payment_orchestration_failed", { lotId: input?.lotId || "unknown" });
    const isAvailabilityError = /lote|inventario|reserva/i.test(error?.message || "");
    return res.status(isAvailabilityError ? 409 : 500).json({
      error: isAvailabilityError ? error.message : "No pudimos completar la reserva. No se confirmó ningún cargo.",
    });
  }
}
