/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const pdf = require('pdf-parse')

async function main() {
  const path = process.argv[2]
  if (!path) {
    console.error('Usage: node scripts/extract-pdf.js <path>')
    process.exit(1)
  }
  const data = fs.readFileSync(path)
  const res = await pdf(data)
  console.log(res.text)
}

main().catch((err) => { console.error(err); process.exit(1) })
