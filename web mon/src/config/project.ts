const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const PROJECT = {
  name: "Moon Paracas",
  siteUrl: (import.meta.env.VITE_SITE_URL || "https://moon-paracas.vercel.app").replace(/\/$/, ""),
  residentialLots: 384,
  parkingLots: 192,
  totalUnits: 576,
  areaLabel: "11.26 ha",
  totalAreaM2: 112554.30,
  oasisAreaM2: 20662.15,
  location: "Paracas, Ica, Perú",
  panamericanaKm: 240,
  centerCoordinates: { lat: -13.923861, lng: -76.159180 },
  reservationAmount: 1000,
};

export const CONTACT = {
  whatsapp: onlyDigits(import.meta.env.VITE_CONTACT_WHATSAPP || ""),
  phoneLabel: import.meta.env.VITE_CONTACT_PHONE || "",
  email: import.meta.env.VITE_CONTACT_EMAIL || "",
};

export const LEGAL = {
  entityName: import.meta.env.VITE_LEGAL_ENTITY_NAME || "",
  ruc: import.meta.env.VITE_LEGAL_RUC || "",
  address: import.meta.env.VITE_LEGAL_ADDRESS || "",
  privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || CONTACT.email,
};

export const isLegalIdentityConfigured = Boolean(LEGAL.entityName && LEGAL.ruc && LEGAL.address && LEGAL.privacyEmail);

export function whatsappHref(message: string) {
  if (!CONTACT.whatsapp) return "/#contacto";
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}
