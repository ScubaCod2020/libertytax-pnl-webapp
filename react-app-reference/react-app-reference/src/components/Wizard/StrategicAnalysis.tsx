// StrategicAnalysis.tsx - Strategic vs Tactical Analysis for educational business planning
// Shows variance between strategic goals and actual field-level adjustments

import React from 'react';
import type { WizardSectionProps } from './types';
import {
  getAdjustmentStatus,
  calculateBlendedGrowth,
  calculatePerformanceVsTarget,
} from './calculations';

export default function StrategicAnalysis({ answers }: WizardSectionProps) {
  // Get adjustment analysis
  const adjustments = getAdjustmentStatus(answers);
  const blendedGrowth = calculateBlendedGrowth(answers);
  const originalGrowth = answers.expectedGrowthPct || 0;
  const performance = calculatePerformanceVsTarget(answers);

  // Only show if there are adjustments
  if (!adjustments.hasAdjustments) return null;

  // Convert adjustment status to array format for rendering
  const adjustmentsList = [];
  if (adjustments.avgNetFeeStatus) {
    const growth =
      answers.projectedAvgNetFee && answers.avgNetFee
        ? Math.round(((answers.projectedAvgNetFee - answers.avgNetFee) / answers.avgNetFee) * 100)
        : 0;
    const variance = growth - originalGrowth;
    adjustmentsList.push({
      field: 'Average Net Fee',
      actualGrowth: growth,
      variance: variance,
    });
  }

  if (adjustments.taxPrepReturnsStatus) {
    const growth =
      answers.projectedTaxPrepReturns && answers.taxPrepReturns
        ? Math.round(
            ((answers.projectedTaxPrepReturns - answers.taxPrepReturns) / answers.taxPrepReturns) *
              100
          )
        : 0;
    const variance = growth - originalGrowth;
    adjustmentsList.push({
      field: 'Tax Prep Returns',
      actualGrowth: growth,
      variance: variance,
    });
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        fontSize: '0.85rem',
      }}
    >
      <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
        📊 Strategic vs. Tactical Analysis
      </div>

      <div style={{ color: '#92400e', marginBottom: '0.5rem' }}>
        <strong>Strategic Target:</strong> {originalGrowth > 0 ? '+' : ''}
        {originalGrowth}% growth on all metrics
      </div>

      <div style={{ color: '#92400e', marginBottom: '0.5rem' }}>
        <strong>Individual Field Performance:</strong>
      </div>

      {adjustmentsList.map((adj, idx) => (
        <div key={idx} style={{ color: '#92400e', marginLeft: '1rem', marginBottom: '0.25rem' }}>
          • <strong>{adj.field}:</strong> {adj.actualGrowth > 0 ? '+' : ''}
          {adj.actualGrowth}% ({adj.variance > 0 ? '+' : ''}
          {adj.variance}% {adj.variance > 0 ? 'above' : 'below'} target)
        </div>
      ))}

      <div
        style={{
          color: '#92400e',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f59e0b',
          fontWeight: 'bold',
        }}
      >
        🎯 <strong>Target vs. Actual Performance:</strong>
        <div style={{ fontWeight: 'normal', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          💰 <strong>Revenue Performance:</strong>
          <br />• Target: ${Math.round(performance.targetRevenue).toLocaleString()}
          <br />• Actual: ${Math.round(performance.actualRevenue).toLocaleString()}
          <br />• Variance: {performance.variance > 0 ? '+' : ''}
          {Math.round(performance.variance)}%{performance.variance > 0 ? 'above' : 'below'} target
          <br />
          <br />
          💸 <strong>Expense Control:</strong>
          <br />• Strategic Target: $
          {Math.round(
            answers.expectedRevenue ? performance.actualRevenue - answers.expectedRevenue : 0
          ).toLocaleString()}
          <br />• Current Page 2 Total: <em>Calculated on Page 2</em>
          <br />• Status: <em>Review on Page 2 for detailed breakdown</em>
        </div>
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: performance.variance >= 0 ? '#d1fae5' : '#fee2e2',
            borderRadius: '4px',
            border: performance.variance >= 0 ? '1px solid #10b981' : '1px solid #ef4444',
          }}
        >
          {performance.variance >= 0 ? '🎉' : '⚠️'}{' '}
          <strong>
            {performance.variance >= 0 ? 'Exceeding' : 'Missing'} your strategic target
          </strong>
        </div>
      </div>

      <div
        className="small"
        style={{
          color: '#a16207',
          marginTop: '0.5rem',
          fontStyle: 'italic',
          backgroundColor: '#fef9e7',
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #fcd34d',
        }}
      >
        💡 <strong>Business Lesson:</strong> Revenue = Fee × Returns. Small individual shortfalls
        can compound into larger revenue misses. Strategic planning requires considering how metrics
        multiply, not just add together.
      </div>
    </div>
  );
}
