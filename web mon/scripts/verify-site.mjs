import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const baseUrl = process.env.VERIFY_BASE_URL || "http://127.0.0.1:4173";
const outputDir = fileURLToPath(new URL("../artifacts/", import.meta.url));
await mkdir(outputDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(error.message));
page.on("requestfailed", (request) => {
  const failure = request.failure()?.errorText;
  if (failure === "net::ERR_ABORTED") return;
  failedRequests.push(`${request.method()} ${request.url()} — ${failure}`);
});

await page.evaluateOnNewDocument(() => {
  window.__lcp = 0;
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    window.__lcp = entries.at(-1)?.startTime || window.__lcp;
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

const routes = ["/", "/simulador", "/paracas-dome", "/galeria", "/experiencia", "/tecnica", "/documentos", "/privacidad", "/terminos", "/ruta-inexistente"];
const routeResults = [];

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
for (const route of routes) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("h1", { timeout: 10_000 }).catch(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, 300));
  routeResults.push(await page.evaluate((pathname) => ({
    pathname,
    httpStatus: Number(document.body.dataset.httpStatus || 0),
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    textLength: document.body.innerText.trim().length,
    errorOverlay: Boolean(document.querySelector("vite-error-overlay, .vite-error-overlay")),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    robots: document.querySelector('meta[name="robots"]')?.content || "",
    responseStatus: 0,
  }), route));
  routeResults.at(-1).responseStatus = response?.status() || 0;
}

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await new Promise((resolve) => setTimeout(resolve, 2200));
await page.evaluate(() => {
  const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Solo esencial"));
  button?.click();
});
await page.screenshot({ path: path.join(outputDir, "home-desktop.png"), fullPage: true });
const desktop = await page.evaluate(() => ({
  lcp: Math.round(window.__lcp || 0),
  heroPoster: document.querySelector('img[src*="hero-poster"]')?.getAttribute("src"),
  hasIntentPaths: document.body.innerText.includes("No todos llegan a Paracas buscando lo mismo"),
  hasTypologyComparator: document.body.innerText.includes("Compara la decisión, no solo la imagen"),
  residentialCountShown: document.body.innerText.includes("312"),
}));

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await new Promise((resolve) => setTimeout(resolve, 2600));
const mobile = await page.evaluate(() => ({
  lcp: Math.round(window.__lcp || 0),
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  heroVideoRequested: performance.getEntriesByType("resource").some((entry) => entry.name.includes("hero_bg.mp4")),
  mobileBarVisible: Boolean(Array.from(document.querySelectorAll("a")).find((link) => link.textContent?.includes("Hablar con un asesor"))),
}));
await page.screenshot({ path: path.join(outputDir, "home-mobile.png"), fullPage: true });

await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
await page.goto(`${baseUrl}/simulador`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.body.innerText.includes("Guardar en mi selección"), { timeout: 15_000 });
await page.evaluate(() => {
  const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Guardar en mi selección"));
  button?.click();
});
await page.waitForFunction(() => window.location.search.includes("favoritos="), { timeout: 5000 });
const productChecks = await page.evaluate(() => ({
  shortlistStored: window.location.search.includes("favoritos=") && document.body.innerText.toLowerCase().includes("mi selección · 1/5"),
  shareActionVisible: document.body.innerText.toLowerCase().includes("compartir selección"),
  unsupportedRiskClaimAbsent: !document.body.innerText.includes("Inmune a Maremotos"),
  unsupportedSolarMetricAbsent: !document.body.innerText.includes("kWh/m²/d"),
}));

const apiChecks = {};
for (const [name, path] of [["leads", "/api/leads"], ["payment", "/api/process-payment"]]) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://malicious.example" },
    body: "{}",
  });
  apiChecks[name] = response.status;
}
const invalidWebhook = await fetch(`${baseUrl}/api/webhooks/mercadopago`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-signature": "ts=1,v1=invalid", "x-request-id": "test" },
  body: JSON.stringify({ type: "payment", data: { id: "1" } }),
});
apiChecks.webhook = invalidWebhook.status;

const staticChecks = {};
for (const path of ["/robots.txt", "/sitemap.xml", "/favicon.svg"]) {
  staticChecks[path] = (await fetch(`${baseUrl}${path}`)).status;
}

await browser.close();

const report = { routeResults, desktop, mobile, productChecks, apiChecks, staticChecks, consoleErrors, pageErrors, failedRequests };
console.log(JSON.stringify(report, null, 2));

const routeFailure = routeResults.some((route) => route.textLength < 100 || route.h1 !== 1 || route.errorOverlay || route.horizontalOverflow > 1);
const staticFailure = Object.values(staticChecks).some((status) => status !== 200);
const apiFailure = apiChecks.leads !== 403 || apiChecks.payment !== 403 || ![401, 503].includes(apiChecks.webhook);
const productFailure = Object.values(productChecks).some((value) => !value) || !desktop.hasTypologyComparator;
if (routeFailure || staticFailure || apiFailure || productFailure || pageErrors.length || consoleErrors.length) process.exitCode = 1;
