// NetIncomeSummary.tsx
// Reusable summary card for Last Year, Projected, and Target net income
// Shows $ value and % margin, with safe calculation

import React from 'react';

interface NetIncomeSummaryProps {
  label: string; // "Last Year", "Projected", "Target"
  gross: number;
  discounts: number;
  otherIncome: number;
  expenses: number;
  color?: string;
  background?: string;
  border?: string;
}

export default function NetIncomeSummary({
  label,
  gross,
  discounts,
  otherIncome,
  expenses,
  color = '#0369a1',
  background = '#e0f2fe',
  border = '2px solid #0ea5e9',
}: NetIncomeSummaryProps) {
  // Step 1: net tax prep fees
  const netTaxPrep = gross - discounts;

  // Step 2: total revenue
  const totalRevenue = netTaxPrep + otherIncome;

  // Step 3: net income
  const netIncome = totalRevenue - expenses;

  // Step 4: % margin (safe: only show if revenue >0 AND expenses >0)
  const pct =
    totalRevenue > 0 && expenses > 0 ? Math.round((netIncome / totalRevenue) * 1000) / 10 : 0;

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: background,
        border,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '1.1rem',
        color,
        marginTop: '1rem',
      }}
    >
      {label} Net Income: ${Math.round(netIncome).toLocaleString()}{' '}
      <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>({pct}% margin)</span>
    </div>
  );
}
