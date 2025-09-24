import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DebugPanelService } from './debug-panel.service';
import { MilestonesService } from '../../services/milestones.service';
import { MilestoneItem, MilestoneState } from '../../lib/milestones';
import { CommonModule } from '@angular/common';
import { FEATURE_FLAGS } from '../../core/tokens/feature-flags.token';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.scss'],
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  constructor(
    public debugSvc: DebugPanelService,
    private ms: MilestonesService
  ) {}
  showDetails = false;
  private sub?: Subscription;
  milestones$!: Observable<MilestoneItem[]>;
  logText = '';
  readonly flags = inject(FEATURE_FLAGS);

  ngOnInit(): void {
    this.sub = this.debugSvc.open$.subscribe((open) => (this.showDetails = open));
    this.milestones$ = this.ms.items$;
    this.refreshLog();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cycleState(id: string): void {
    // done -> planned -> in_progress -> done (simple cycle)
    let next: MilestoneState = 'done';
    this.milestones$
      .subscribe((list) => {
        const m = list.find((x) => x.id === id);
        if (!m) return;
        next = m.state === 'done' ? 'planned' : m.state === 'planned' ? 'in_progress' : 'done';
        this.ms.updateState(id, next);
        this.refreshLog();
      })
      .unsubscribe();
  }

  clearLog(): void {
    this.ms.clearLog();
    this.refreshLog();
  }
  private refreshLog(): void {
    this.logText = this.ms.getLog().slice().reverse().join('\n');
  }

  // Feature flags controls (mutates shared token instance)
  setShowAnalysisBlock(v: boolean): void {
    this.flags.showAnalysisBlock = !!v;
  }
  setShowMonthlyForecastCard(v: boolean): void {
    this.flags.showMonthlyForecastCard = !!v;
  }
  setShowMultiStoreSummaryCard(v: boolean): void {
    this.flags.showMultiStoreSummaryCard = !!v;
  }

  copyMarkdown(): void {
    const md = this.toMarkdown();
    navigator.clipboard?.writeText(md).catch(() => {});
    this.ms.appendLog('Exported progress log to clipboard');
    this.refreshLog();
  }

  downloadMarkdown(): void {
    const md = this.toMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'DEVELOPMENT_PROGRESS_LOG.md';
    a.click();
    URL.revokeObjectURL(a.href);
    this.ms.appendLog('Downloaded progress log markdown');
    this.refreshLog();
  }

  private toMarkdown(): string {
    const lines = this.ms.getLog();
    const header = '# Development Progress Log\n\n';
    const body = lines.map((l) => `- ${l}`).join('\n');
    return header + body + '\n';
  }
}
