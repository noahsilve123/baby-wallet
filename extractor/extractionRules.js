// Ported from app/lib/extractionRules.ts (simplified JS)

const DOCUMENT_TYPES = ['1040', 'W-2', '1099', 'SSN Letter', 'Other']

function isDocumentType(value) {
  return DOCUMENT_TYPES.includes(value)
}

function extractFieldsFromText(text, docType = 'Other') {
  const normalized = normalizeWhitespace(text || '')
  const combined = [
    ...applyRules(normalized, summaryRules, 'summary'),
    ...applyRules(normalized, docTypeRules[docType] || [], docType),
    ...(docType === '1040' ? extract1040IncomeBlock(normalized) : []),
    ...(docType === '1040' ? extract1040TaxBlock(normalized) : []),
  ]
  return dedupeByQuestion(combined)
}

function applyRules(text, rules, source) {
  const results = []
  rules.forEach((rule, index) => {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern)
      const candidate = match && (match[2] || match[1])
      if (!candidate) continue
      const cleaned = rule.valueTransform ? rule.valueTransform(candidate) : tidyValue(candidate)
      if (!cleaned) continue
      results.push({
        questionId: rule.questionId,
        label: rule.label,
        value: cleaned,
        confidence: clampConfidence(rule.confidence ?? Math.max(0.6, 0.95 - index * 0.1)),
        source,
      })
      break
    }
  })
  return results
}

function dedupeByQuestion(fields) {
  const map = new Map()
  fields.forEach((field) => {
    const existing = map.get(field.questionId)
    if (!existing || field.confidence > existing.confidence) map.set(field.questionId, field)
  })
  return Array.from(map.values())
}

function normalizeWhitespace(input) {
  return (input || '').replace(/\s+/g, ' ').trim()
}

function tidyValue(input) {
  return (input || '').replace(/\s+/g, ' ').trim()
}

function extract1040TaxBlock(text) {
  const blocks = Array.from(text.matchAll(/((?:(?:-?\(?\d[\d,]{2,}\)?|0)\s+){8,25})/g))
  if (!blocks.length) return []
  const withCounts = blocks.map((b) => ({ raw: b[0], count: (b[0].match(/-?\(?\d[\d,]{2,}\)?|0/g) || []).length }))
  const best = withCounts.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), withCounts[0])
  const rawNumbers = best.raw.match(/-?\(?\d[\d,]{2,}\)?|0/g) || []
  const numbers = rawNumbers
    .map((token) => {
      const cleaned = cleanCurrency(token, 3)
      if (!cleaned) return ''
      const looksLikeSsnFragment = /^-\d{4}$/.test(cleaned)
      return looksLikeSsnFragment ? '' : cleaned
    })
    .filter(Boolean)
  if (numbers.length < 8) return []
  const preferred = numbers[7] || numbers[5]
  if (!preferred) return []
  return [
    { questionId: 'parent-us-tax-paid', label: 'Total tax (1040)', value: preferred, confidence: numbers[7] ? 0.84 : 0.8, source: '1040' },
  ]
}

function extract1040IncomeBlock(text) {
  const blocks = Array.from(text.matchAll(/((?:(?:-?\(?\d[\d,]{2,}\)?|0)\s+){6,20})/g))
  if (!blocks.length) return []
  const scored = blocks
    .map((b) => {
      const tokens = b[0].match(/-?\(?\d[\d,]{2,}\)?|0/g) || []
      const cleaned = tokens
        .map((token) => cleanCurrency(token, 3))
        .filter((val) => {
          if (!val || /^-\d{4}$/.test(val)) return false
          const digits = val.replace(/[^0-9]/g, '')
          if (!digits) return false
          if (digits.length > 6) return false
          return true
        })
      if (!cleaned.length) return null
      const numeric = cleaned.map((v) => Math.abs(Number(v))).filter(Number.isFinite)
      const maxVal = Math.max(...numeric)
      if (maxVal > 150000) return null
      const hasIncomeSized = numeric.some((v) => v >= 30000 && v <= 90000)
      if (!hasIncomeSized) return null
      const sum = cleaned.reduce((acc, val) => acc + Math.abs(Number(val)), 0)
      return { raw: b[0], cleaned, sum }
    })
    .filter((b) => Boolean(b && b.cleaned && b.cleaned.length >= 6))
  if (!scored.length) return []
  const best = scored.reduce((prev, curr) => (curr.sum > prev.sum ? curr : prev), scored[0])
  const numbers = best.cleaned
  const fields = []
  if (numbers[0]) fields.push({ questionId: 'parent-wages', label: 'Parent wages, salaries, tips', value: numbers[0], confidence: 0.9, source: '1040' })
  if (numbers[5]) fields.push({ questionId: 'parent-agi', label: 'Adjusted Gross Income (1040 line 11)', value: numbers[5], confidence: 0.93, source: '1040' })
  return fields
}

function cleanCurrency(value, minDigits = 1, keepDecimal = false) {
  const matches = String(value).match(/-?\(?\d[\d,]*(?:\.\d{1,2})?\)?/g)
  if (!matches || matches.length === 0) return ''
  const token = matches[matches.length - 1]
  const hasParens = /^\(.*\)$/.test(token)
  const stripped = token.replace(/[ ,\$()]/g, '')
  const cleaned = keepDecimal ? stripped : stripped.replace(/\./g, '')
  if (!cleaned) return ''
  const digitsOnly = cleaned.replace(/[^0-9]/g, '')
  if (digitsOnly.length < minDigits) return ''
  return hasParens ? `-${cleaned}` : cleaned
}

function normalizeSsn(value) {
  const digits = String(value).replace(/[^0-9]/g, '')
  if (digits.length !== 9) return ''
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

function normalizeName(value) {
  return String(value).replace(/[^A-Za-z\s\.'-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeDate(value) {
  const normalized = String(value).trim()
  const parts = normalized.split(/[\/\-]/).filter(Boolean)
  if (parts.length === 3) {
    const [monthRaw, dayRaw, yearRaw] = parts
    const month = monthRaw.padStart(2, '0')
    const day = dayRaw.padStart(2, '0')
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw
    return `${month}/${day}/${year}`
  }
  const digits = normalized.replace(/[^0-9]/g, '')
  if (digits.length === 8) {
    const month = digits.slice(0, 2)
    const day = digits.slice(2, 4)
    const year = digits.slice(4)
    return `${month}/${day}/${year}`
  }
  return normalized.replace(/\s+/g, '').replace(/-/g, '/').trim()
}

function clampConfidence(value) {
  if (!Number.isFinite(value)) return 0.6
  if (value < 0) return 0
  if (value > 1) return 1
  return Number(value.toFixed(2))
}

const moneyKeywords = ['income', 'wage', 'tax', 'agi', 'deduction', 'benefit', 'withheld', 'distribution']

module.exports = {
  isDocumentType,
  extractFieldsFromText,
  cleanCurrency,
  normalizeSsn,
  normalizeName,
  normalizeDate,
  clampConfidence,
  moneyKeywords,
}

// -- RULES definitions (kept near original source) --
const documentTypeOptions = [
  { label: 'Form 1040', value: '1040' },
  { label: 'W-2', value: 'W-2' },
  { label: '1099', value: '1099' },
  { label: 'SSN letter', value: 'SSN Letter' },
  { label: 'Other', value: 'Other' },
]

const summaryRules = [
  {
    questionId: 'student-legal-name',
    label: 'Student legal name',
    patterns: [
      /Student\s+Name[:\s]+([A-Za-z][A-Za-z\s\.'-]{1,60}?)(?=\s*(?:Student\s+SSN|SSN|DOB|Date|$))/i,
      /Student\s+Information[\s:]+Name[:\s]+([A-Za-z][A-Za-z\s\.'-]{1,60}?)(?=\s*(?:Student\s+SSN|SSN|DOB|Date|$))/i,
    ],
    valueTransform: normalizeName,
    confidence: 0.95,
  },
  {
    questionId: 'student-ssn',
    label: 'Student Social Security Number',
    patterns: [/Student\s+SSN[:\s#-]*([0-9\s-]{9,11})/i, /SSN[:\s#-]*([0-9\s-]{9,11})/i, /(\d{3}-\d{2}-\d{4})/],
    valueTransform: normalizeSsn,
    confidence: 0.95,
  },
  {
    questionId: 'student-dob',
    label: 'Student date of birth',
    patterns: [/(Date\s+of\s+Birth|DOB)[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i, /(DOB)[:\s]+([0-9]{2}[0-9]{2}[0-9]{4})/i],
    valueTransform: normalizeDate,
    confidence: 0.9,
  },
  {
    questionId: 'parent-agi',
    label: 'Adjusted Gross Income',
    patterns: [ /Adjusted\s+Gross\s+Income(?:\s*\(AGI\))?\s+(-?\(?\d[\d,.]*\)?)/i, /AGI[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /\b11\s+Adjusted\s+gross\s+income[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /Line\s*11[^0-9-]*Adjusted\s+gross\s+income[^0-9-]*(-?\(?\d[\d,.]*\)?)/i ],
    valueTransform: (v) => cleanCurrency(v, 3),
    confidence: 0.85,
  },
  {
    questionId: 'parent-wages',
    label: 'Parent wages, salaries, tips',
    patterns: [/Wages(?:,\s*salaries,\s*tips)?\s+(-?\(?\d[\d,.]*\)?)/i, /Earned\s+Income\s+(-?\(?\d[\d,.]*\)?)/i, /Line\s*1[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /Total\s+amount\s+from\s+Form\(s\)\s+W-2[^0-9-]*(-?\(?\d[\d,.]*\)?)/i],
    valueTransform: (v) => cleanCurrency(v, 3),
    confidence: 0.8,
  },
  {
    questionId: 'parent-us-tax-paid',
    label: 'Parent total tax',
    patterns: [/Total\s+Tax[^\d]*\(.*?\)\s*(-?\(?\d[\d,.]*\)?)/i, /Total\s+Tax[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /Tax\s+Liability[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /Line\s*22[^0-9-]*(-?\(?\d[\d,.]*\)?)/i],
    valueTransform: (v) => cleanCurrency(v, 3),
    confidence: 0.8,
  },
  { questionId: 'household-size', label: 'Household size', patterns: [/Household\s+Size[^0-9]*([0-9]+)/i, /Number\s+in\s+Household[^0-9]*([0-9]+)/i], confidence: 0.7 },
  { questionId: 'number-in-college', label: 'Number in college', patterns: [/Number\s+in\s+College[^0-9]*([0-9]+)/i, /College\s+Students[^0-9]*([0-9]+)/i], confidence: 0.7 },
]

const docTypeRules = {
  '1040': [
    { questionId: 'parent-agi', label: 'Adjusted Gross Income (1040 line 11)', patterns: [/\b11\s+Adjusted\s+gross\s+income[\s\S]{0,40}?(-?\(?\d[\d,.]*\)?)/i, /Adjusted\s+Gross\s+Income[^0-9-]*line\s*11[\s\S]{0,40}?(-?\(?\d[\d,.]*\)?)/i, /adjusted\s+gross\s+income[\s\S]{0,40}?(-?\(?\d[\d,.]*\)?)/i], valueTransform: (v) => cleanCurrency(v, 3), confidence: 0.95 },
    { questionId: 'parent-us-tax-paid', label: 'Total tax (1040)', patterns: [/\b24\s+Total\s+tax[\s\S]{0,40}?(-?\(?\d[\d,.]*\)?)/i, /\b22\s+Total\s+tax[^0-9-]*\(.*?\)\s*(-?\(?\d[\d,.]*\)?)/i, /Total\s+tax[^\d]*line\s*22[\s\S]{0,30}?(-?\(?\d[\d,.]*\)?)/i, /Total\s+tax[^0-9-]*(-?\(?\d[\d,.]*\)?)/i], valueTransform: (v) => cleanCurrency(v, 3), confidence: 0.92 },
    { questionId: 'parent-wages', label: 'Wages, salaries, tips (1040 line 1)', patterns: [/\b1\s+Wages[\s,]+salaries[\s,]+tips[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /Line\s*1\s*Wages[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /1[a-z]?\s*Total\s+amount\s+from\s+Form\(s\)\s+W-2[^0-9-]*(-?\(?\d[\d,.]*\)?)/i, /1z\s+Add\s+lines\s+1a\s+through\s+1h[^0-9-]*(-?\(?\d[\d,.]*\)?)/i], valueTransform: cleanCurrency, confidence: 0.9 },
  ],
  'W-2': [
    { questionId: 'parent-wages', label: 'Box 1 wages', patterns: [/Box\s*1[^0-9]*([\d,\.]+)/i], valueTransform: (v) => cleanCurrency(v, 1, true), confidence: 0.9 },
    { questionId: 'parent-us-tax-paid', label: 'Box 2 federal income tax withheld', patterns: [/Box\s*2[^0-9]*([\d,\.]+)/i], valueTransform: (v) => cleanCurrency(v, 1, true) },
    { questionId: 'parent-wages', label: 'Line 3 social security wages', patterns: [/3\s+Social\s+security\s+wages[^0-9]*([\d,\.]+)/i], valueTransform: (v) => cleanCurrency(v, 1, true) },
    { questionId: 'parent-untaxed-income', label: 'Box 12 retirement contributions', patterns: [/12[a-d]?\s*[A-Z]?[^0-9]*([\d,\.]+)/i], valueTransform: (v) => cleanCurrency(v, 1, true) },
  ],
  '1099': [ { questionId: 'parent-untaxed-income', label: '1099 distributions (Box 1)', patterns: [/Box\s*1[^0-9]*([\d,\.]+)/i], valueTransform: cleanCurrency, confidence: 0.85 } ],
  'SSN Letter': [ { questionId: 'student-ssn', label: 'Social Security Number', patterns: [/\b(\d{3}-\d{2}-\d{4})\b/], valueTransform: normalizeSsn, confidence: 0.98 } ],
  Other: [],
}

module.exports.documentTypeOptions = documentTypeOptions
module.exports.summaryRules = summaryRules
module.exports.docTypeRules = docTypeRules
