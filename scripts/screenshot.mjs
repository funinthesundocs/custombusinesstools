import { chromium } from 'playwright';

const targets = [
  { url: 'https://aboitizconstructioninc.com', name: '01-aboitiz-construction-homepage.png' },
  { url: 'https://aboitizconstructioninc.com/who-we-are', name: '02-aboitiz-construction-who-we-are.png' },
  { url: 'https://aboitizconstructioninc.com/capabilities', name: '03-aboitiz-construction-capabilities.png' },
  { url: 'https://aboitizconstructioninc.com/track-record', name: '04-aboitiz-construction-track-record.png' },
  { url: 'https://aboitiz.com', name: '05-aboitiz-group-homepage.png' },
  { url: 'https://aboitiz.com/our-businesses', name: '06-aboitiz-group-our-businesses.png' },
  { url: 'https://aboitiz.com/about-us', name: '07-aboitiz-group-about-us.png' },
  { url: 'https://genluiching.com', name: '08-gmc-homepage.png' },
  { url: 'https://bhp.com', name: '09-bhp-homepage.png' },
  { url: 'https://rio-tinto.com', name: '10-rio-tinto-homepage.png' },
  { url: 'https://newmontcorp.com', name: '11-newmont-homepage.png' },
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
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30000 });
    // Extra wait for lazy-loaded content and animations
    await page.waitForTimeout(3000);
    // Scroll to bottom to trigger lazy loading, then back to top
    await page.evaluate(async () => {
      const delay = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < document.body.scrollHeight; i += 500) {
        window.scrollTo(0, i);
        await delay(100);
      }
      window.scrollTo(0, 0);
      await delay(500);
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${outputDir}/${target.name}`, fullPage: true });
    console.log(`  ✓ Saved: ${target.name}`);
    await page.close();
  } catch (err) {
    console.error(`  ✗ Failed: ${target.url} — ${err.message}`);
  }
}

await browser.close();
console.log('\nDone.');
