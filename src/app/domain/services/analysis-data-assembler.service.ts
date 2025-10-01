import { Injectable } from '@angular/core';
import { AnalysisData, AnalysisInsight } from '../types/analysis.types';
import { ProjectedService } from '../../services/projected.service';

@Injectable({ providedIn: 'root' })
export class AnalysisDataAssemblerService {
  constructor(private readonly projected: ProjectedService) {}

  buildProjectedVsPresets(): AnalysisData {
    const scenario = this.projected.scenario; // 'Custom' | 'Good' | 'Better' | 'Best'
    const customPct = this.projected.growthPct;
    const presetPct =
      scenario === 'Good' ? 2 : scenario === 'Better' ? 5 : scenario === 'Best' ? 10 : 0;
    const variance = Math.round((customPct - presetPct) * 10) / 10; // one decimal step

    const insights: AnalysisInsight[] = [];
    if (variance > 0)
      insights.push({
        type: 'opportunity',
        message: `Custom exceeds ${scenario} by ${variance} points.`,
      });
    if (variance < 0)
      insights.push({
        type: 'warning',
        message: `Custom trails ${scenario} by ${Math.abs(variance)} points.`,
      });
    if (variance === 0)
      insights.push({ type: 'strategic', message: `Custom matches ${scenario}.` });

    return {
      title: 'Projected Growth Analysis',
      icon: '📊',
      status: variance > 0 ? 'positive' : variance < 0 ? 'warning' : 'neutral',
      primaryMetric: {
        label: 'Growth Selection',
        value: `${customPct}%`,
        change: { amount: 0, percentage: customPct, period: 'vs PY' },
      },
      comparison: {
        label: `${scenario} preset`,
        baseline: `${presetPct}%`,
        current: `${customPct}%`,
        variance,
      },
      insights,
    };
  }
}
