import { Routes } from '@angular/router';
import { DebugToolComponent } from './components/debug-tool/debug-tool.component';
import { ExistingStorePageComponent } from './pages/existing-store/existing-store-page.component';

export const routes: Routes = [
  // Health check route (production diagnostics)
  {
    path: 'health',
    loadComponent: () => import('./pages/health/health.component').then(m => m.HealthComponent),
    title: 'Health Check - Boot Diagnostics'
  },

  // Debug route (dev-only)
  {
    path: 'debug',
    component: DebugToolComponent,
    title: 'Debug Tool - App State Snapshots'
  },
  
  // Wizard routes
  {
    path: 'wizard/step-1',
    loadComponent: () => import('./pages/wizard/step1-page.component').then(m => m.Step1PageComponent),
    title: 'Setup Wizard - Step 1'
  },
  {
    path: 'wizard/step-2',
    loadComponent: () => import('./pages/wizard/step2-page.component').then(m => m.Step2PageComponent),
    title: 'Setup Wizard - Step 2'
  },
  {
    path: 'wizard/step-3/reports',
    loadComponent: () => import('./pages/wizard/step3/reports-page.component').then(m => m.ReportsWizardPageComponent),
    title: 'Setup Wizard - Step 3 Reports'
  },
  
  // Dashboard page
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-page.component').then(m => m.DashboardPageComponent),
    title: 'P&L Dashboard'
  },
  
  // Existing store analysis page (legacy)
  {
    path: 'existing-store',
    component: ExistingStorePageComponent,
    title: 'Existing Store Analysis'
  },
  
  // Reports page
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports-page.component').then(m => m.ReportsPageComponent),
    title: 'P&L Reports'
  },
  
  // Default redirect to wizard step 1
  {
    path: '',
    redirectTo: '/wizard/step-1',
    pathMatch: 'full'
  }
];
