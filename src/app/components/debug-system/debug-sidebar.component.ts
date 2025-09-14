// debug-sidebar.component.ts - Debug sidebar component
// Professional debug interface that doesn't interfere with main UI

import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculationResults } from '../../models/calculation.models';
import { InputsPanelData } from '../../models/expense.models';

export interface Thresholds {
  cprGreen: number;
  cprYellow: number;
  nimGreen: number;
  nimYellow: number;
  netIncomeWarn: number;
}

export type DebugView = 'storage' | 'calculations' | 'state' | 'performance' | 'thresholds' | 'regression';

@Component({
  selector: 'app-debug-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './debug-sidebar.component.html',
  styleUrls: ['./debug-sidebar.component.scss']
})
export class DebugSidebarComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() storageKey: string = '';
  @Input() origin: string = '';
  @Input() appVersion: string = '1.0.0';
  @Input() isReady: boolean = false;
  @Input() isHydrating: boolean = false;
  @Input() savedAt: string = '(never)';
  @Input() calculations?: CalculationResults;
  @Input() appState?: InputsPanelData;
  @Input() thresholds?: Thresholds;
  @Input() testResults: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saveNow = new EventEmitter<void>();
  @Output() dumpStorage = new EventEmitter<void>();
  @Output() copyJSON = new EventEmitter<void>();
  @Output() clearStorage = new EventEmitter<void>();
  @Output() showWizard = new EventEmitter<void>();
  @Output() thresholdsChange = new EventEmitter<Thresholds>();
  @Output() runRegressionTests = new EventEmitter<void>();
  @Output() exportTestResults = new EventEmitter<void>();

  activeView: DebugView = 'storage';
  expandedSection: string | null = 'kpi';
  debugViews: DebugView[] = ['storage', 'calculations', 'state', 'performance', 'thresholds', 'regression'];

  ngOnInit(): void {
    // Initialize component
  }

  ngOnChanges(): void {
    // Handle input changes
  }

  onClose(): void {
    this.close.emit();
  }

  onSaveNow(): void {
    this.saveNow.emit();
  }

  onDumpStorage(): void {
    this.dumpStorage.emit();
  }

  onCopyJSON(): void {
    this.copyJSON.emit();
  }

  onClearStorage(): void {
    this.clearStorage.emit();
  }

  onShowWizard(): void {
    this.showWizard.emit();
  }

  onRunRegressionTests(): void {
    this.runRegressionTests.emit();
  }

  onExportTestResults(): void {
    this.exportTestResults.emit();
  }

  onThresholdsChange(thresholds: Thresholds): void {
    this.thresholdsChange.emit(thresholds);
  }

  setActiveView(view: DebugView): void {
    this.activeView = view;
  }

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  // Helper methods for template display
  getCostPerReturnDisplay(): string {
    return this.calculations?.costPerReturn?.toFixed(2) || 'N/A';
  }

  getCprStatusDisplay(): string {
    return this.calculations?.cprStatus?.toUpperCase() || 'N/A';
  }

  getNetMarginDisplay(): string {
    return this.calculations?.netMarginPct?.toFixed(1) || 'N/A';
  }

  getNimStatusDisplay(): string {
    return this.calculations?.nimStatus?.toUpperCase() || 'N/A';
  }

  getNetIncomeDisplay(): string {
    return this.calculations?.netIncome?.toLocaleString() || 'N/A';
  }

  getNetMarginPctDisplay(): string {
    return this.calculations?.netMarginPct?.toFixed(1) || 'N/A';
  }

  getTotalExpensesDisplay(): string {
    return this.calculations?.totalExpenses?.toLocaleString() || 'N/A';
  }

  getRevenuePerReturn(): number {
    if (!this.calculations || !this.appState) return 0;
    return this.calculations.totalRevenue > 0 && this.appState.taxPrepReturns > 0 
      ? this.calculations.totalRevenue / this.appState.taxPrepReturns 
      : 0;
  }

  getCprGreenMin(): number {
    return this.getRevenuePerReturn() * 0.745; // 74.5%
  }

  getCprGreenMax(): number {
    return this.getRevenuePerReturn() * 0.775; // 77.5%
  }

  getNimGreenMin(): number {
    return 22.5;
  }

  getNimGreenMax(): number {
    return 25.5;
  }

  getStatusStyle(status: string | undefined): any {
    const colors = {
      green: '#10b981',
      yellow: '#f59e0b',
      red: '#ef4444'
    };
    return {
      color: status ? colors[status as keyof typeof colors] || '#9ca3af' : '#9ca3af',
      fontWeight: 'bold'
    };
  }

  getButtonStyle(): any {
    return {
      padding: '6px 12px',
      margin: '4px 0',
      background: '#374151',
      color: '#f9fafb',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      transition: 'background 0.2s ease'
    };
  }

  getTestStatusStyle(passed: boolean): any {
    return {
      color: passed ? '#10b981' : '#ef4444',
      fontWeight: 'bold'
    };
  }

  getMemoryUsage(): string {
    const memory = (performance as any).memory;
    return memory ? `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A';
  }

  getTabLabel(view: DebugView): string {
    const labels = {
      storage: '💾 Storage',
      calculations: '🧮 Calc',
      state: '📊 State',
      performance: '⚡ Perf',
      thresholds: '🎯 Thresholds',
      regression: '🧪 Tests'
    };
    return labels[view];
  }

  getTabTitle(view: DebugView): string {
    const titles = {
      storage: '💾 Data Storage - Check if changes are saving properly',
      calculations: '🧮 Calculations - See how your P&L numbers are computed',
      state: '📊 Current Values - All your input fields and settings',
      performance: '⚡ System Status - App performance and loading states',
      thresholds: '🎯 Thresholds - Adjust KPI thresholds and defaults',
      regression: '🧪 Regression Tests - Compare Angular vs React calculations'
    };
    return titles[view];
  }

  getModuleCount(): number {
    return document.querySelectorAll('script').length;
  }

  getDOMNodeCount(): number {
    return document.querySelectorAll('*').length;
  }

  logPerformanceTiming(): void {
    console.log('Performance timing:', performance.timing);
  }

  updateThreshold(property: keyof Thresholds, event: Event): void {
    if (!this.thresholds) return;
    
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value) || 0;
    
    const updatedThresholds = {
      ...this.thresholds,
      [property]: value
    };
    
    this.onThresholdsChange(updatedThresholds);
  }
}