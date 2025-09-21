// ModularDemo.tsx - Demonstrates how the new modular architecture scales across scenarios
// This shows single-store, multi-store, monthly forecasting, and dashboard views

import React, { useState } from 'react';
import AppHeader from '../Shared/AppHeader';
import AnalysisBlock, { AnalysisData } from '../Shared/AnalysisBlock';
import PerformanceCard, { PerformanceMetric } from '../Shared/PerformanceCard';

// Example: Single Store Dashboard
export function SingleStoreDashboard() {
  const [region, setRegion] = useState<'US' | 'CA'>('US');

  const analysisData: AnalysisData = {
    title: 'Revenue Performance Analysis',
    icon: '💰',
    status: 'positive',
    primaryMetric: {
      label: 'Total Revenue',
      value: '$248,500',
      change: {
        amount: 15420,
        percentage: 6.6,
        period: 'vs last year',
      },
    },
    secondaryMetrics: [
      { label: 'Average Net Fee', value: 127, unit: 'per return' },
      { label: 'Tax Prep Returns', value: 1840, unit: 'returns' },
      { label: 'Customer Discounts', value: 2.8, unit: '%' },
    ],
    comparison: {
      label: 'Year over Year',
      baseline: '$232,080',
      current: '$248,500',
      variance: 7.1,
    },
    insights: [
      {
        type: 'strategic',
        message: 'Revenue growth exceeds industry average of 4.2%',
      },
      {
        type: 'tactical',
        message: 'Consider raising average fee by $3-5 to reach $250k target',
      },
      {
        type: 'opportunity',
        message: 'Discount rate below optimal 3% - room for customer acquisition',
      },
    ],
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 248500,
      unit: 'currency',
      trend: { direction: 'up', percentage: 6.6, period: 'Last Year' },
      target: { value: 250000, status: 'on-track' },
      context: { period: 'YTD 2024' },
    },
    {
      id: 'net_income',
      label: 'Net Income',
      value: 59640,
      unit: 'currency',
      trend: { direction: 'up', percentage: 8.2, period: 'Last Year' },
      target: { value: 60000, status: 'on-track' },
      context: { period: 'YTD 2024' },
    },
  ];

  return (
    <div>
      <AppHeader
        title="Liberty Tax • P&L Budget & Forecast"
        subtitle="Single Store Performance Dashboard"
        version="v0.5 preview"
        region={region}
        storeInfo={{ name: 'Downtown Location', type: 'single' }}
        actions={[
          {
            label: '📊 View Forecast',
            onClick: () => console.log('Navigate to forecast'),
            variant: 'secondary',
          },
          {
            label: '⚙️ Settings',
            onClick: () => console.log('Open settings'),
            variant: 'secondary',
          },
        ]}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          padding: '0 1.5rem',
        }}
      >
        <AnalysisBlock data={analysisData} />
        <PerformanceCard title="Key Metrics" metrics={performanceMetrics} variant="dashboard" />
      </div>
    </div>
  );
}

// Example: Multi-Store Overview
export function MultiStoreDashboard() {
  const storeMetrics: PerformanceMetric[] = [
    {
      id: 'store1_revenue',
      label: 'Revenue',
      value: 248500,
      unit: 'currency',
      trend: { direction: 'up', percentage: 6.6, period: 'Last Year' },
      target: { value: 250000, status: 'on-track' },
      context: { period: 'YTD 2024', storeName: 'Downtown' },
    },
    {
      id: 'store2_revenue',
      label: 'Revenue',
      value: 186300,
      unit: 'currency',
      trend: { direction: 'down', percentage: -2.4, period: 'Last Year' },
      target: { value: 200000, status: 'below' },
      context: { period: 'YTD 2024', storeName: 'Mall Location' },
    },
    {
      id: 'store3_revenue',
      label: 'Revenue',
      value: 312750,
      unit: 'currency',
      trend: { direction: 'up', percentage: 12.8, period: 'Last Year' },
      target: { value: 300000, status: 'above' },
      context: { period: 'YTD 2024', storeName: 'Suburban' },
    },
  ];

  return (
    <div>
      <AppHeader
        title="Liberty Tax • Multi-Store Manager"
        subtitle="Performance across all locations"
        version="v0.5 preview"
        region="US"
        storeInfo={{ type: 'multi', count: 3 }}
        actions={[
          { label: '+ Add Store', onClick: () => console.log('Add store'), variant: 'primary' },
          {
            label: '📊 Consolidated Report',
            onClick: () => console.log('Generate report'),
            variant: 'secondary',
          },
        ]}
        breadcrumb={[
          { label: 'Dashboard', onClick: () => console.log('Dashboard') },
          { label: 'Multi-Store View' },
        ]}
      />

      <div style={{ padding: '0 1.5rem' }}>
        <PerformanceCard
          title="Revenue by Location"
          metrics={storeMetrics}
          variant="detailed"
          onClick={(metric) => console.log(`Navigate to ${metric.context?.storeName} details`)}
          actions={[
            { label: 'Compare Stores', onClick: () => console.log('Compare mode') },
            { label: 'Export Data', onClick: () => console.log('Export') },
          ]}
        />
      </div>
    </div>
  );
}

// Example: Monthly Forecasting View
export function MonthlyForecastView() {
  const monthlyMetrics: PerformanceMetric[] = [
    {
      id: 'jan',
      label: 'January',
      value: 42500,
      unit: 'currency',
      context: { period: 'Jan 2024' },
    },
    {
      id: 'feb',
      label: 'February',
      value: 38200,
      unit: 'currency',
      context: { period: 'Feb 2024' },
    },
    { id: 'mar', label: 'March', value: 45800, unit: 'currency', context: { period: 'Mar 2024' } },
    { id: 'apr', label: 'April', value: 28100, unit: 'currency', context: { period: 'Apr 2024' } },
  ];

  const yearlyAnalysis: AnalysisData = {
    title: '12-Month Revenue Forecast',
    icon: '📈',
    status: 'positive',
    primaryMetric: {
      label: 'Projected Annual Revenue',
      value: '$487,200',
    },
    secondaryMetrics: [
      { label: 'Q1 Actual', value: 126500, unit: '$' },
      { label: 'Q2-Q4 Forecast', value: 360700, unit: '$' },
      { label: 'Confidence', value: 87, unit: '%' },
    ],
    insights: [
      {
        type: 'strategic',
        message: 'Seasonal trends suggest strong Q1 performance continuing',
      },
      {
        type: 'tactical',
        message: 'April dip expected - consider marketing campaign',
      },
    ],
  };

  return (
    <div>
      <AppHeader
        title="Liberty Tax • 12-Month Forecast"
        subtitle="Monthly performance breakdown and projections"
        version="v0.5 preview"
        region="US"
        storeInfo={{ name: 'Downtown Location', type: 'single' }}
        breadcrumb={[
          { label: 'Dashboard', onClick: () => console.log('Dashboard') },
          { label: 'Forecasting' },
          { label: 'Monthly View' },
        ]}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          padding: '0 1.5rem',
        }}
      >
        <PerformanceCard
          title="Monthly Breakdown"
          metrics={monthlyMetrics}
          variant="detailed"
          showTrends={false}
          showTargets={false}
        />
        <AnalysisBlock data={yearlyAnalysis} size="medium" />
      </div>
    </div>
  );
}

// Main Demo Component
export default function ModularDemo() {
  const [view, setView] = useState<'single' | 'multi' | 'forecast'>('single');

  return (
    <div>
      {/* Demo Navigation */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #d1d5db',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem 0' }}>🏗️ Modular Architecture Demo</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setView('single')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'single' ? '#3b82f6' : 'white',
              color: view === 'single' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Single Store Dashboard
          </button>
          <button
            onClick={() => setView('multi')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'multi' ? '#3b82f6' : 'white',
              color: view === 'multi' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Multi-Store Manager
          </button>
          <button
            onClick={() => setView('forecast')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: view === 'forecast' ? '#3b82f6' : 'white',
              color: view === 'forecast' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Monthly Forecasting
          </button>
        </div>
      </div>

      {/* Demo Content */}
      {view === 'single' && <SingleStoreDashboard />}
      {view === 'multi' && <MultiStoreDashboard />}
      {view === 'forecast' && <MonthlyForecastView />}
    </div>
  );
}
