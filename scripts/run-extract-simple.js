/* Run extractionRules.extractFieldsFromText on extracted PDF text and print JSON result */
const fs = require('fs')
require('ts-node/register/transpile-only')
const { extractFieldsFromText } = require('../app/lib/extractionRules')

const path = process.argv[2]
const type = process.argv[3] || '1040'
if (!path) { console.error('Usage: node scripts/run-extract-simple.js <text-file> [type]'); process.exit(1) }
const text = fs.readFileSync(path, 'utf8')
const fields = extractFieldsFromText(text, type)
console.log(JSON.stringify(fields, null, 2))
