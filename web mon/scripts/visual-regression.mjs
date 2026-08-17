import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const baseUrl = process.env.VERIFY_BASE_URL || "http://127.0.0.1:4173";
const outputDir = fileURLToPath(new URL("../artifacts/", import.meta.url));
await mkdir(outputDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const errors = [];

async function dismissMetrics(page) {
  await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.toLowerCase().includes("solo esencial"));
    button?.click();
  });
}

async function capture(route, name, viewport, wait = 1200, action) {
  const page = await browser.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${route}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("h1", { timeout: 20_000 });
  if (route === "/galeria") await page.waitForSelector('button[aria-label^="Ampliar"]', { timeout: 25_000 });
  await new Promise((resolve) => setTimeout(resolve, wait));
  await page.evaluate(() => document.fonts.ready);
  await dismissMetrics(page);
  if (action === "map") await page.evaluate(() => document.querySelector("#map-title")?.scrollIntoView({ block: "start" }));
  if (action === "project") await page.evaluate(() => document.querySelector("article")?.scrollIntoView({ block: "center" }));
  if (action === "technical") await page.evaluate(() => document.querySelector("section h2")?.scrollIntoView({ block: "start" }));
  if (action === "lightbox") {
    await page.click('button[aria-label^="Ampliar"]');
    await page.waitForSelector('[role="dialog"]');
  }
  if (action) await new Promise((resolve) => setTimeout(resolve, 650));
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false });
  const result = await page.evaluate((pathname) => ({
    pathname,
    h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim(),
    activeNav: document.querySelector('nav[aria-label="Navegación principal"] [aria-current="page"]')?.textContent?.trim() || null,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: [window.innerWidth, window.innerHeight],
  }), route);
  await page.close();
  return result;
}

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };
const requestedCaptures = new Set(process.argv.slice(2));
const targets = [
  ["/", "final-home-desktop", desktop, 1800],
  ["/simulador", "final-simulator-desktop", desktop, 1800],
  ["/paracas-dome", "final-dome-desktop", desktop, 1800],
  ["/galeria", "final-gallery-desktop", desktop, 5000],
  ["/experiencia", "final-experience-desktop", desktop, 1700],
  ["/tecnica", "final-technical-desktop", desktop, 1500],
  ["/documentos", "final-documents-desktop", desktop, 1200],
  ["/privacidad", "final-privacy-desktop", desktop, 900],
  ["/simulador", "final-simulator-mobile", mobile, 1500],
  ["/galeria", "final-gallery-mobile", mobile, 4500],
  ["/simulador", "final-simulator-map-desktop", desktop, 1800, "map"],
  ["/experiencia", "final-experience-project-desktop", desktop, 1700, "project"],
  ["/tecnica", "final-technical-content-desktop", desktop, 1500, "technical"],
  ["/galeria", "final-gallery-lightbox-desktop", desktop, 5000, "lightbox"],
];
const results = [];
for (const [route, name, viewport, wait, action] of targets) {
  if (requestedCaptures.size && !requestedCaptures.has(name)) continue;
  results.push(await capture(route, name, viewport, wait, action));
}

console.log(JSON.stringify({ results, errors }, null, 2));
await browser.close();
