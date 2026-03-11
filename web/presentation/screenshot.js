const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

    await page.goto('http://localhost:3001/presentation', {
        waitUntil: 'networkidle',
        timeout: 30000
    });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'C:/tmp/pres-s1.png' });
    console.log('Section 1 done');

    await page.evaluate(() => {
        const el = document.querySelector('[data-section="1"]');
        if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'C:/tmp/pres-s2.png' });
    console.log('Section 2 done');

    await page.evaluate(() => {
        const el = document.querySelector('[data-section="5"]');
        if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'C:/tmp/pres-s6.png' });
    console.log('Section 6 done');

    await browser.close();
    console.log('All done');
})();
