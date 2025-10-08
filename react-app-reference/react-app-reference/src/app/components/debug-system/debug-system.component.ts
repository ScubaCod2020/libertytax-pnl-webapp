// debug-system.component.ts - Main debug system component
// Integrates debug toggle and sidebar with app state management

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugToggleComponent } from './debug-toggle.component';
import { DebugSidebarComponent, Thresholds } from './debug-sidebar.component';
import { DebugLogger, enableDebugging, disableDebugging } from '../../utils/debug.utils';
import { CalculationResults } from '../../models/calculation.models';
import { InputsPanelData } from '../../models/expense.models';
import { STORAGE_KEYS } from '../../services/storage.keys';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-debug-system',
  standalone: true,
  imports: [CommonModule, DebugToggleComponent, DebugSidebarComponent],
  template: `
    <app-debug-toggle
      [isOpen]="isSidebarOpen"
      [show]="showDebugToggle"
      [region]="region"
      (toggle)="onToggleSidebar()"
    ></app-debug-toggle>

    <app-debug-sidebar
      [isOpen]="isSidebarOpen"
      [storageKey]="storageKey"
      [origin]="origin"
      [appVersion]="appVersion"
      [isReady]="isReady"
      [isHydrating]="isHydrating"
      [savedAt]="savedAt"
      [calculations]="calculations"
      [appState]="appState"
      [thresholds]="thresholds"
      (close)="onCloseSidebar()"
      (saveNow)="onSaveNow()"
      (dumpStorage)="onDumpStorage()"
      (copyJSON)="onCopyJSON()"
      (clearStorage)="onClearStorage()"
      (showWizard)="onShowWizard()"
      (thresholdsChange)="onThresholdsChange($event)"
    ></app-debug-sidebar>
  `,
  styles: []
})
export class DebugSystemComponent implements OnInit, OnDestroy {
  @Input() showDebugToggle: boolean = true;
  @Input() region: 'US' | 'CA' = 'US';
  @Input() calculations?: CalculationResults;
  @Input() appState?: InputsPanelData;

  @Output() saveNow = new EventEmitter<void>();
  @Output() dumpStorage = new EventEmitter<void>();
  @Output() copyJSON = new EventEmitter<void>();
  @Output() clearStorage = new EventEmitter<void>();
  @Output() showWizard = new EventEmitter<void>();
  @Output() thresholdsChange = new EventEmitter<Thresholds>();

  isSidebarOpen: boolean = false;
  storageKey: string = STORAGE_KEYS.PROD_DATA;
  origin: string = window.location.origin;
  appVersion: string = '1.0.0';
  isReady: boolean = true;
  isHydrating: boolean = false;
  savedAt: string = '(never)';

  thresholds: Thresholds = {
    cprGreen: 15.0,
    cprYellow: 20.0,
    nimGreen: 25.0,
    nimYellow: 15.0,
    netIncomeWarn: -5000
  };

  private debugEnabled: boolean = false;

  ngOnInit(): void {
    this.initializeDebugSystem();
    this.loadDebugSettings();
    this.startAutoSaveTimer();
  }

  ngOnDestroy(): void {
    this.stopAutoSaveTimer();
  }

  onToggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    DebugLogger.log('DebugSystem', 'onToggleSidebar', { isOpen: this.isSidebarOpen });
  }

  onCloseSidebar(): void {
    this.isSidebarOpen = false;
    DebugLogger.log('DebugSystem', 'onCloseSidebar');
  }

  onSaveNow(): void {
    this.saveNow.emit();
    this.savedAt = new Date().toLocaleString();
    DebugLogger.log('DebugSystem', 'onSaveNow', { savedAt: this.savedAt });
  }

  onDumpStorage(): void {
    this.dumpStorage.emit();
    this.dumpToConsole();
  }

  onCopyJSON(): void {
    this.copyJSON.emit();
    this.copyToClipboard();
  }

  onClearStorage(): void {
    if (confirm('⚠️ WARNING: This will delete ALL your saved data! Are you sure?')) {
      this.clearStorage.emit();
      this.clearLocalStorage();
    }
  }

  onShowWizard(): void {
    this.showWizard.emit();
  }

  onThresholdsChange(thresholds: Thresholds): void {
    this.thresholds = thresholds;
    this.thresholdsChange.emit(thresholds);
    this.saveDebugSettings();
    DebugLogger.log('DebugSystem', 'onThresholdsChange', { thresholds });
  }

  private initializeDebugSystem(): void {
    // Enable debugging in development
    if (this.isDevelopment()) {
      enableDebugging();
      this.debugEnabled = true;
      DebugLogger.log('DebugSystem', 'initializeDebugSystem', { 
        environment: 'development',
        debugEnabled: true 
      });
    } else {
      disableDebugging();
      this.debugEnabled = false;
    }
  }

  private loadDebugSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBUG_SETTINGS);
      if (saved) {
        const settings = JSON.parse(saved);
        this.thresholds = { ...this.thresholds, ...settings.thresholds };
        this.savedAt = settings.savedAt || this.savedAt;
        DebugLogger.log('DebugSystem', 'loadDebugSettings', { settings });
      }
    } catch (error) {
      console.error('Failed to load debug settings:', error);
    }
  }

  private saveDebugSettings(): void {
    // Never save debug settings in production
    if (environment.production) {
      return;
    }
    
    try {
      const settings = {
        thresholds: this.thresholds,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.DEBUG_SETTINGS, JSON.stringify(settings));
      DebugLogger.log('DebugSystem', 'saveDebugSettings', { settings });
    } catch (error) {
      console.error('Failed to save debug settings:', error);
    }
  }

  private startAutoSaveTimer(): void {
    // Auto-save every 30 seconds
    setInterval(() => {
      if (this.isSidebarOpen) {
        this.onSaveNow();
      }
    }, 30000);
  }

  private stopAutoSaveTimer(): void {
    // Timer cleanup would go here if needed
  }

  private dumpToConsole(): void {
    const debugData = {
      appVersion: this.appVersion,
      region: this.region,
      isReady: this.isReady,
      isHydrating: this.isHydrating,
      savedAt: this.savedAt,
      calculations: this.calculations,
      appState: this.appState,
      thresholds: this.thresholds,
      debugLogs: DebugLogger.getLogs(),
      localStorage: this.getAllLocalStorage()
    };

    console.group('🐛 Debug Data Dump');
    console.log('App State:', debugData);
    console.log('Debug Logs:', DebugLogger.getLogs());
    console.log('Local Storage:', this.getAllLocalStorage());
    console.groupEnd();

    DebugLogger.log('DebugSystem', 'dumpToConsole', { dataSize: JSON.stringify(debugData).length });
  }

  private copyToClipboard(): void {
    const debugData = {
      appVersion: this.appVersion,
      region: this.region,
      isReady: this.isReady,
      isHydrating: this.isHydrating,
      savedAt: this.savedAt,
      calculations: this.calculations,
      appState: this.appState,
      thresholds: this.thresholds,
      debugLogs: DebugLogger.getLogs(),
      localStorage: this.getAllLocalStorage()
    };

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2)).then(() => {
      console.log('✅ Debug data copied to clipboard');
      DebugLogger.log('DebugSystem', 'copyToClipboard', { success: true });
    }).catch((error) => {
      console.error('❌ Failed to copy debug data:', error);
      DebugLogger.log('DebugSystem', 'copyToClipboard', { success: false, error });
    });
  }

  private clearLocalStorage(): void {
    try {
      // Clear all app-related localStorage items using centralized keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key === STORAGE_KEYS.PROD_DATA ||
          key === STORAGE_KEYS.DEBUG_SETTINGS ||
          key.startsWith('liberty-tax-pnl') || // Legacy pattern for safety
          key.startsWith('debug-') // Legacy pattern for safety
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.savedAt = '(never)';
      console.log('✅ All debug data cleared');
      DebugLogger.log('DebugSystem', 'clearLocalStorage', { clearedKeys: keysToRemove });
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
      DebugLogger.log('DebugSystem', 'clearLocalStorage', { success: false, error });
    }
  }

  private getAllLocalStorage(): any {
    const storage: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage[key] = localStorage.getItem(key);
        }
      }
    }
    return storage;
  }

  private isDevelopment(): boolean {
    // Check if we're in development mode
    return !environment.production;
  }
}
