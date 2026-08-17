import { useEffect, useId, useRef, useState } from "react";
import { LockKeyhole, X } from "lucide-react";
import { createMercadoPago } from "../lib/mercadoPago";
import { ReservationClientData } from "../types/reservation";

type PaymentDialogProps = {
  lotId: string;
  client: ReservationClientData;
  onClose: () => void;
  onResult: (message: string) => void;
};

export const PaymentDialog = ({ lotId, client, onClose, onResult }: PaymentDialogProps) => {
  const reactId = useId();
  const containerId = `payment-card-${reactId.replace(/[^a-z0-9]/gi, "")}`;
  const reservationId = useRef(crypto.randomUUID());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let controller: { unmount?: () => void } | undefined;

    const mountCheckout = async () => {
      try {
        const mp = await createMercadoPago();
        if (cancelled) return;
        const bricksBuilder = mp.bricks();
        controller = await bricksBuilder.create("cardPayment", containerId, {
          initialization: { amount: 1000, payer: { email: client.email } },
          customization: { visual: { style: { theme: "dark" } } },
          callbacks: {
            onReady: () => setLoading(false),
            onSubmit: async (paymentData) => {
              setError("");
              const response = await fetch("/api/process-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Idempotency-Key": reservationId.current,
                },
                body: JSON.stringify({
                  paymentData,
                  reservationId: reservationId.current,
                  lotId,
                  client,
                }),
              });
              const payload = await response.json().catch(() => ({}));
              if (!response.ok) {
                setError(payload.error || "No se pudo procesar el pago.");
                return;
              }

              const label = lotId.startsWith("D-") ? lotId.replace("D-", "Domo ") : lotId.replace("LOTE-", "");
              if (payload.status === "approved") {
                onResult(`Reserva confirmada. El lote ${label} quedó separado y recibirás la constancia por el canal registrado.`);
              } else if (["pending", "in_process", "authorized"].includes(payload.status)) {
                onResult("El pago está en validación. No vuelvas a pagar; te notificaremos cuando se confirme.");
              } else {
                setError(payload.status_detail || "El pago no fue aprobado. Revisa el medio de pago e inténtalo nuevamente.");
              }
            },
            onError: () => setError("La pasarela encontró un problema. Recarga este paso o usa otro navegador."),
          },
        });
      } catch (checkoutError) {
        if (!cancelled) {
          setLoading(false);
          setError(checkoutError instanceof Error ? checkoutError.message : "No se pudo iniciar la pasarela.");
        }
      }
    };

    void mountCheckout();
    return () => {
      cancelled = true;
      controller?.unmount?.();
    };
  }, [client, containerId, lotId, onResult]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0807]/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#16110F] p-6 text-center text-[#F5F2EB] shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-400 hover:bg-white/5 hover:text-white" aria-label="Cerrar pago">
          <X className="h-5 w-5" />
        </button>
        <LockKeyhole className="mx-auto h-6 w-6 text-[#f0b08c]" />
        <h2 id="payment-title" className="mt-3 font-display text-3xl font-semibold text-white">Separación segura</h2>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-stone-400">
          Paga S/ 1,000 para iniciar la separación de {lotId}. Mercado Pago procesa los datos de tu tarjeta.
        </p>

        {loading && <p className="mt-8 animate-pulse text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Cargando pasarela segura…</p>}
        <div id={containerId} className="mt-6 min-h-10 text-left" />
        {error && <p className="mt-4 rounded-md border border-[#d27b5f]/35 bg-[#a9472d]/15 p-3 text-left text-xs leading-5 text-[#ffd2c3]" role="alert">{error}</p>}
        <p className="mt-5 text-[9px] leading-4 text-white/35">La disponibilidad se confirma únicamente después de la conciliación del pago. No cierres esta ventana mientras la operación se procesa.</p>
      </div>
    </div>
  );
};
