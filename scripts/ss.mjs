import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.evaluate(() => window.scrollTo(0, window.innerHeight - 100));
await page.waitForTimeout(800);

await page.screenshot({ path: 'C:/tmp/metrics-default.png' });

const names = ['red', 'blue', 'orange', 'teal', 'red2', 'blue2'];
const cards = await page.$$('.metric-card');
for (let i = 0; i < Math.min(6, cards.length); i++) {
  await cards[i].hover();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `C:/tmp/metric-${names[i]}.png` });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
}

await browser.close();
