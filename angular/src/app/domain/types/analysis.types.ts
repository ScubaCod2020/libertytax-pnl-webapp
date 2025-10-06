// Analysis types ported from React AnalysisBlock props
export type AnalysisStatus = 'positive' | 'negative' | 'neutral' | 'warning';

export interface AnalysisChange {
  amount: number;
  percentage: number;
  period: string;
}

export interface AnalysisPrimaryMetric {
  label: string;
  value: string | number;
  change?: AnalysisChange;
}

export interface AnalysisSecondaryMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export type InsightType = 'strategic' | 'tactical' | 'warning' | 'opportunity';

export interface AnalysisInsight {
  type: InsightType;
  message: string;
}

export interface AnalysisComparison {
  label: string;
  baseline: string | number;
  current: string | number;
  variance: number; // percent delta
}

export interface AnalysisData {
  title: string;
  icon?: string;
  status: AnalysisStatus;
  primaryMetric: AnalysisPrimaryMetric;
  secondaryMetrics?: AnalysisSecondaryMetric[];
  insights?: AnalysisInsight[];
  comparison?: AnalysisComparison;
}

export type AnalysisBlockSize = 'small' | 'medium' | 'large';
