const LOCAL_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function configuredOrigins() {
  return [process.env.APP_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

export function isAllowedOrigin(origin) {
  if (!origin) return process.env.VERCEL !== "1";
  const normalized = origin.replace(/\/$/, "");
  return LOCAL_ORIGINS.has(normalized) || configuredOrigins().includes(normalized);
}

export function setCors(req, res, methods = "OPTIONS,POST") {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type, X-Idempotency-Key");
  res.setHeader("Cache-Control", "no-store");
}

export function requireAllowedOrigin(req, res) {
  if (isAllowedOrigin(req.headers.origin)) return true;
  res.status(403).json({ error: "Origen no permitido." });
  return false;
}

export function cleanText(value, maxLength) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}
