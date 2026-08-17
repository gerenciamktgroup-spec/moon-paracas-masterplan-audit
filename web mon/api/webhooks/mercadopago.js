import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { adminDb, FieldValue } from "../_lib/firebase-admin.js";
import { observeRequest } from "../_lib/logger.js";

const TERMINAL_FAILURES = new Set(["rejected", "cancelled", "refunded", "charged_back"]);

async function reconcilePayment(payment) {
  const reservationId = String(payment.external_reference || payment.metadata?.reservation_id || "");
  if (!reservationId) return;

  const reservationRef = adminDb.collection("reservations").doc(reservationId);
  await adminDb.runTransaction(async (transaction) => {
    const reservationSnapshot = await transaction.get(reservationRef);
    if (!reservationSnapshot.exists) return;

    const reservation = reservationSnapshot.data();
    const lotId = reservation.lotId;
    const lotCollection = reservation.lotCollection || (lotId?.startsWith("D-") ? "dome_lots" : "lots");
    if (!lotId || payment.metadata?.lot_id && payment.metadata.lot_id !== lotId) {
      throw new Error("El pago no coincide con el lote de la reserva.");
    }

    const lotRef = adminDb.collection(lotCollection).doc(lotId);
    const lotSnapshot = await transaction.get(lotRef);
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
      if (lotSnapshot.data()?.pendingReservationId === reservationId) {
        transaction.set(lotRef, {
          status: "available",
          pendingReservationId: FieldValue.delete(),
          holdExpiresAt: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      transaction.set(reservationRef, {
        ...common,
        status: payment.status === "rejected" || payment.status === "cancelled" ? "failed" : payment.status,
      }, { merge: true });
      return;
    }

    transaction.set(reservationRef, { ...common, status: "pending" }, { merge: true });
  });
}

export default async function handler(req, res) {
  const log = observeRequest(req, res, "/api/webhooks/mercadopago");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!accessToken || !secret) return res.status(503).json({ error: "Webhook no configurado." });

  const dataId = String(req.query?.["data.id"] || req.body?.data?.id || "");
  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers["x-signature"],
      xRequestId: req.headers["x-request-id"],
      dataId,
      secret,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      log.error(error, "webhook_signature_invalid", { paymentId: dataId });
      return res.status(401).json({ error: "Firma de webhook inválida." });
    }
    log.error(error, "webhook_signature_validation_failed", { paymentId: dataId });
    return res.status(400).json({ error: "No se pudo validar la notificación." });
  }

  if (req.body?.type !== "payment" || !dataId) return res.status(200).json({ received: true });

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(`Mercado Pago respondió ${response.status}.`);
    await reconcilePayment(await response.json());
    return res.status(200).json({ received: true });
  } catch (error) {
    log.error(error, "webhook_reconciliation_failed", { paymentId: dataId });
    return res.status(500).json({ error: "No se pudo conciliar el pago." });
  }
}
