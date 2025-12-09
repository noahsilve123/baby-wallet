/* Automate the client OCR page using Playwright (runs in Node).
   Steps:
   - Assumes a dev server is available at http://localhost:3000
   - Navigates to /ai-extract, uploads a PDF and waits for extracted text
   - Prints the extracted text to stdout
*/
const fs = require('fs')
;(async () => {
  const { chromium } = require('playwright')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.on('console', (m) => console.log('[page]', m.text()))
  page.on('pageerror', (err) => console.log('[pageerror]', err && err.message))
  const url = process.env.URL || 'http://localhost:3000/ai-extract'
  console.log('Opening', url)
  await page.goto(url, { waitUntil: 'networkidle' })

  // Wait for file input to appear
  const fileInput = await page.waitForSelector('input[type=file]', { timeout: 30_000 })
  const filePath = process.argv[2] || 'tmp_f1040.pdf'
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath)
    process.exit(2)
  }

  // Upload file
  await fileInput.setInputFiles(filePath)
  console.log('Uploaded', filePath)

  // Wait for either extracted textarea or error message
  let text = ''
  try {
    // Wait for the textarea containing extracted text to appear and be non-empty
    const ta = await page.waitForSelector('textarea[readonly], .ai-extract-client textarea', { timeout: 30_000 })
    // Poll until text content appears or timeout
    const start = Date.now()
    while (Date.now() - start < 180_000) {
      text = await ta.evaluate((el) => el.value || el.textContent || '')
      if (text && text.trim().length > 50) break
      await new Promise((r) => setTimeout(r, 1000))
    }
  } catch (err) {
    // try to read any visible error message
    try {
      const errEl = await page.$('.ai-extract-client .text-red-600')
      if (errEl) text = 'ERROR: ' + (await errEl.textContent())
    } catch (_) {}
    // save debug artifacts
    try {
      await page.screenshot({ path: 'ocr-debug.png', fullPage: true })
      const html = await page.content()
      require('fs').writeFileSync('ocr-debug.html', html, 'utf8')
      console.log('Saved ocr-debug.png and ocr-debug.html')
    } catch (e) { console.warn('Failed saving debug artifacts', e) }
  }

  console.log('\n--- OCR Result ---\n')
  console.log(text || '(no extracted text)')
  console.log('\n--- END ---')

  await browser.close()
})().catch((err) => { console.error(err); process.exit(1) })
