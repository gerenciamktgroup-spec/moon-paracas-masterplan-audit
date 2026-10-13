const LOCAL_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function configuredOrigins() {
  return [
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "",
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  if (LOCAL_ORIGINS.has(normalized)) return true;
  if (configuredOrigins().includes(normalized)) return true;
  // Permitir cualquier subdominio en vercel.app y dominios oficiales
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i.test(normalized)) return true;
  if (/^https:\/\/(www\.)?moonparacas\.pe$/i.test(normalized)) return true;
  return false;
}

export function setCors(req, res, methods = "OPTIONS,POST,GET") {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type, X-Idempotency-Key");
  res.setHeader("Cache-Control", "no-store");
}

export function requireAllowedOrigin(req, res) {
  if (!req.headers.origin || isAllowedOrigin(req.headers.origin)) return true;
  res.status(403).json({ error: "Origen no permitido." });
  return false;
}

export function cleanText(value, maxLength) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}
