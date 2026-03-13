import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * PDF to Image converter — KOP Template
 *
 * Configure the pdfs array below for each deployment.
 * Paths are relative to the project root (C:/Antigravity/Custombusinesstools/).
 *
 * REPLACE the items in the pdfs array with your actual source documents.
 * Output paths are relative to the presentation site's public/ directory.
 *
 * Example:
 * {
 *   src: 'intelligence/raw/source/technical/assay-report.pdf',
 *   out: 'web/presentation/public/images/evidence/assay-report.png',
 * }
 */

const projectRoot = path.resolve(new URL(import.meta.url).pathname, '../../');

const pdfs = [
  // REPLACE — add your PDF source paths and output image paths here
  // {
  //   src: path.join(projectRoot, 'intelligence/raw/source/technical/REPLACE.pdf'),
  //   out: path.join(projectRoot, 'web/presentation/public/images/evidence/REPLACE.png'),
  // },
];

if (pdfs.length === 0) {
  console.log('No PDFs configured. Edit scripts/pdf-to-img.mjs to add source documents.');
  process.exit(0);
}

const browser = await chromium.launch();

for (const { src, out } of pdfs) {
  console.log(`Converting: ${src}`);
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  const pdfBytes = readFileSync(src);
  const b64 = pdfBytes.toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        body { background: white; display: flex; justify-content: center; }
        canvas { display: block; }
      </style>
    </head>
    <body>
      <canvas id="canvas"></canvas>
      <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        async function render() {
          const data = atob('${b64}');
          const uint8 = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) uint8[i] = data.charCodeAt(i);

          const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
          const pg = await pdf.getPage(1);
          const scale = 2.5;
          const viewport = pg.getViewport({ scale });
          const canvas = document.getElementById('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await pg.render({ canvasContext: ctx, viewport }).promise;
          document.body.dataset.done = 'true';
        }
        render();
      </script>
    </body>
    </html>
  `, { waitUntil: 'networkidle' });

  await page.waitForFunction(() => document.body.dataset.done === 'true', { timeout: 15000 });
  await page.waitForTimeout(500);

  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: out });
  console.log(`  → ${out}`);
  await page.close();
}

await browser.close();
console.log('Done.');
