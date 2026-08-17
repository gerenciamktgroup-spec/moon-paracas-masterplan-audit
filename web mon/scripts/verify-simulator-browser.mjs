import fs from "node:fs/promises";
import puppeteer from "puppeteer";

const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const targetLabel = baseUrl.includes("localhost") ? "local" : "production";

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

const consoleErrors = [];
const pageErrors = [];
const thirdPartyWarnings = [];
page.on("console", (message) => {
  if (message.type() !== "error") return;
  const value = message.text();
  if (value.includes("Maps Demo Key limit reached")) thirdPartyWarnings.push(value);
  else consoleErrors.push(value);
});
page.on("pageerror", (error) => {
  if (error.message.includes("IntersectionObserver") && error.message.includes("parameter 1")) {
    thirdPartyWarnings.push(error.message);
  } else {
    pageErrors.push(error.message);
  }
});

async function captureSection(selector, name) {
  const section = await page.$(selector);
  if (!section) return false;
  await section.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.waitForFunction(
    (targetSelector) => [...document.querySelectorAll(`${targetSelector} img`)].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    { timeout: 30000 },
    selector,
  );
  await new Promise((resolve) => setTimeout(resolve, 900));
  await section.screenshot({ path: `artifacts/browser-v3/${name}-${targetLabel}.png` });
  return true;
}

await fs.mkdir("artifacts/browser-v3", { recursive: true });
await page.goto(`${baseUrl}/simulador`, { waitUntil: "networkidle2", timeout: 60000 });
await page.waitForFunction(
  () => Boolean(document.querySelector("[data-testid='interactive-masterplan'] [data-lot-id^='LOTE-']")),
  { timeout: 30000 },
);
await page.evaluate(() => {
  const essentialButton = [...document.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Solo esencial");
  if (essentialButton instanceof HTMLButtonElement) essentialButton.click();
});

const initial = await page.evaluate(() => ({
  title: document.title,
  bodyLength: document.body.innerText.trim().length,
  lotPaths: document.querySelectorAll("[data-lot-id^='LOTE-']").length,
  hasLocalViewport: Boolean(document.querySelector("[data-testid='local-svg-viewport']")),
  hasPrice: document.body.innerText.includes("Desde S/ 37,500"),
  hasPriceVersion: document.body.innerText.includes("julio 2026"),
  hasBrochure: Boolean(document.querySelector("a[href='/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf']")),
  overlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
}));

if (initial.lotPaths > 0) await page.click("[data-lot-id^='LOTE-']");
await new Promise((resolve) => setTimeout(resolve, 500));
const selected = await page.evaluate(() => ({
  hasLotPrice: document.body.textContent?.includes("Precio del lote · julio 2026") ?? false,
  hasParkingPrice: document.body.textContent?.includes("cochera S/ 7,500.00") ?? false,
  hasBuildability: document.body.textContent?.includes("Ø8 m · Verificado") ?? false,
}));

await page.click("[data-testid='dome-concept-tab']");
await page.waitForSelector("[data-testid='dome-concept-panel']", { timeout: 30000 });
await page.click("[data-scene-id='patio']");
await page.waitForFunction(
  () => document.querySelector("[data-testid='dome-concept-panel'] img[alt*='Patio conceptual']") instanceof HTMLImageElement,
  { timeout: 30000 },
);
const concept = await page.evaluate(() => ({
  hasConceptTitle: document.body.textContent?.includes("Un domo, un patio, todo el cielo") ?? false,
  hasSelectedLot: document.body.textContent?.includes("Tu selección") ?? false,
  hasHonestDisclaimer: document.body.textContent?.includes("La venta corresponde al lote") ?? false,
  sceneTabs: document.querySelectorAll("[data-scene-id]").length,
  hasObsoleteRender: Boolean(document.querySelector("img[src='/images/masterplan_3d.jpg']")),
}));
await page.screenshot({ path: `artifacts/browser-v3/habitar-lote-${targetLabel}.png`, fullPage: true });
await page.click("[data-testid='back-to-map']");
await page.waitForFunction(
  () => Boolean(document.querySelector("[data-testid='interactive-masterplan'] [data-lot-id^='LOTE-']")),
  { timeout: 30000 },
);

const brochureStatus = await page.evaluate(async () => {
  const response = await fetch("/documents/Moon_Paracas_Brochure_Comercial_V2.2_2026.pdf");
  return { status: response.status, contentType: response.headers.get("content-type"), bytes: (await response.arrayBuffer()).byteLength };
});

await page.screenshot({ path: `artifacts/browser-v3/simulador-${targetLabel}.png`, fullPage: true });

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle2", timeout: 60000 });
const homeVisualSections = {};
for (const [selector, name] of [
  ["[data-testid='project-hero']", "audit-hero"],
  ["#vision", "audit-vision"],
  ["[data-testid='lot-types-section']", "audit-lot-types"],
  ["[data-testid='typology-comparator']", "audit-comparator"],
  ["[data-testid='purchase-process']", "audit-process"],
  ["#contacto", "audit-contact"],
]) {
  homeVisualSections[name] = await captureSection(selector, name);
}
const intentSection = await page.$("[data-testid='intent-path-section']");
if (intentSection) {
  await intentSection.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.waitForFunction(
    () => [...document.querySelectorAll("[data-testid='intent-card'] img")].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    { timeout: 30000 },
  );
  await intentSection.screenshot({ path: `artifacts/browser-v3/intent-path-${targetLabel}.png` });
}
const currentPlan = await page.$("img[src='/images/masterplan-v4-commercial.png']");
if (currentPlan) {
  await currentPlan.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.waitForFunction(
    () => {
      const image = document.querySelector("img[src='/images/masterplan-v4-commercial.png']");
      return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
    },
    { timeout: 30000 },
  );
  await currentPlan.screenshot({ path: `artifacts/browser-v3/masterplan-${targetLabel}.png` });
}
const home = await page.evaluate(() => ({
  bodyLength: document.body.innerText.trim().length,
  hasMasterplan: document.body.innerText.includes("Un masterplan que deja respirar al desierto"),
  hasCurrentPlan: (() => {
    const image = document.querySelector("img[src='/images/masterplan-v4-commercial.png']");
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  })(),
  hasPrice: document.body.innerText.includes("Desde S/ 37,500"),
  intentCards: document.querySelectorAll("[data-testid='intent-card']").length,
  intentImagesLoaded: [...document.querySelectorAll("[data-testid='intent-card'] img")].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
  overlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
}));
await page.screenshot({ path: `artifacts/browser-v3/home-${targetLabel}.png`, fullPage: true });

await page.setViewport({ width: 828, height: 1000, deviceScaleFactor: 1 });
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle2", timeout: 60000 });
const tabletIntentSection = await page.$("[data-testid='intent-path-section']");
if (tabletIntentSection) {
  await tabletIntentSection.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.waitForFunction(
    () => [...document.querySelectorAll("[data-testid='intent-card'] img")].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    { timeout: 30000 },
  );
  await tabletIntentSection.screenshot({ path: `artifacts/browser-v3/intent-path-tablet-${targetLabel}.png` });
}
const intentTablet = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("[data-testid='intent-card']")];
  const rects = cards.map((card) => card.getBoundingClientRect());
  return {
    cards: cards.length,
    featureLayout: rects.length === 3
      && rects[0].top < rects[1].top - 10
      && Math.abs(rects[1].top - rects[2].top) <= 2
      && rects[0].width > rects[1].width * 1.8,
    hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth + 1,
  };
});

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle2", timeout: 60000 });
const homeMobileVisualSections = {};
for (const [selector, name] of [
  ["[data-testid='project-hero']", "audit-hero-mobile"],
  ["#vision", "audit-vision-mobile"],
  ["[data-testid='lot-types-section']", "audit-lot-types-mobile"],
  ["[data-testid='typology-comparator']", "audit-comparator-mobile"],
  ["[data-testid='purchase-process']", "audit-process-mobile"],
  ["#contacto", "audit-contact-mobile"],
]) {
  homeMobileVisualSections[name] = await captureSection(selector, name);
}
const mobileIntentSection = await page.$("[data-testid='intent-path-section']");
if (mobileIntentSection) {
  await mobileIntentSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForFunction(
    () => [...document.querySelectorAll("[data-testid='intent-card'] img")].every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
    { timeout: 30000 },
  );
  await mobileIntentSection.screenshot({ path: `artifacts/browser-v3/intent-path-mobile-${targetLabel}.png` });
}
const intentMobile = await page.evaluate(() => ({
  cards: document.querySelectorAll("[data-testid='intent-card']").length,
  hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth + 1,
}));

await page.goto(`${baseUrl}/simulador`, { waitUntil: "networkidle2", timeout: 60000 });
await page.click("[data-testid='dome-concept-tab']");
await page.waitForSelector("[data-testid='dome-concept-panel']", { timeout: 30000 });
const mobile = await page.evaluate(() => ({
  viewportWidth: window.innerWidth,
  bodyScrollWidth: document.body.scrollWidth,
  hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth + 1,
  hasConceptPanel: Boolean(document.querySelector("[data-testid='dome-concept-panel']")),
}));
const mobilePanel = await page.$("[data-testid='dome-concept-panel']");
if (mobilePanel) {
  await mobilePanel.screenshot({ path: `artifacts/browser-v3/habitar-lote-mobile-${targetLabel}.png` });
}

await browser.close();

const report = { baseUrl, initial, selected, concept, brochureStatus, home, homeVisualSections, homeMobileVisualSections, intentTablet, intentMobile, mobile, thirdPartyWarnings, consoleErrors, pageErrors };
console.log(JSON.stringify(report, null, 2));

const pass = initial.bodyLength > 1000
  && initial.lotPaths === 282
  && initial.hasLocalViewport
  && initial.hasPrice
  && initial.hasPriceVersion
  && initial.hasBrochure
  && !initial.overlay
  && selected.hasLotPrice
  && selected.hasParkingPrice
  && selected.hasBuildability
  && concept.hasConceptTitle
  && concept.hasSelectedLot
  && concept.hasHonestDisclaimer
  && concept.sceneTabs === 3
  && !concept.hasObsoleteRender
  && brochureStatus.status === 200
  && brochureStatus.bytes > 100000
  && home.bodyLength > 1000
  && home.hasMasterplan
  && home.hasCurrentPlan
  && home.hasPrice
  && home.intentCards === 3
  && home.intentImagesLoaded
  && !home.overlay
  && Object.values(homeVisualSections).every(Boolean)
  && Object.values(homeMobileVisualSections).every(Boolean)
  && intentTablet.cards === 3
  && intentTablet.featureLayout
  && !intentTablet.hasHorizontalOverflow
  && intentMobile.cards === 3
  && !intentMobile.hasHorizontalOverflow
  && mobile.hasConceptPanel
  && !mobile.hasHorizontalOverflow
  && consoleErrors.length === 0
  && pageErrors.length === 0;

if (!pass) process.exitCode = 1;
