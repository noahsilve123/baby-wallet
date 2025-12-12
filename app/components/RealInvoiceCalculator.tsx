'use client';

import { useState } from 'react';
import { Calculator, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  SHIP_DATA,
  FEES_DATA,
  HOUSING_DATA,
  SHADOW_BUDGET,
  getShipCost,
  getFees,
  calculateOffCampusLiability,
} from '../lib/financial-data';

type HousingChoice = 'on-campus' | 'off-campus' | 'commute';
type InsuranceStatus = 'waived' | 'not-waived';
type LifestyleChoice = 'lean' | 'social';

const SCHOOLS = [
  'Rutgers',
  'Montclair',
  'Rowan',
  'Princeton',
  'Drew',
  'Seton Hall',
  'Stevens',
  'NJIT',
  'Stockton',
  'Kean',
  'TCNJ',
];

export default function RealInvoiceCalculator() {
  const [school, setSchool] = useState<string>('Rutgers');
  const [baseTuition, setBaseTuition] = useState<number>(15000);
  const [housing, setHousing] = useState<HousingChoice>('on-campus');
  const [onCampusHousingCost, setOnCampusHousingCost] = useState<number>(14000);
  const [insurance, setInsurance] = useState<InsuranceStatus>('not-waived');
  const [isPartTime, setIsPartTime] = useState<boolean>(false);
  const [lifestyle, setLifestyle] = useState<LifestyleChoice>('lean');

  // Calculate true price
  const calculateTruePrice = () => {
    let total = baseTuition;
    const breakdown: { category: string; amount: number; note?: string }[] = [];

    // Add tuition
    breakdown.push({
      category: 'Base Tuition',
      amount: baseTuition,
    });

    // Add mandatory fees
    const fees = getFees(school);
    if (fees > 0) {
      total += fees;
      breakdown.push({
        category: 'Mandatory Fees',
        amount: fees,
        note: FEES_DATA.find(f => f.institution === school)?.context,
      });
    }

    // Add SHIP if not waived
    if (insurance === 'not-waived') {
      const shipCost = getShipCost(school, isPartTime);
      if (shipCost > 0) {
        total += shipCost;
        breakdown.push({
          category: 'Health Insurance (SHIP)',
          amount: shipCost,
          note: SHIP_DATA.find(s => s.institution === school && s.isPartTime === isPartTime)?.policyNote,
        });
      }
    }

    // Add housing costs
    if (housing === 'on-campus') {
      total += onCampusHousingCost;
      breakdown.push({
        category: 'On-Campus Housing (9 months)',
        amount: onCampusHousingCost,
      });
    } else if (housing === 'off-campus') {
      const housingData = getHousingData(school);
      if (housingData) {
        const offCampusCost = calculateOffCampusLiability(housingData.avgRent2BR);
        total += offCampusCost;
        breakdown.push({
          category: 'Off-Campus Housing (12 months)',
          amount: offCampusCost,
          note: `${housingData.arbitrageVerdict}: ${housingData.logic}`,
        });
      } else {
        // Default estimate
        const offCampusCost = calculateOffCampusLiability(1500);
        total += offCampusCost;
        breakdown.push({
          category: 'Off-Campus Housing (12 months)',
          amount: offCampusCost,
        });
      }
    }

    // Add lifestyle costs
    if (lifestyle === 'social') {
      const socialCost = SHADOW_BUDGET.find(
        s => s.institution === school || s.institution === 'All'
      );
      if (socialCost) {
        total += socialCost.annualCost;
        breakdown.push({
          category: `Social Costs (${socialCost.category})`,
          amount: socialCost.annualCost,
          note: socialCost.details,
        });
      } else {
        // Default social cost estimate
        const defaultSocial = 3000;
        total += defaultSocial;
        breakdown.push({
          category: 'Social Costs (Estimated)',
          amount: defaultSocial,
          note: 'Travel, activities, social events',
        });
      }
    }

    return { total, breakdown };
  };

  const { total, breakdown } = calculateTruePrice();

  // Get SHIP deadline warning
  const shipData = SHIP_DATA.find(s => s.institution === school && !s.isPartTime);
  const isEarlyDeadline = shipData?.waiverDeadline?.includes('Aug');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Real Invoice Calculator</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SCHOOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Tuition (Annual)
              </label>
              <input
                type="number"
                value={baseTuition}
                onChange={(e) => setBaseTuition(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Housing Choice
              </label>
              <select
                value={housing}
                onChange={(e) => setHousing(e.target.value as HousingChoice)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="on-campus">On-Campus (9 months)</option>
                <option value="off-campus">Off-Campus (12 months)</option>
                <option value="commute">Commute from home</option>
              </select>
            </div>

            {housing === 'on-campus' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  On-Campus Housing Cost
                </label>
                <input
                  type="number"
                  value={onCampusHousingCost}
                  onChange={(e) => setOnCampusHousingCost(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Health Insurance (SHIP)
              </label>
              <select
                value={insurance}
                onChange={(e) => setInsurance(e.target.value as InsuranceStatus)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="waived">Waived (have own insurance)</option>
                <option value="not-waived">Not Waived (will be billed)</option>
              </select>
            </div>

            {school === 'Rutgers' && insurance === 'not-waived' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="part-time"
                  checked={isPartTime}
                  onChange={(e) => setIsPartTime(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="part-time" className="text-sm text-gray-700">
                  Part-time student (higher rate)
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lifestyle
              </label>
              <select
                value={lifestyle}
                onChange={(e) => setLifestyle(e.target.value as LifestyleChoice)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lean">Lean (minimal social spending)</option>
                <option value="social">Social (realistic lifestyle)</option>
              </select>
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-4">
            {/* SHIP Warning */}
            {insurance === 'not-waived' && isEarlyDeadline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Early Deadline Warning</p>
                  <p className="text-xs text-yellow-700">
                    {shipData?.policyNote}
                  </p>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-800 mb-3">Price Breakdown</h3>
              {breakdown.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-700">{item.category}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${item.amount.toLocaleString()}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gray-500 italic">{item.note}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-900">True Annual Price</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                This is your real cost of attendance including all mandatory and hidden fees.
              </p>
            </div>

            {/* Comparison to advertised price */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Advertised Tuition</span>
                <span className="text-sm font-semibold">${baseTuition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-gray-900">Hidden Costs</span>
                <span className="text-sm font-bold text-red-600 flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+${(total - baseTuition).toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
