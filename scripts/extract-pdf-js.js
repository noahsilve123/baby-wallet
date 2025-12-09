/* Lightweight PDF text extractor using pdfjs-dist (Node)
   Usage: node scripts/extract-pdf-js.js <path>
*/
const fs = require('fs')
;(async () => {
  const path = process.argv[2]
  if (!path) {
    console.error('Usage: node scripts/extract-pdf-js.js <path>')
    process.exit(1)
  }
  try {
    const pdfjs = require('pdfjs-dist/legacy/build/pdf')
    const data = fs.readFileSync(path)
    // disable worker in Node environment (pdfjs supports single-threaded parsing)
    try { pdfjs.GlobalWorkerOptions.disableWorker = true } catch (e) {}
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) })
    const pdf = await loadingTask.promise
    const maxPages = Math.min(pdf.numPages, 10)
    let out = ''
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((it) => it.str || '').join(' ')
      out += `\n--- page ${i} ---\n` + pageText + '\n'
    }
    process.stdout.write(out)
  } catch (err) {
    console.error('Extraction failed:', err)
    process.exit(2)
  }
})()
