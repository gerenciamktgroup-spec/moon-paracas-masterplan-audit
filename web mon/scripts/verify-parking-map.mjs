import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const baseUrl = process.env.VERIFY_BASE_URL || "http://127.0.0.1:3000";
const outputDir = fileURLToPath(new URL("../artifacts/", import.meta.url));
await mkdir(outputDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const errors = [];

async function preparePage(viewport) {
  const page = await browser.newPage();
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("ERR_BLOCKED_BY_CLIENT")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/simulador`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector('[data-lot-id="P001"]', { timeout: 35_000 });
  await page.evaluate(() => {
    const metricsButton = Array.from(document.querySelectorAll("button"))
      .find((button) => button.textContent?.toLowerCase().includes("solo esencial"));
    metricsButton?.click();
  });
  return page;
}

const desktopPage = await preparePage({ width: 1440, height: 900 });
const desktopInventory = await desktopPage.evaluate(() => ({
  allLotsRendered: document.querySelectorAll("[data-lot-id]").length,
  hasResidentialCount: document.body.innerText.includes("312 lotes"),
  hasParkingCount: document.body.innerText.includes("138 cocheras"),
  hasDimensions: document.body.innerText.includes("2.50 × 5.00 m"),
}));

await desktopPage.evaluate(() => {
  const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.trim() === "Cocheras");
  button?.click();
});
await desktopPage.waitForFunction(() => document.querySelectorAll("[data-lot-id]").length === 138, { timeout: 10_000 });
await desktopPage.click('[data-lot-id="P001"]');
await desktopPage.evaluate(() => document.querySelector("#map-title")?.scrollIntoView({ block: "start" }));
await new Promise((resolve) => setTimeout(resolve, 900));
await desktopPage.screenshot({ path: path.join(outputDir, "masterplan-parking-corrected-desktop.png"), fullPage: false });
const desktopFiltered = await desktopPage.evaluate(() => ({
  parkingPaths: document.querySelectorAll("[data-lot-id]").length,
  selectedParking: Boolean(document.querySelector('[data-lot-id="P001"]')),
  parkingFilterPressed: Array.from(document.querySelectorAll("button"))
    .some((button) => button.textContent?.trim() === "Cocheras" && button.getAttribute("aria-pressed") === "true"),
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
await desktopPage.close();

const mobilePage = await preparePage({ width: 390, height: 844 });
await mobilePage.evaluate(() => {
  const filters = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.includes("Filtros"));
  filters?.click();
});
await mobilePage.waitForFunction(() => Array.from(document.querySelectorAll("button")).some((button) => button.textContent?.trim() === "Cocheras"));
await mobilePage.evaluate(() => {
  const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent?.trim() === "Cocheras");
  button?.click();
});
await mobilePage.waitForFunction(() => document.querySelectorAll("[data-lot-id]").length === 138, { timeout: 10_000 });
const mobile = await mobilePage.evaluate(() => ({
  parkingPaths: document.querySelectorAll("[data-lot-id]").length,
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  parkingFilterPressed: Array.from(document.querySelectorAll("button"))
    .some((button) => button.textContent?.trim() === "Cocheras" && button.getAttribute("aria-pressed") === "true"),
}));
await mobilePage.close();
await browser.close();

const report = { desktopInventory, desktopFiltered, mobile, errors };
console.log(JSON.stringify(report, null, 2));

if (
  desktopInventory.allLotsRendered !== 450
  || !desktopInventory.hasResidentialCount
  || !desktopInventory.hasParkingCount
  || !desktopInventory.hasDimensions
  || desktopFiltered.parkingPaths !== 138
  || !desktopFiltered.selectedParking
  || !desktopFiltered.parkingFilterPressed
  || desktopFiltered.horizontalOverflow > 1
  || mobile.parkingPaths !== 138
  || !mobile.parkingFilterPressed
  || mobile.horizontalOverflow > 1
  || errors.length > 0
) process.exitCode = 1;
