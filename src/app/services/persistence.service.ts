import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WizardAnswers, AppState } from '../models/wizard.models';
import { environment } from '../../environments/environment';
import { STORAGE_KEYS } from './storage.keys';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {
  private readonly STORAGE_KEY = STORAGE_KEYS.PROD_DATA;
  private readonly APP_VERSION = '0.5';
  private readonly ORIGIN = 'liberty-tax-pnl-angular';

  private readySubject = new BehaviorSubject<boolean>(false);
  public ready$ = this.readySubject.asObservable();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log('💾 Initializing persistence service');
    this.readySubject.next(true);
  }

  saveWizardAnswers(answers: WizardAnswers): void {
    try {
      const envelope = this.loadEnvelope();
      envelope.wizardAnswers = answers;
      envelope.meta.savedAtISO = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(envelope));
      console.log('💾 Saved wizard answers:', answers);
    } catch (error) {
      console.error('💾 Failed to save wizard answers:', error);
    }
  }

  loadWizardAnswers(): WizardAnswers | null {
    try {
      const envelope = this.loadEnvelope();
      return envelope.wizardAnswers || null;
    } catch (error) {
      console.error('💾 Failed to load wizard answers:', error);
      return null;
    }
  }

  getWizardState(): { showWizard: boolean; wizardCompleted: boolean } {
    try {
      const envelope = this.loadEnvelope();
      return {
        showWizard: envelope.wizardState?.showWizard || false,
        wizardCompleted: envelope.wizardState?.wizardCompleted || false
      };
    } catch (error) {
      console.error('💾 Failed to load wizard state:', error);
      return { showWizard: false, wizardCompleted: false };
    }
  }

  markWizardCompleted(): void {
    try {
      const envelope = this.loadEnvelope();
      envelope.wizardState = {
        showWizard: false,
        wizardCompleted: true
      };
      envelope.meta.savedAtISO = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(envelope));
      console.log('💾 Marked wizard as completed');
    } catch (error) {
      console.error('💾 Failed to mark wizard completed:', error);
    }
  }

  saveBaseline(state: AppState): void {
    try {
      const envelope = this.loadEnvelope();
      envelope.baseline = state;
      envelope.meta.savedAtISO = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(envelope));
      console.log('💾 Saved baseline state:', state);
    } catch (error) {
      console.error('💾 Failed to save baseline:', error);
    }
  }

  loadEnvelope(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('💾 Failed to parse stored data:', error);
    }
    
    // Return default envelope structure
    return {
      meta: {
        version: this.APP_VERSION,
        origin: this.ORIGIN,
        savedAtISO: new Date().toISOString()
      },
      wizardState: {
        showWizard: true,
        wizardCompleted: false
      },
      wizardAnswers: null,
      baseline: null
    };
  }

  saveNow(): void {
    console.log('💾 Manual save triggered');
    // Implementation for manual save
  }

  clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('💾 Storage cleared');
    } catch (error) {
      console.error('💾 Failed to clear storage:', error);
    }
  }

  dumpStorage(): void {
    try {
      const envelope = this.loadEnvelope();
      console.group('💾 Storage Dump');
      console.log('Storage Key:', this.STORAGE_KEY);
      console.log('App Version:', this.APP_VERSION);
      console.log('Origin:', this.ORIGIN);
      console.log('Envelope:', envelope);
      console.log('Raw localStorage:', localStorage.getItem(this.STORAGE_KEY));
      console.groupEnd();
    } catch (error) {
      console.error('💾 Failed to dump storage:', error);
    }
  }

  dbg(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`[Persistence] ${message}`, data);
    }
  }

  get DEBUG(): boolean {
    if (typeof window === 'undefined') return false;
    
    const urlParams = new URLSearchParams(window.location.search);
    const hasDebugParam = urlParams.get('debug') === '1';
    
    // In production, strip debug query param and never honor debug mode
    if (environment.production) {
      if (hasDebugParam) {
        this.stripDebugQueryParam();
      }
      return false;
    }
    
    // In development, honor debug query parameter
    return hasDebugParam;
  }

  private stripDebugQueryParam(): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('debug');
      
      // Replace current URL without debug param (no page reload)
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Failed to strip debug query parameter:', error);
    }
  }
}
