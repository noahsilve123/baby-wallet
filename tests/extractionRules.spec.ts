import { expect, test } from '@playwright/test'
import { extractFieldsFromText } from '../app/lib/extractionRules'

test('extracts key 1040 values', () => {
  const sample = `
    Form 1040
    1 Wages, salaries, tips 45,123
    11 Adjusted gross income (AGI) 50,987
    22 Total tax (Form 1040, line 22) (1,234)
    Household Size: 4
    Number in College: 2
  `

  const fields = extractFieldsFromText(sample, '1040')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('parent-wages')).toBe('45123')
  expect(value('parent-agi')).toBe('50987')
  expect(value('parent-us-tax-paid')).toBe('-1234')
  expect(value('household-size')).toBe('4')
  expect(value('number-in-college')).toBe('2')
})

test('extracts W-2 box values', () => {
  const sample = `
    W-2 Wage and Tax Statement
    Box 1 Wages, tips, other comp 32,500.55
    Box 2 Federal income tax withheld 4,000
    3 Social security wages 34000
    12a D 500
  `

  const fields = extractFieldsFromText(sample, 'W-2')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('parent-wages')).toBe('32500.55')
  expect(value('parent-us-tax-paid')).toBe('4000')
  expect(value('parent-untaxed-income')).toBe('500')
})

test('extracts W-2 values with decimals and codes', () => {
  const sample = `
    2023 Form W-2 Wage and Tax Statement
    Box1: $18,234.75
    Box 2: $987.65
    3 Social security wages 18,234.75
    12c D 750.50
  `

  const fields = extractFieldsFromText(sample, 'W-2')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('parent-wages')).toBe('18234.75')
  expect(value('parent-us-tax-paid')).toBe('987.65')
  expect(value('parent-untaxed-income')).toBe('750.50')
})

test('normalizes student identity fields', () => {
  const sample = `
    Student Name: Alex Q. Doe
    Student SSN: 123 45 6789
    DOB: 1/2/2003
  `

  const fields = extractFieldsFromText(sample, 'Other')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('student-legal-name')).toBe('Alex Q. Doe')
  expect(value('student-ssn')).toBe('123-45-6789')
  expect(value('student-dob')).toBe('01/02/2003')
})

test('prefers 1040 line 24 total tax when available', () => {
  const sample = `
    Form 1040 (2023)
    1 Wages, salaries, tips 39,151
    11 Adjusted gross income 62,544
    22 Total tax (Form 1040, line 22) 876
    24 Total tax 4,395
  `

  const fields = extractFieldsFromText(sample, '1040')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('parent-wages')).toBe('39151')
  expect(value('parent-agi')).toBe('62544')
  expect(value('parent-us-tax-paid')).toBe('4395')
})

test('handles 2024 1040 layout with line 1z and Schedule 1 references', () => {
  const sample = `
    Form 1040 2024 U.S. Individual Income Tax Return
    1 aTotal amount from Form(s) W-2, box 1 52,400
    1z Add lines 1a through 1h 52,400
    8 Additional income from Schedule 1, line 10 1,200
    9 Add lines 1z, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income 53,600
    10 Adjustments to income from Schedule 1, line 26 800
    11 Subtract line 10 from line 9. This is your adjusted gross income 52,800
    22 Total tax (Form 1040, line 22) 1,234
    24 Total tax 1,876
  `

  const fields = extractFieldsFromText(sample, '1040')
  const value = (id: string) => fields.find((f) => f.questionId === id)?.value

  expect(value('parent-wages')).toBe('52400')
  expect(value('parent-agi')).toBe('52800')
  expect(value('parent-us-tax-paid')).toBe('1876')
})
