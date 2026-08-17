import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = "http://localhost:3000/simulador";
const outputDir = "C:/Users/LENOVO/.gemini/antigravity/brain/3bca6de6-853f-445c-add9-4bbb421f06d2/scratch/artifacts/";
await mkdir(outputDir, { recursive: true });

console.log("Launching browser...");
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const logs = [];
page.on('console', msg => {
  logs.push(`[Console ${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', err => {
  logs.push(`[Page Error] ${err.message}`);
});
page.on('requestfailed', req => {
  logs.push(`[Request Failed] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
});

console.log(`Navigating to ${baseUrl}...`);
await page.goto(baseUrl, { waitUntil: 'networkidle2' });

console.log("Waiting 10 seconds...");
await new Promise(resolve => setTimeout(resolve, 10000));

console.log("Taking screenshot...");
await page.screenshot({ path: path.join(outputDir, 'simulador-check.png') });

console.log("\n--- BROWSER LOGS ---");
logs.forEach(log => console.log(log));
console.log("--------------------\n");

const mapState = await page.evaluate(() => {
  const fallback = document.querySelector('[data-testid="map-fallback"]');
  const googleMap = document.querySelector('.gm-style');
  return {
    fallbackVisible: !!fallback,
    googleMapFound: !!googleMap,
    html: document.body.innerHTML.substring(0, 500)
  };
});
console.log("Map State in DOM:", mapState);

await browser.close();
console.log("Done.");
