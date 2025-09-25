import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'wizard' },

  // Wizard flow with descriptive routing
  {
    path: 'wizard',
    children: [
      { path: '', redirectTo: 'income-drivers', pathMatch: 'full' },
      {
        path: 'income-drivers',
        loadComponent: () =>
          import('./pages/wizard/income-drivers/income-drivers.component').then(
            (m) => m.IncomeDriversComponent
          ),
        data: { step: 1, title: 'Income Drivers', canProceed: true },
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/wizard/expenses/expenses.component').then((m) => m.ExpensesComponent),
        data: { step: 2, title: 'Expenses', canProceed: true },
      },
      {
        path: 'pnl',
        loadComponent: () => import('./pages/wizard/pnl/pnl.component').then((m) => m.PnlComponent),
        data: { step: 3, title: 'P&L Review', canProceed: true },
      },
      // Legacy step-based routes for backward compatibility
      { path: 'step/1', redirectTo: 'income-drivers', pathMatch: 'full' },
      { path: 'step/2', redirectTo: 'expenses', pathMatch: 'full' },
      { path: 'step/3', redirectTo: 'pnl', pathMatch: 'full' },
    ],
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { title: 'Dashboard' },
  },

  // Practice and engagement features
  {
    path: 'practice',
    loadComponent: () =>
      import('./components/practice-prompts/practice-prompts.component').then(
        (m) => m.PracticePromptsComponent
      ),
    data: { title: 'Practice Prompts' },
  },

  // Development and debugging
  {
    path: 'debug',
    loadComponent: () =>
      import('./components/dev/app-state-debug.component').then((m) => m.AppStateDebugComponent),
    data: { title: 'Debug Panel' },
  },
  {
    path: 'dev/analysis-demo',
    loadComponent: () =>
      import('./components/analysis-block/analysis-block-demo.component').then(
        (m) => m.AnalysisBlockDemoComponent
      ),
    data: { title: 'Analysis Block Demo' },
  },

  // Catch-all redirect
  { path: '**', redirectTo: 'wizard' },
];
