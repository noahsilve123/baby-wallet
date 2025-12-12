'use client';

import { ArrowRight, TrendingDown, Award, Info } from 'lucide-react';
import { ACADEMIC_ARBITRAGE } from '../lib/financial-data';

const COMMUNITY_COLLEGES = [
  'Bergen CC',
  'Camden CC',
  'County College of Morris',
  'Essex CC',
  'Hudson CC',
  'Middlesex CC',
  'Ocean CC',
  'Passaic CC',
  'Raritan Valley CC',
  'Union CC',
];

const PUBLIC_FOUR_YEARS = [
  'Rutgers',
  'Rowan',
  'Montclair',
  'NJIT',
  'Stockton',
  'Kean',
  'TCNJ',
  'Ramapo',
  'William Paterson',
];

interface TransferPath {
  name: string;
  description: string;
  savings: number;
  timeline: string;
  breakdown: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommended: boolean;
}

const TRANSFER_PATHS: TransferPath[] = [
  {
    name: 'Lampitt Law Transfer',
    description: 'Complete AA/AS at any NJ Community College, transfer 60 credits as block to any NJ public 4-year',
    savings: 25000,
    timeline: '2 years CC + 2 years University',
    breakdown: [
      '2 years at Community College: ~$8,000/year = $16,000',
      '2 years at Public University: ~$15,000/year = $30,000',
      'Total: ~$46,000 vs. 4 years at University: ~$71,000',
      'GenEd requirements automatically waived',
    ],
    riskLevel: 'low',
    recommended: true,
  },
  {
    name: 'Rowan 3+1 Program',
    description: 'Complete first 3 years at Community College rates through special Rowan partnership, final year at Rowan',
    savings: 47000,
    timeline: '3 years CC rates + 1 year University',
    breakdown: [
      '3 years at CC rates: ~$8,000/year = $24,000',
      '1 year at Rowan: ~$17,000',
      'Total: ~$41,000 vs. 4 years at Rowan: ~$88,000',
      'Graduate with Rowan degree',
    ],
    riskLevel: 'low',
    recommended: true,
  },
  {
    name: 'Direct 4-Year Enrollment',
    description: 'Traditional path: enroll directly in 4-year institution for all 4 years',
    savings: 0,
    timeline: '4 years at University',
    breakdown: [
      '4 years at Public University: ~$17,000/year = $68,000+',
      'No transfer credits or savings',
      'Standard path with highest total cost',
    ],
    riskLevel: 'high',
    recommended: false,
  },
];

export default function TransferMatrix() {
  const lampittLaw = ACADEMIC_ARBITRAGE.find(a => a.strategy === 'Lampitt Law');
  const rowan3plus1 = ACADEMIC_ARBITRAGE.find(a => a.strategy === 'Rowan 3+1');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Award className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Academic Arbitrage: The Transfer Strategy
            </h2>
            <p className="text-gray-700">
              Smart students save $25,000 - $47,000 by leveraging NJ's transfer laws. 
              Complete your first 2-3 years at community college rates, then transfer 
              to a 4-year institution for your degree.
            </p>
          </div>
        </div>
      </div>

      {/* Lampitt Law Explainer */}
      <div className="bg-white border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">What is the Lampitt Law?</h3>
            <p className="text-gray-700 mb-3">
              New Jersey's Lampitt Law (A.B. 1330) requires all NJ public 4-year institutions 
              to accept an Associate's degree (AA/AS) as a <strong>60-credit block transfer</strong>. 
              This means:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
              <li>All 60 credits transfer automatically</li>
              <li>General education requirements are waived</li>
              <li>You enter as a Junior with full standing</li>
              <li>Save ~$25,000 compared to 4 years at a university</li>
            </ul>
            {lampittLaw && (
              <p className="text-sm text-green-700 font-semibold mt-3">
                💰 Estimated Savings: ${lampittLaw.savings.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Paths Comparison */}
      <div className="grid md:grid-cols-3 gap-4">
        {TRANSFER_PATHS.map((path) => (
          <div
            key={path.name}
            className={`
              border rounded-lg p-5 transition-all
              ${path.recommended 
                ? 'border-green-400 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white'
              }
            `}
          >
            {path.recommended && (
              <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                RECOMMENDED
              </div>
            )}
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">{path.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{path.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Savings:</span>
                <span className={`text-lg font-bold ${path.savings > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {path.savings > 0 ? (
                    <span className="flex items-center space-x-1">
                      <TrendingDown className="w-4 h-4" />
                      <span>${path.savings.toLocaleString()}</span>
                    </span>
                  ) : (
                    '$0'
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Timeline:</span>
                <span className="text-sm text-gray-600">{path.timeline}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Risk:</span>
                <span className={`text-sm font-semibold ${
                  path.riskLevel === 'low' ? 'text-green-600' :
                  path.riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {path.riskLevel.toUpperCase()}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Cost Breakdown:</p>
                <ul className="space-y-1">
                  {path.breakdown.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-600">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rowan 3+1 Highlight */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Award className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Rowan 3+1: The Ultimate Arbitrage Play
            </h3>
            <p className="text-gray-700 mb-4">
              Rowan University's 3+1 program is the highest-value transfer path in NJ. 
              Complete your first three years at community college rates through a special 
              partnership, then finish your senior year at Rowan's campus.
            </p>
            
            {rowan3plus1 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Total Degree Cost:</span>
                  <span className="text-2xl font-bold text-green-600">~$30,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Savings vs. 4-Year Direct:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${rowan3plus1.savings.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              <strong>Perfect for:</strong> Students who want a 4-year university degree at 
              community college prices. Graduate with a Rowan degree for less than half the 
              typical cost.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Transfer Flow */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">How It Works</h3>
        
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-blue-900 mb-2">STEP 1</p>
            <p className="text-lg font-bold text-blue-600 mb-2">Community College</p>
            <p className="text-sm text-gray-700">2 years</p>
            <p className="text-sm text-gray-600">~$8,000/year</p>
            <p className="text-xs text-gray-500 mt-2">Earn AA/AS degree</p>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-8 h-8 text-gray-400" />
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-green-900 mb-2">STEP 2</p>
            <p className="text-lg font-bold text-green-600 mb-2">4-Year University</p>
            <p className="text-sm text-gray-700">2 years</p>
            <p className="text-sm text-gray-600">~$15,000/year</p>
            <p className="text-xs text-gray-500 mt-2">Earn Bachelor's degree</p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">Eligible Community Colleges:</p>
          <div className="flex flex-wrap gap-2">
            {COMMUNITY_COLLEGES.map((cc) => (
              <span
                key={cc}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700"
              >
                {cc}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Transfer to any NJ Public 4-Year:
          </p>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_FOUR_YEARS.map((uni) => (
              <span
                key={uni}
                className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700"
              >
                {uni}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CLEP Strategy */}
      <div className="bg-white border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Bonus: CLEP Exam Strategy
        </h3>
        <p className="text-gray-700 mb-4">
          College Level Examination Program (CLEP) lets you test out of courses for $90/exam. 
          Some schools accept CLEP for significant credit.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {ACADEMIC_ARBITRAGE.filter(a => a.strategy.startsWith('CLEP')).map((strategy) => (
            <div
              key={strategy.strategy}
              className={`
                border rounded-lg p-4
                ${strategy.savings > 1000 ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}
              `}
            >
              <h4 className="font-bold text-gray-800 mb-2">{strategy.institution}</h4>
              <p className="text-sm text-gray-700 mb-2">{strategy.details}</p>
              <p className={`text-xs font-semibold ${
                strategy.savings > 1000 ? 'text-green-700' : 'text-red-700'
              }`}>
                {strategy.savings > 1000 ? '✓ BUY' : '✗ AVOID'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
