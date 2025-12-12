import { Metadata } from 'next';
import OCRParser from '../components/OCRParser';
import RealInvoiceCalculator from '../components/RealInvoiceCalculator';
import TransferMatrix from '../components/TransferMatrix';
import { Brain, Shield, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Project Mega Brain - Financial Intelligence for NJ Higher Ed',
  description: 'Forensic financial analysis and cost optimization tools for New Jersey college students',
};

export default function MegaBrainPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Project Mega Brain</h1>
          </div>
          <p className="text-xl text-center text-blue-100 max-w-3xl mx-auto">
            Forensic Financial Intelligence Platform for NJ Higher Education
          </p>
          <p className="text-center text-blue-200 mt-2">
            Uncover hidden costs. Optimize your path. Save $25,000+.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Zero-Knowledge OCR</h3>
            <p className="text-sm text-gray-600">
              Process documents in your browser. No data leaves your device.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <TrendingDown className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Real Price Calculator</h3>
            <p className="text-sm text-gray-600">
              Reveal hidden fees, shadow tuition, and true cost of attendance.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Transfer Arbitrage</h3>
            <p className="text-sm text-gray-600">
              Save $25k-$47k with NJ's Lampitt Law and community college transfers.
            </p>
          </div>
        </div>

        {/* OCR Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Document Intelligence
            </h2>
            <p className="text-gray-600">
              Upload financial documents for automatic text extraction (client-side only)
            </p>
          </div>
          <OCRParser />
        </section>

        {/* Calculator Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Real Invoice Calculator
            </h2>
            <p className="text-gray-600">
              Calculate your true cost of attendance including all hidden fees
            </p>
          </div>
          <RealInvoiceCalculator />
        </section>

        {/* Transfer Matrix Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Academic Arbitrage Matrix
            </h2>
            <p className="text-gray-600">
              Discover how to save thousands through strategic transfer paths
            </p>
          </div>
          <TransferMatrix />
        </section>

        {/* Data Sources */}
        <section className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Data Sources & Methodology</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>SHIP Data:</strong> 2025-2026 health insurance costs from institutional 
              financial aid offices and student billing departments.
            </p>
            <p>
              <strong>Fee Data:</strong> Mandatory fee schedules published by NJ public and 
              private institutions for academic year 2025-2026.
            </p>
            <p>
              <strong>Housing Data:</strong> Average 2-bedroom rental rates from Zillow, 
              Apartments.com, and local property management companies (Q4 2024).
            </p>
            <p>
              <strong>ROI Data:</strong> Median first-year salaries by institution and major 
              from IPEDS College Scorecard and NJ Department of Labor (2024).
            </p>
            <p>
              <strong>Transfer Law:</strong> New Jersey Lampitt Law (A.B. 1330) and institutional 
              transfer credit policies.
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Last Updated: December 2025. All costs are estimates and subject to change. 
            Consult institutional financial aid offices for official pricing.
          </p>
        </section>
      </div>
    </main>
  );
}
