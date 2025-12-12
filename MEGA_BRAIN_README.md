# Project Mega Brain - Financial Intelligence Platform

## Overview

Project Mega Brain is a forensic financial intelligence platform for New Jersey Higher Education. It helps students uncover hidden costs, calculate true prices, and discover academic arbitrage strategies to save $25,000-$47,000 on their college education.

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 with Tailwind CSS 4
- **Icons:** Lucide React
- **OCR:** Tesseract.js (client-side WASM)
- **PDF Processing:** pdfjs-dist
- **Type Safety:** TypeScript 5

### Core Principles
1. **Zero-Knowledge Architecture:** All document processing happens in the browser. No data is sent to servers.
2. **Privacy-First:** Automatic SSN redaction and sensitive data blurring.
3. **Data-Driven:** Real financial data from 2025-2026 academic year.
4. **Mobile-First:** Responsive design for all screen sizes.

## Features

### 1. OCR Parser (`/app/components/OCRParser.tsx`)

Client-side document scanning with privacy protections:

**Features:**
- Drag-and-drop file upload
- Support for images (JPG, PNG) and PDFs
- Tesseract.js OCR engine (WASM)
- Real-time progress tracking
- Automatic SSN redaction (XXX-XX-XXXX)
- Canvas pre-processing for sensitive data

**Privacy:**
- All processing happens in browser
- No server uploads
- Automatic pattern detection and redaction
- Clear "Zero-Knowledge" indicator

**Usage:**
```tsx
import OCRParser from '@/app/components/OCRParser';

<OCRParser 
  onTextExtracted={(text) => console.log(text)} 
/>
```

### 2. Real Invoice Calculator (`/app/components/RealInvoiceCalculator.tsx`)

Interactive cost calculator revealing true price of attendance:

**Inputs:**
- School selection (11 NJ institutions)
- Base tuition
- Housing choice (on-campus, off-campus, commute)
- Insurance status (waived/not waived)
- Part-time status (for Rutgers)
- Lifestyle (lean/social)

**Calculations:**
- Mandatory fees (from FEES_DATA)
- SHIP insurance costs (from SHIP_DATA)
- Housing costs with 12-month lease calculations
- Social/lifestyle costs (from SHADOW_BUDGET)
- True annual price breakdown

**Features:**
- Early deadline warnings for SHIP waivers
- Housing arbitrage analysis
- Hidden cost comparison
- Detailed breakdown with notes

**Example Output:**
```
Base Tuition: $15,000
Mandatory Fees: $4,762
Health Insurance: $2,942
On-Campus Housing: $14,000
Social Costs: $5,660
------------------------
True Annual Price: $42,364
Hidden Costs: +$27,364
```

### 3. Transfer Matrix (`/app/components/TransferMatrix.tsx`)

Academic arbitrage strategy visualizer:

**Transfer Paths:**
1. **Lampitt Law Transfer:** $25,000 savings
   - 2 years CC + 2 years University
   - 60-credit block transfer
   - GenEds waived

2. **Rowan 3+1 Program:** $47,000 savings
   - 3 years at CC rates
   - 1 year at Rowan
   - Total degree cost: ~$30,000

3. **CLEP Strategy:** $1,000-$5,000 savings
   - Test out of courses for $90/exam
   - Institution-specific acceptance

**Features:**
- Visual transfer pathway
- Cost breakdown by path
- Risk level indicators
- Eligible schools lists
- Interactive comparisons

### 4. Financial Data Library (`/app/lib/financial-data.ts`)

Structured data exports with TypeScript interfaces:

**Data Sets:**
- `SHIP_DATA` - Health insurance costs and deadlines
- `FEES_DATA` - Mandatory fees and surcharges
- `HOUSING_DATA` - Rental rates and arbitrage analysis
- `SHADOW_BUDGET` - Social and lifestyle costs
- `ROI_DATA` - Salary outcomes by major
- `ACADEMIC_ARBITRAGE` - Transfer strategies

**Helper Functions:**
- `getShipCost(institution, isPartTime)` - Get SHIP cost
- `getFees(institution)` - Get mandatory fees
- `calculateOffCampusLiability(rent, utilities)` - Calculate 12-month lease cost
- `calculateDTI(debt, salary)` - Debt-to-income ratio
- `getRiskVerdict(dti)` - Risk classification

**Example:**
```typescript
import { 
  getShipCost, 
  calculateOffCampusLiability 
} from '@/app/lib/financial-data';

const shipCost = getShipCost('Rutgers', false); // $2,942
const housing = calculateOffCampusLiability(2700, 150); // $34,200
```

## Data Sources

All data is sourced from official institutional publications and government databases:

1. **SHIP Data:** Institutional financial aid offices and student billing departments (2025-2026)
2. **Fee Data:** Published mandatory fee schedules (2025-2026)
3. **Housing Data:** Zillow, Apartments.com, local property management (Q4 2024)
4. **ROI Data:** IPEDS College Scorecard and NJ Department of Labor (2024)
5. **Transfer Law:** NJ Lampitt Law (A.B. 1330) and institutional policies

## File Structure

```
app/
├── mega-brain/
│   └── page.tsx                    # Main page integrating all components
├── components/
│   ├── OCRParser.tsx              # Client-side document scanner
│   ├── RealInvoiceCalculator.tsx  # Cost calculator
│   ├── TransferMatrix.tsx         # Transfer strategy visualizer
│   └── Header.tsx                 # Updated with navigation link
└── lib/
    └── financial-data.ts          # Structured financial data

research.md                         # Source data (not committed)
```

## Accessing the Platform

Navigate to `/mega-brain` in your browser to access all features:

```
http://localhost:3000/mega-brain
```

Or use the "Financial Intelligence" link in the navigation menu.

## Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
Dependencies are already included in package.json:
- tesseract.js (OCR)
- pdfjs-dist (PDF processing)
- lucide-react (icons)

### Running Locally
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
npm run start
```

## Key Insights from Data

### Cost Traps
1. **Early SHIP Deadlines:**
   - Drew: Aug 26 (before classes start)
   - Princeton: Aug 31
   - Seton Hall: Sept 5

2. **Shadow Tuition:**
   - Rowan: +$4,762 fees (40% surcharge)
   - TCNJ: +$3,980 fees (27% surcharge)

3. **Housing Arbitrage:**
   - Hoboken (Stevens): NEGATIVE (stay on-campus)
   - Newark (NJIT): POSITIVE (off-campus cheaper)
   - Princeton: NEGATIVE (110% premium off-campus)

4. **Hidden Social Costs:**
   - Rutgers Greek Life: $5,660/year
   - Princeton Eating Clubs: $13,000/year

### Savings Opportunities
1. **Lampitt Law:** $25,000 via 2+2 transfer
2. **Rowan 3+1:** $47,000 via 3+1 program
3. **CLEP Exams:** $5,000 at Rowan (12 credits/$90)
4. **Off-Campus (Newark):** Save vs $14k dorms

### ROI Winners
- NJIT Computer Science: $91,064 median (5% DTI)
- Seton Hall Nursing: $74,331 median
- Rutgers Finance: $60,547 median

### ROI Risks
- TCNJ History: $20,765 median (24% DTI - TOXIC)
- Rowan Drama: $20,757 median (TOXIC)
- Montclair English: $29,599 median (HIGH RISK)

## Security & Privacy

### Zero-Knowledge Design
- No document uploads to servers
- All OCR processing in browser via WebAssembly
- No API calls with user data
- No cookies or tracking

### Data Redaction
- Automatic SSN pattern detection: `\d{3}-\d{2}-\d{4}`
- Canvas-level blurring before OCR
- Pattern replaced with: XXX-XX-XXXX

### Future Enhancements
- Additional PII patterns (addresses, phone numbers)
- Configurable redaction rules
- PDF annotation for redacted areas

## Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- WebAssembly support
- Canvas API
- FileReader API
- ES6+ JavaScript

## Performance

**OCR Processing:**
- Image: 5-15 seconds
- PDF (single page): 10-30 seconds
- Runs on main thread (may block UI)

**Recommendations:**
- Show progress indicator
- Use web workers for production
- Limit PDF to first 2-3 pages
- Compress images before processing

## Future Roadmap

### Phase 1 (Complete)
- [x] Financial data library
- [x] OCR parser component
- [x] Real invoice calculator
- [x] Transfer matrix visualizer
- [x] Main page integration

### Phase 2 (Future)
- [ ] Web workers for non-blocking OCR
- [ ] Multi-page PDF processing
- [ ] Export/share calculator results
- [ ] ROI calculator with loan scenarios
- [ ] Scholarship database integration

### Phase 3 (Future)
- [ ] User accounts (optional)
- [ ] Saved calculations
- [ ] College comparison tool
- [ ] Financial aid timeline tracker
- [ ] Supabase integration for public data

## License

This project is part of Destination College and follows the repository license.

## Contributing

To add new institutions or update data:

1. Update `research.md` with new data
2. Update relevant arrays in `financial-data.ts`
3. Test all affected components
4. Submit PR with data sources

## Support

For questions or issues with Project Mega Brain:
- Check this README
- Review `research.md` for data sources
- Inspect component code for implementation details
- Contact Destination College team

---

**Last Updated:** December 2025
**Data Version:** 2025-2026 Academic Year
**Platform Version:** 1.0.0
