export type MetricUnit = 'currency' | 'percentage' | 'count' | 'custom';

export interface PerformanceTrend {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  period: string;
  baseline?: number;
}

export interface PerformanceTarget {
  value: number;
  status: 'above' | 'below' | 'on-track';
}

export interface PerformanceContext {
  period: string; // e.g., "Jan 2024"
  storeId?: string;
  storeName?: string;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  unit: MetricUnit;
  customUnit?: string;
  trend?: PerformanceTrend;
  target?: PerformanceTarget;
  context?: PerformanceContext;
}

export type PerformanceCardVariant = 'compact' | 'detailed' | 'dashboard';
