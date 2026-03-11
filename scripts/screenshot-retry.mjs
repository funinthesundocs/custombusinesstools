import { chromium } from 'playwright';

const targets = [
  { url: 'https://www.aboitiz.com/', name: '05-aboitiz-group-homepage.png' },
  { url: 'https://www.bhp.com/', name: '09-bhp-homepage.png' },
  { url: 'https://www.riotinto.com/', name: '10-rio-tinto-homepage.png' },
  { url: 'https://www.newmont.com/', name: '11-newmont-homepage.png' },
];

const outputDir = 'web/presentation/public/images/reference';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});

for (const target of targets) {
  try {
    const page = await context.newPage();
    console.log(`Capturing: ${target.url}`);
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    // Scroll to trigger lazy loading
    await page.evaluate(async () => {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 500) {
        window.scrollTo(0, i);
        await delay(100);
      }
      window.scrollTo(0, 0);
      await delay(500);
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${outputDir}/${target.name}`, fullPage: true });
    console.log(`  ✓ Saved: ${target.name}`);
    await page.close();
  } catch (err) {
    console.error(`  ✗ Failed: ${target.url} — ${err.message}`);
  }
}

await browser.close();
console.log('\nDone.');
