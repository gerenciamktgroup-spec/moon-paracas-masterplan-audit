import puppeteer from 'puppeteer';
import path from 'node:path';

const artifactDir = "C:/Users/LENOVO/.gemini/antigravity-ide/brain/ad7f10e7-6a76-401a-a53f-be69096efbc8";
const baseUrl = "http://localhost:3000/simulador";

console.log("Capturing full screen of /simulador...");
const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1440, height: 950, deviceScaleFactor: 2 }
});

const page = await browser.newPage();
await page.goto(baseUrl, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));

await page.screenshot({ path: path.join(artifactDir, 'current_simulator_state.png'), fullPage: false });

console.log("Saved current_simulator_state.png");
await browser.close();
