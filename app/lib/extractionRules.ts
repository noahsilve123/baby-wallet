export type DocumentType = '1040' | 'W-2' | '1099' | 'SSN Letter' | 'Other'

export const documentTypeOptions: { label: string; value: DocumentType }[] = [
  { label: 'Form 1040', value: '1040' },
  { label: 'W-2', value: 'W-2' },
  { label: '1099', value: '1099' },
  { label: 'SSN letter', value: 'SSN Letter' },
  { label: 'Other', value: 'Other' },
]

export type ExtractedField = {
  questionId: string
  label: string
  value: string
  confidence: number
  source: string
}

type HeuristicRule = {
  questionId: string
  label: string
  patterns: RegExp[]
  valueTransform?: (value: string) => string
  confidence?: number
}

const summaryRules: HeuristicRule[] = [
  {
    questionId: 'student-legal-name',
    label: 'Student legal name',
    patterns: [
      /Student\s+Name[:\s]+([A-Za-z][A-Za-z\s\.'-]{1,60})/i,
      /Student\s+Information[\s:]+Name[:\s]+([A-Za-z][A-Za-z\s\.'-]{1,60})/i,
    ],
    valueTransform: normalizeName,
    confidence: 0.95,
  },
  {
    questionId: 'student-ssn',
    label: 'Student Social Security Number',
    patterns: [
      /Student\s+SSN[:\s#-]*([0-9\s-]{9,11})/i,
      /SSN[:\s#-]*([0-9\s-]{9,11})/i,
      /(\d{3}-\d{2}-\d{4})/,
    ],
    valueTransform: normalizeSsn,
    confidence: 0.95,
  },
  {
    questionId: 'student-dob',
    label: 'Student date of birth',
    patterns: [
      /(Date\s+of\s+Birth|DOB)[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
      /(DOB)[:\s]+([0-9]{2}[0-9]{2}[0-9]{4})/i,
    ],
    valueTransform: normalizeDate,
    confidence: 0.9,
  },
  {
    questionId: 'parent-agi',
    label: 'Adjusted Gross Income',
    patterns: [
      /Adjusted\s+Gross\s+Income[^0-9]*([\d,\.]+)/i,
      /AGI[^0-9]*([\d,\.]+)/i,
    ],
    valueTransform: cleanCurrency,
    confidence: 0.85,
  },
  {
    questionId: 'parent-wages',
    label: 'Parent wages, salaries, tips',
    patterns: [
      /Wages(?:,\s*salaries,\s*tips)?[^0-9]*([\d,\.]+)/i,
      /Earned\s+Income[^0-9]*([\d,\.]+)/i,
    ],
    valueTransform: cleanCurrency,
    confidence: 0.8,
  },
  {
    questionId: 'parent-us-tax-paid',
    label: 'Parent total tax',
    patterns: [
      /Total\s+Tax[^0-9]*([\d,\.]+)/i,
      /Tax\s+Liability[^0-9]*([\d,\.]+)/i,
    ],
    valueTransform: cleanCurrency,
    confidence: 0.8,
  },
  {
    questionId: 'household-size',
    label: 'Household size',
    patterns: [
      /Household\s+Size[^0-9]*([0-9]+)/i,
      /Number\s+in\s+Household[^0-9]*([0-9]+)/i,
    ],
    confidence: 0.7,
  },
  {
    questionId: 'number-in-college',
    label: 'Number in college',
    patterns: [
      /Number\s+in\s+College[^0-9]*([0-9]+)/i,
      /College\s+Students[^0-9]*([0-9]+)/i,
    ],
    confidence: 0.7,
  },
]

const docTypeRules: Record<DocumentType, HeuristicRule[]> = {
  '1040': [
    {
      questionId: 'parent-agi',
      label: 'Adjusted Gross Income (1040 line 11)',
      patterns: [/11\s+Adjusted\s+gross\s+income[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
      confidence: 0.95,
    },
    {
      questionId: 'parent-us-tax-paid',
      label: 'Total tax (1040 line 22)',
      patterns: [/22\s+Total\s+tax[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
    },
    {
      questionId: 'parent-wages',
      label: 'Wages, salaries, tips (1040 line 1)',
      patterns: [/1\s+Wages[\s,]+salaries[\s,]+tips[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
    },
  ],
  'W-2': [
    {
      questionId: 'parent-wages',
      label: 'Box 1 wages',
      patterns: [/Box\s*1[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
      confidence: 0.9,
    },
    {
      questionId: 'parent-us-tax-paid',
      label: 'Box 2 federal income tax withheld',
      patterns: [/Box\s*2[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
    },
    {
      questionId: 'parent-wages',
      label: 'Line 3 social security wages',
      patterns: [/3\s+Social\s+security\s+wages[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
    },
    {
      questionId: 'parent-untaxed-income',
      label: 'Box 12 retirement contributions',
      patterns: [/12[a-d]?\s*[A-Z]?[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
    },
  ],
  '1099': [
    {
      questionId: 'parent-untaxed-income',
      label: '1099 distributions (Box 1)',
      patterns: [/Box\s*1[^0-9]*([\d,\.]+)/i],
      valueTransform: cleanCurrency,
      confidence: 0.85,
    },
  ],
  'SSN Letter': [
    {
      questionId: 'student-ssn',
      label: 'Social Security Number',
      patterns: [/\b(\d{3}-\d{2}-\d{4})\b/],
      valueTransform: normalizeSsn,
      confidence: 0.98,
    },
  ],
  Other: [],
}

const DOCUMENT_TYPES: DocumentType[] = ['1040', 'W-2', '1099', 'SSN Letter', 'Other']

export function isDocumentType(value: string): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType)
}

export function extractFieldsFromText(text: string, docType: DocumentType = 'Other'): ExtractedField[] {
  const normalized = normalizeWhitespace(text)
  const combined = [
    ...applyRules(normalized, summaryRules, 'summary'),
    ...applyRules(normalized, docTypeRules[docType] ?? [], docType),
  ]
  return dedupeByQuestion(combined)
}

function applyRules(text: string, rules: HeuristicRule[], source: string): ExtractedField[] {
  const results: ExtractedField[] = []
  rules.forEach((rule, index) => {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern)
      const candidate = match?.[2] ?? match?.[1]
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

function dedupeByQuestion(fields: ExtractedField[]): ExtractedField[] {
  const map = new Map<string, ExtractedField>()
  fields.forEach((field) => {
    const key = `${field.questionId}:${field.value}`
    const existing = map.get(key)
    if (!existing || field.confidence > existing.confidence) {
      map.set(key, field)
    }
  })
  return Array.from(map.values())
}

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

function tidyValue(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

function cleanCurrency(value: string) {
  const cleaned = value.replace(/[,\s\$]/g, '')
  const match = cleaned.match(/-?\d+(?:\.\d+)?/)
  return match ? match[0] : ''
}

function normalizeSsn(value: string) {
  const digits = value.replace(/[^0-9]/g, '')
  if (digits.length !== 9) return ''
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

function normalizeName(value: string) {
  return value.replace(/[^A-Za-z\s\.'-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeDate(value: string) {
  const digits = value.replace(/[^0-9]/g, '')
  if (digits.length === 8) {
    const month = digits.slice(0, 2)
    const day = digits.slice(2, 4)
    const year = digits.slice(4)
    return `${month}/${day}/${year}`
  }
  return value.replace(/\s+/g, '').replace(/-/g, '/').trim()
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0.6
  if (value < 0) return 0
  if (value > 1) return 1
  return Number(value.toFixed(2))
}
