// PROJECT MEGA BRAIN: Financial Intelligence Data
// Source: research.md (NJ Higher Ed Financial Audit 2025-2026)

export interface ShipData {
  institution: string;
  annualCost: number;
  waiverDeadline: string | null;
  policyNote: string;
  isPartTime?: boolean;
}

export interface FeeData {
  institution: string;
  annualFees: number;
  percentSurcharge: number;
  context: string;
}

export interface HousingData {
  zone: string;
  institution: string;
  avgRent2BR: number;
  arbitrageVerdict: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL/RISK' | 'RISK';
  logic: string;
}

export interface ShadowBudgetItem {
  institution: string;
  category: string;
  annualCost: number;
  details: string;
}

export interface ROIData {
  institution: string;
  major: string;
  medianSalary: number;
  riskVerdict: 'ELITE' | 'SAFE' | 'HIGH RISK' | 'TOXIC';
  logic: string;
}

export interface AcademicArbitrage {
  strategy: string;
  institution?: string;
  savings: number;
  details: string;
}

// 1. STUDENT HEALTH INSURANCE PLAN (SHIP) DATA
export const SHIP_DATA: ShipData[] = [
  {
    institution: 'Rutgers',
    annualCost: 2942,
    waiverDeadline: 'Sept 25',
    policyNote: 'Part-Time Penalty: Unsubsidized rate is $3,032 (Fall Only).',
  },
  {
    institution: 'Rutgers',
    annualCost: 3032,
    waiverDeadline: 'Sept 25',
    policyNote: 'Part-Time Penalty: Unsubsidized rate is $3,032 (Fall Only).',
    isPartTime: true,
  },
  {
    institution: 'Montclair',
    annualCost: 2940,
    waiverDeadline: 'Sept 15',
    policyNote: 'Strict "No Proration" policy.',
  },
  {
    institution: 'Rowan',
    annualCost: 2940,
    waiverDeadline: 'Sept 18',
    policyNote: 'Rising cost due to carrier switch (Aetna).',
  },
  {
    institution: 'Princeton',
    annualCost: 3800,
    waiverDeadline: 'Aug 31',
    policyNote: 'Highest premium. Strict waiver criteria.',
  },
  {
    institution: 'Drew',
    annualCost: 2625,
    waiverDeadline: 'Aug 26',
    policyNote: 'CRITICAL RISK: Deadline is before classes start.',
  },
  {
    institution: 'Seton Hall',
    annualCost: 2500,
    waiverDeadline: 'Sept 5',
    policyNote: 'Early compliance trap.',
  },
  {
    institution: 'Stevens',
    annualCost: 2204,
    waiverDeadline: 'Sept 15',
    policyNote: 'Moderate cost.',
  },
  {
    institution: 'NJIT',
    annualCost: 1997,
    waiverDeadline: 'Sept 15',
    policyNote: 'Value Leader for public research.',
  },
  {
    institution: 'Stockton',
    annualCost: 0,
    waiverDeadline: null,
    policyNote: 'SAFE HARBOR: No SHIP mandate.',
  },
  {
    institution: 'Kean',
    annualCost: 0,
    waiverDeadline: null,
    policyNote: 'SAFE HARBOR: No SHIP mandate.',
  },
];

// 2. MANDATORY FEE STACKS ("SHADOW TUITION")
export const FEES_DATA: FeeData[] = [
  {
    institution: 'Rowan',
    annualFees: 4762,
    percentSurcharge: 40,
    context: 'Highest fee burden in state.',
  },
  {
    institution: 'TCNJ',
    annualFees: 3980,
    percentSurcharge: 27,
    context: 'Funds student centers/capital projects.',
  },
  {
    institution: 'NJIT',
    annualFees: 3850,
    percentSurcharge: 22,
    context: 'Technology & Facilities fees.',
  },
  {
    institution: 'Stockton',
    annualFees: 2738,
    percentSurcharge: 19,
    context: 'Moderate fee structure.',
  },
  {
    institution: 'Stevens',
    annualFees: 2596,
    percentSurcharge: 4,
    context: 'Low % due to high base tuition.',
  },
  {
    institution: 'Seton Hall',
    annualFees: 1745,
    percentSurcharge: 3,
    context: 'Includes "Mobile Computing" (Laptop) fee.',
  },
];

// 3. HOUSING ARBITRAGE & LEASE LIABILITY
export const HOUSING_DATA: HousingData[] = [
  {
    zone: 'Hoboken',
    institution: 'Stevens',
    avgRent2BR: 4740,
    arbitrageVerdict: 'NEGATIVE',
    logic: 'Off-campus is ~100% more expensive. Stay in dorms.',
  },
  {
    zone: 'Princeton',
    institution: 'Princeton',
    avgRent2BR: 3361,
    arbitrageVerdict: 'NEGATIVE',
    logic: 'Off-campus is ~110% premium. Stay in dorms.',
  },
  {
    zone: 'New Brunswick',
    institution: 'Rutgers',
    avgRent2BR: 2700,
    arbitrageVerdict: 'NEUTRAL/RISK',
    logic: '80% premium for 12-month lease vs 9-month dorm.',
  },
  {
    zone: 'Newark',
    institution: 'NJIT/Rutgers',
    avgRent2BR: 1000,
    arbitrageVerdict: 'POSITIVE',
    logic: '"Value Play." Ironbound rents are cheaper than $14k dorms.',
  },
  {
    zone: 'Glassboro',
    institution: 'Rowan',
    avgRent2BR: 2051,
    arbitrageVerdict: 'RISK',
    logic: 'Recent 57% rent inflation erodes savings.',
  },
  {
    zone: 'W. Long Branch',
    institution: 'Monmouth',
    avgRent2BR: 3109,
    arbitrageVerdict: 'NEGATIVE',
    logic: '"Beach Tax" makes year-round rentals insolvent.',
  },
];

// Helper function to calculate off-campus liability
export function calculateOffCampusLiability(
  monthlyRent: number,
  monthlyUtilities: number = 150
): number {
  // Formula: (Monthly_Rent * 12) + (1.5 * Monthly_Rent [Deposit]) + (Utilities * 12)
  const annualRent = monthlyRent * 12;
  const deposit = monthlyRent * 1.5;
  const annualUtilities = monthlyUtilities * 12;
  return annualRent + deposit + annualUtilities;
}

// 4. SHADOW BUDGET & LIFESTYLE INTELLIGENCE
export const SHADOW_BUDGET: ShadowBudgetItem[] = [
  {
    institution: 'Rutgers',
    category: 'Greek Life',
    annualCost: 5660,
    details: 'Year 1. Includes "Parlor Fee" ($392) + Mandatory Meal Plan double-billing ($1,659).',
  },
  {
    institution: 'Princeton',
    category: 'Eating Clubs',
    annualCost: 13000,
    details: 'Ivy Club. Creates a $2,480 deficit against aid. Includes "Sophomore Bridge" dues ($1,300) due in Spring.',
  },
  {
    institution: 'All',
    category: 'Fly-Home Index',
    annualCost: 1900,
    details: 'Use 1.8x Multiplier on base fares for holiday travel (Thanksgiving/Winter). Gap vs Aid Allowance is typically -$1,900.',
  },
];

// Cocktail Index (Social Purchasing Power)
export const COCKTAIL_INDEX: { [key: string]: number } = {
  Hoboken: 1.8, // $14 drinks, NYC prices
  Glassboro: 0.8, // Student pricing
};

// 5. ROI & TOXIC ASSET DETECTOR
export const ROI_DATA: ROIData[] = [
  {
    institution: 'NJIT',
    major: 'Comp Sci',
    medianSalary: 91064,
    riskVerdict: 'ELITE',
    logic: 'DTI ~5%. Debt is highly productive.',
  },
  {
    institution: 'Seton Hall',
    major: 'Nursing',
    medianSalary: 74331,
    riskVerdict: 'SAFE',
    logic: 'High salary offsets private tuition.',
  },
  {
    institution: 'Rutgers',
    major: 'Finance',
    medianSalary: 60547,
    riskVerdict: 'SAFE',
    logic: 'Strong NYC pipeline.',
  },
  {
    institution: 'TCNJ',
    major: 'History',
    medianSalary: 20765,
    riskVerdict: 'TOXIC',
    logic: 'DTI > 24%. Insolvency likely.',
  },
  {
    institution: 'Montclair',
    major: 'English',
    medianSalary: 29599,
    riskVerdict: 'HIGH RISK',
    logic: 'DTI > 15%.',
  },
  {
    institution: 'Rowan',
    major: 'Drama',
    medianSalary: 20757,
    riskVerdict: 'TOXIC',
    logic: 'Return does not service debt.',
  },
];

// Velocity Watchlist (Schools with <50% 4-year graduation rate)
export const VELOCITY_WATCHLIST = [
  { institution: 'NJIT', fourYearRate: 49, penaltyCost: 77000 },
  { institution: 'Montclair', fourYearRate: 46, penaltyCost: 77000 },
  { institution: 'Rowan', fourYearRate: 51, penaltyCost: 77000 },
];

// Helper function to calculate DTI (Debt-to-Income ratio)
export function calculateDTI(totalDebt: number, medianSalary: number): number {
  return (totalDebt / medianSalary) * 100;
}

// Helper function to determine risk verdict based on DTI
export function getRiskVerdict(dti: number): ROIData['riskVerdict'] {
  if (dti <= 5) return 'ELITE';
  if (dti <= 10) return 'SAFE';
  if (dti <= 15) return 'HIGH RISK';
  return 'TOXIC';
}

// 6. ACADEMIC ARBITRAGE (THE HACKS)
export const ACADEMIC_ARBITRAGE: AcademicArbitrage[] = [
  {
    strategy: 'Lampitt Law',
    savings: 25000,
    details: 'AA/AS degree transfers as 60 Credit Block to any NJ Public 4-Year. GenEds waived.',
  },
  {
    strategy: 'Rowan 3+1',
    institution: 'Rowan',
    savings: 47000,
    details: 'Finish Junior year at Community College rates. Total Degree Cost: ~$30k.',
  },
  {
    strategy: 'CLEP - Rowan',
    institution: 'Rowan',
    savings: 5000,
    details: 'Accepts CLEP (Spanish = 12 credits/$90). Strategy: BUY.',
  },
  {
    strategy: 'CLEP - Seton Hall',
    institution: 'Seton Hall',
    savings: 0,
    details: 'Does NOT accept CLEP. Strategy: AVOID.',
  },
  {
    strategy: 'CLEP - Rutgers',
    institution: 'Rutgers',
    savings: 1000,
    details: 'Restrictive (Elective only). Strategy: SELL.',
  },
];

// Helper to get SHIP cost for institution
export function getShipCost(institution: string, isPartTime: boolean = false): number {
  const ship = SHIP_DATA.find(
    s => s.institution === institution && (isPartTime ? s.isPartTime : !s.isPartTime)
  );
  return ship?.annualCost || 0;
}

// Helper to get fees for institution
export function getFees(institution: string): number {
  const fees = FEES_DATA.find(f => f.institution === institution);
  return fees?.annualFees || 0;
}

// Helper to get housing data
export function getHousingData(institution: string): HousingData | undefined {
  return HOUSING_DATA.find(h => h.institution.includes(institution));
}

// Helper to get ROI data
export function getROIData(institution: string, major: string): ROIData | undefined {
  return ROI_DATA.find(r => r.institution === institution && r.major === major);
}
