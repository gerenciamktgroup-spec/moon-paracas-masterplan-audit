type CardPaymentCallbacks = {
  onReady?: () => void;
  onSubmit: (formData: Record<string, unknown>) => Promise<void>;
  onError?: (error: unknown) => void;
};

type MercadoPagoInstance = {
  bricks: () => {
    create: (
      type: "cardPayment",
      containerId: string,
      options: {
        initialization: { amount: number; payer: { email: string } };
        customization?: Record<string, unknown>;
        callbacks: CardPaymentCallbacks;
      },
    ) => Promise<{ unmount?: () => void }>;
  };
};

declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;
  }
}

let sdkPromise: Promise<void> | null = null;

export async function createMercadoPago() {
  const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
  if (!publicKey) throw new Error("La pasarela de reservas aún no está configurada.");

  if (!window.MercadoPago) {
    sdkPromise ||= new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-mercado-pago-sdk="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("No se pudo cargar Mercado Pago.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.dataset.mercadoPagoSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar Mercado Pago."));
      document.head.appendChild(script);
    });
    await sdkPromise;
  }

  if (!window.MercadoPago) throw new Error("Mercado Pago no está disponible en este navegador.");
  return new window.MercadoPago(publicKey, { locale: "es-PE" });
}
