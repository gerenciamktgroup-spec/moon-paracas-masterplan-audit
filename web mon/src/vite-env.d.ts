/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_CONTACT_WHATSAPP?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_LEGAL_ENTITY_NAME?: string;
  readonly VITE_LEGAL_RUC?: string;
  readonly VITE_LEGAL_ADDRESS?: string;
  readonly VITE_PRIVACY_EMAIL?: string;
  readonly VITE_MERCADO_PAGO_PUBLIC_KEY?: string;
  readonly VITE_ENABLE_GOOGLE_MAPS?: string;
  readonly VITE_GOOGLE_MAPS_PLATFORM_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
