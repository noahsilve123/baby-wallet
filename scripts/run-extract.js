/* eslint-disable @typescript-eslint/no-require-imports */
require('ts-node/register/transpile-only')
const fs = require('fs')
const { extractFieldsFromText } = require('../app/lib/extractionRules')

const path = process.argv[2] || 'tmp_pdf_text.txt'
const type = process.argv[3] || '1040'
const text = fs.readFileSync(path, 'utf8')
const fields = extractFieldsFromText(text, type)
console.log(JSON.stringify(fields, null, 2))

if (type === '1040') {
	const incomeBlocks = Array.from(text.matchAll(/((?:(?:-?\(?\d[\d,]{2,}\)?|0)\s+){6,20})/g))
	const scoredIncome = incomeBlocks
		.map((b) => {
			const tokens = b[0].match(/-?\(?\d[\d,]{2,}\)?|0/g) ?? []
			const cleaned = tokens
				.map((n) => n.replace(/[ ,\$()\.]/g, ''))
				.filter((val) => {
					if (!val || /^-\d{4}$/.test(val)) return false
					const digits = val.replace(/[^0-9]/g, '')
					return digits.length >= 3 && digits.length <= 6
				})
			if (!cleaned.length) return null
			const numeric = cleaned.map((v) => Math.abs(Number(v))).filter(Number.isFinite)
			const maxVal = Math.max(...numeric)
			if (maxVal > 150000) return null
			const hasIncomeSized = numeric.some((v) => v >= 30000 && v <= 90000)
			if (!hasIncomeSized) return null
			const sum = cleaned.reduce((acc, val) => acc + Math.abs(Number(val)), 0)
			return { cleaned, sum }
		})
		.filter((b) => b && b.cleaned && b.cleaned.length >= 6)
	const bestIncome = scoredIncome.reduce((prev, curr) => (curr.sum > prev.sum ? curr : prev), scoredIncome[0] ?? { cleaned: [] })
	console.log('DEBUG income block', bestIncome)

	const blocks = Array.from(text.matchAll(/((?:(?:-?\(?\d[\d,]{2,}\)?|0)\s+){8,25})/g))
	const withCounts = blocks.map((b) => ({ raw: b[0], count: (b[0].match(/-?\(?\d[\d,]{2,}\)?|0/g) ?? []).length }))
	const best = withCounts.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), withCounts[0])
	const rawNumbers = best.raw.match(/-?\(?\d[\d,]{2,}\)?|0/g) ?? []
	const numbers = rawNumbers
		.map((n) => n.replace(/[ ,\$()\.]/g, ''))
		.filter((val) => val && !/^-\d{4}$/.test(val))
	console.log('DEBUG numbers block', numbers)
}
