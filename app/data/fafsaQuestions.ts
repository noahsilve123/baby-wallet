export type FAFSAQuestion = {
  id: string
  section: 'Student Basics' | 'Household & School Plans' | 'Parent Financials' | 'Student Financials' | 'Assets & Savings'
  prompt: string
  translator: string
  docHints: { doc: string; location: string; note?: string }[]
  helper?: string
  inputType: 'text' | 'number' | 'currency' | 'yesno'
}

export const fafsaQuestions: FAFSAQuestion[] = [
  {
    id: 'student-legal-name',
    section: 'Student Basics',
    prompt: 'What is the student\'s legal name as it appears on official documents?',
    translator: 'Match this to the name on the student\'s Social Security card so the FAFSA links to IRS and SSA records without delays.',
    docHints: [
      { doc: 'Social Security Card', location: 'Full legal name' },
      { doc: 'State ID or Passport', location: 'Name line', note: 'Use to confirm spelling if card is unavailable.' },
    ],
    helper: 'Do not use nicknames or preferred names here—stick to the legal record.',
    inputType: 'text',
  },
  {
    id: 'student-ssn',
    section: 'Student Basics',
    prompt: 'What is the student\'s Social Security Number?',
    translator: 'Type the 9-digit SSN with no spaces. If the student is not a U.S. citizen, use their Alien Registration Number instead.',
    docHints: [
      { doc: 'Social Security Card', location: 'SSN line' },
      { doc: 'I-551 / I-766', location: 'USCIS # or ARN', note: 'Enter only if no SSN exists.' },
    ],
    helper: 'Triple-check digits—incorrect SSNs delay IRS data retrieval and school matching.',
    inputType: 'text',
  },
  {
    id: 'student-email-phone',
    section: 'Student Basics',
    prompt: 'Student email address and mobile phone number',
    translator: 'Use contact info the student checks often; schools and the Department of Education will use it for updates.',
    docHints: [
      { doc: 'Phone settings', location: 'Current mobile number' },
      { doc: 'Email account', location: 'Primary inbox address' },
    ],
    inputType: 'text',
  },
  {
    id: 'student-dob',
    section: 'Student Basics',
    prompt: 'What is the student\'s date of birth?',
    translator: 'Use MM/DD/YYYY. This determines dependency pathways and auto-verifies against Social Security files.',
    docHints: [
      { doc: 'Birth Certificate', location: 'Date of Birth' },
      { doc: 'Passport', location: 'Date of Birth line' },
    ],
    inputType: 'text',
  },
  {
    id: 'student-citizenship',
    section: 'Student Basics',
    prompt: 'Is the student a U.S. citizen or eligible noncitizen?',
    translator: 'Eligible noncitizens include permanent residents and certain refugees; provide the document number when prompted.',
    docHints: [
      { doc: 'Passport or Birth Certificate', location: 'Nationality' },
      { doc: 'Green Card / I-94', location: 'USCIS / Admission number' },
    ],
    inputType: 'yesno',
  },
  {
    id: 'state-residency',
    section: 'Student Basics',
    prompt: 'What is the student\'s state of legal residence and when did they become a resident?',
    translator: 'Pick the state used for driver\'s license or tax filings. Residency length can affect state grant eligibility.',
    docHints: [
      { doc: 'Driver\'s License', location: 'Issued by state' },
      { doc: 'State Tax Return', location: 'Header', note: 'Confirms filing state.' },
    ],
    inputType: 'text',
  },
  {
    id: 'student-driver-license',
    section: 'Student Basics',
    prompt: "Driver's license number and issuing state (if any)",
    translator: 'Optional but helpful for identity verification. If the student never had a license, leave blank.',
    docHints: [
      { doc: 'Driver\'s License', location: 'Number + state' },
    ],
    inputType: 'text',
  },
  {
    id: 'college-grade-level',
    section: 'Household & School Plans',
    prompt: 'What will be the student\'s college grade level in 2025–26 and will they pursue their first bachelor\'s degree?',
    translator: 'Answer using the year the student will be enrolled during the FAFSA year (ex: first-year for new freshmen).',
    docHints: [
      { doc: 'School Counseling Plan', location: 'Grade level notes' },
    ],
    inputType: 'text',
  },
  {
    id: 'student-schools',
    section: 'Household & School Plans',
    prompt: 'List up to 20 colleges to receive the FAFSA information',
    translator: 'Enter each schools Federal School Code or search by name/state so they get the Student Aid Index.',
    docHints: [
      { doc: 'College list', location: 'School names + city/state', note: 'Use FAFSA school search if codes unknown.' },
    ],
    helper: 'Order does not matter for federal aid, but some states award grants based on listing order.',
    inputType: 'text',
  },
  {
    id: 'household-size',
    section: 'Household & School Plans',
    prompt: 'How many people are in the parent household?',
    translator: 'Count the student, parents, siblings/others the parents support more than 50%, and unborn children due during the award year.',
    docHints: [
      { doc: 'Most recent tax return', location: 'Dependents claimed', note: 'Start with dependents claimed on IRS Form 1040.' },
    ],
    helper: 'Only include people supported financially by the parent(s) who are not yet independent.',
    inputType: 'number',
  },
  {
    id: 'number-in-college',
    section: 'Household & School Plans',
    prompt: 'How many household members will attend college at least half time in 2025–26?',
    translator: 'Count the student and anyone else in the household-sized list enrolled half time or more in a degree/certificate program.',
    docHints: [
      { doc: 'College acceptance letters', location: 'Enrollment status', note: 'Use to verify siblings attending college.' },
    ],
    inputType: 'number',
  },
  {
    id: 'student-marital-status',
    section: 'Household & School Plans',
    prompt: 'What is the student\'s marital status as of today?',
    translator: 'Choose the current status, even if they plan to marry later. This affects contributor requirements.',
    docHints: [
      { doc: 'Marriage certificate', location: 'Date', note: 'Only needed if already married.' },
    ],
    inputType: 'text',
  },
  {
    id: 'parent-marital-status',
    section: 'Parent Financials',
    prompt: 'What is the parent marital status and date of status change?',
    translator: 'This determines which parent(s) must contribute information. Provide the date of marriage, divorce, or separation.',
    docHints: [
      { doc: 'Marriage license / divorce decree', location: 'Effective date' },
    ],
    inputType: 'text',
  },
  {
    id: 'parent-filing-status',
    section: 'Parent Financials',
    prompt: 'Did your parent(s) file a 2023 tax return? If so, which IRS filing status?',
    translator: 'Match exactly what is listed at the top of Form 1040 (Single, Married Filing Jointly, etc.).',
    docHints: [
      { doc: 'Form 1040 (Parent)', location: 'Line under name and address' },
    ],
    inputType: 'text',
  },
  {
    id: 'parent-identity',
    section: 'Parent Financials',
    prompt: 'Parent legal name, SSN, and date of birth',
    translator: 'Make sure parent info matches their IRS records for consent and data retrieval.',
    docHints: [
      { doc: 'Parent Social Security Card', location: 'Name + SSN' },
      { doc: 'Parent driver\'s license', location: 'Date of birth' },
    ],
    inputType: 'text',
  },
  {
    id: 'parent-agi',
    section: 'Parent Financials',
    prompt: 'Parent Adjusted Gross Income (AGI) for 2023',
    translator: 'This is the single most important number FAFSA needs—it\'s literally Form 1040, line 11.',
    docHints: [
      { doc: 'Form 1040', location: 'Line 11', note: 'Use the combined return if parents filed jointly.' },
    ],
    helper: 'If the parent did not file, enter 0 and be prepared to explain why (e.g., non-filer with income below threshold).',
    inputType: 'currency',
  },
  {
    id: 'parent-irs-consent',
    section: 'Parent Financials',
    prompt: 'Do the parent contributors consent to the IRS transferring tax data into FAFSA?',
    translator: 'Selecting “Approve” lets the IRS share the required line items. Without consent, FAFSA cannot calculate SAI.',
    docHints: [
      { doc: 'IRS account', location: 'Consent confirmation', note: 'No document upload—just agreement.' },
    ],
    inputType: 'yesno',
  },
  {
    id: 'parent-wages',
    section: 'Parent Financials',
    prompt: 'Parent wages, salaries, and tips from work (for each parent).',
    translator: 'Add up every W-2 Box 1 for Parent 1 and Parent 2. FAFSA asks for each parent separately even if they filed jointly.',
    docHints: [
      { doc: 'Parent 1 W-2', location: 'Box 1' },
      { doc: 'Parent 2 W-2', location: 'Box 1' },
    ],
    helper: 'If a parent had multiple W-2s, add all of them before entering.',
    inputType: 'currency',
  },
  {
    id: 'parent-biz-farm',
    section: 'Parent Financials',
    prompt: 'Did the parent own a small business or family farm with more than 100 employees?',
    translator: 'If yes, FAFSA counts net worth; if no, the business/farm value is excluded.',
    docHints: [
      { doc: 'Business tax return (1120-S/1065)', location: 'Number of employees' },
    ],
    inputType: 'yesno',
  },
  {
    id: 'parent-us-tax-paid',
    section: 'Parent Financials',
    prompt: 'Total federal income tax paid in 2023',
    translator: 'Use Form 1040, line 22 (for 2023 returns). Do not re-enter withholding amounts from W-2s.',
    docHints: [
      { doc: 'Form 1040', location: 'Line 22' },
    ],
    inputType: 'currency',
  },
  {
    id: 'parent-combat-pay',
    section: 'Parent Financials',
    prompt: 'Parent combat pay or special combat pay (untaxed portion)',
    translator: 'Enter the untaxed amount listed on military LES statements; do not include taxed combat pay.',
    docHints: [
      { doc: 'Leave and Earnings Statement', location: 'Combat pay field' },
    ],
    inputType: 'currency',
  },
  {
    id: 'parent-untaxed-income',
    section: 'Parent Financials',
    prompt: 'Parent nontaxable income such as tax-deferred retirement contributions, child support received, or untaxed Social Security.',
    translator: 'Only include benefits not already in the AGI—think 403(b) contributions, untaxed IRA payments, or tax-free Social Security.',
    docHints: [
      { doc: 'W-2', location: 'Box 12 codes D, E, F, G, H, S', note: 'Sum codes for tax-deferred retirement.' },
      { doc: 'SSA-1099', location: 'Box 5', note: 'Enter only the untaxed portion.' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-irs-consent',
    section: 'Student Financials',
    prompt: 'Does the student consent to IRS data transfer?',
    translator: 'Needed for IRS Direct Data Exchange. Without it, the student must manually enter every tax line.',
    docHints: [
      { doc: 'IRS account', location: 'Consent confirmation' },
    ],
    inputType: 'yesno',
  },
  {
    id: 'student-earnings',
    section: 'Student Financials',
    prompt: 'How much did the student earn from work in 2023?',
    translator: 'Add the student\'s own W-2 Box 1 totals or Schedule C net profit if self-employed.',
    docHints: [
      { doc: 'Student W-2', location: 'Box 1' },
      { doc: 'Schedule C', location: 'Line 31', note: 'If the student had self-employment income.' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-tax-paid',
    section: 'Student Financials',
    prompt: 'Student federal income tax paid in 2023',
    translator: 'Form 1040 line 22 for the student. If they were not required to file, enter 0.',
    docHints: [
      { doc: 'Student Form 1040', location: 'Line 22' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-grants',
    section: 'Student Financials',
    prompt: 'Taxable college grants or scholarships reported as income',
    translator: 'Include grant/scholarship amounts reported on the tax return (typically Schedule 1 line 8r).',
    docHints: [
      { doc: 'Schedule 1', location: 'Line 8r' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-work-study',
    section: 'Student Financials',
    prompt: 'Student college work-study earnings',
    translator: 'Report only the portion earned through need-based employment programs.',
    docHints: [
      { doc: 'W-2', location: 'Employer name referencing college' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-cash-savings',
    section: 'Assets & Savings',
    prompt: 'As of today, what is the total current balance of cash, savings, and checking accounts for student + spouse (if applicable)?',
    translator: 'Use the balance right now, not what it was on the tax return. Skip retirement accounts.',
    docHints: [
      { doc: 'Bank statements', location: 'Current balance', note: 'Use online banking or latest statement for today\'s balance.' },
    ],
    inputType: 'currency',
  },
  {
    id: 'parent-cash-savings',
    section: 'Assets & Savings',
    prompt: 'Current balance of parent cash, savings, and checking accounts',
    translator: 'Snapshot of today\'s balances across all parent cash-based accounts. Do not include retirement funds or home equity.',
    docHints: [
      { doc: 'Parent bank statements', location: 'Current balance' },
    ],
    inputType: 'currency',
  },
  {
    id: 'parent-investments',
    section: 'Assets & Savings',
    prompt: 'Total net worth of parent investments, including 529 plans for all children',
    translator: 'Add up brokerage accounts, 529 college savings, UGMA/UTMAs (if parent-owned), minus debts tied directly to those investments.',
    docHints: [
      { doc: 'Investment statements', location: 'Account value', note: 'Exclude retirement (401k, IRA) and primary home equity.' },
    ],
    helper: 'Report 529 plans owned by the parent for ANY child here—they count as parent assets.',
    inputType: 'currency',
  },
  {
    id: 'parent-real-estate',
    section: 'Assets & Savings',
    prompt: 'Net worth of parent real estate (excluding primary residence)',
    translator: 'Subtract debt owed on rentals/vacation homes from their current market value.',
    docHints: [
      { doc: 'Mortgage statements', location: 'Remaining balance' },
      { doc: 'Property valuation', location: 'Estimated market value' },
    ],
    inputType: 'currency',
  },
  {
    id: 'student-investments',
    section: 'Assets & Savings',
    prompt: 'Student investments and business/farm net worth',
    translator: 'Include brokerage accounts and any businesses the student owns (not retirement).',
    docHints: [
      { doc: 'Brokerage statements', location: 'Current value' },
    ],
    inputType: 'currency',
  },
  {
    id: 'sign-submit',
    section: 'Student Basics',
    prompt: 'Who will sign and submit the FAFSA?',
    translator: 'Each contributor must sign with their own FSA ID. The FAFSA cannot process without all required signatures.',
    docHints: [
      { doc: 'FSA ID confirmation', location: 'Username + email' },
    ],
    inputType: 'text',
  },
]
