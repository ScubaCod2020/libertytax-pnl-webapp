import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'wizard/income-drivers' },

  {
    path: 'wizard/income-drivers',
    loadComponent: () =>
      import('./pages/wizard/income-drivers/income-drivers.component').then(
        (m) => m.IncomeDriversComponent
      ),
  },

  {
    path: 'wizard/expenses',
    loadComponent: () =>
      import('./pages/wizard/expenses/expenses.component').then((m) => m.ExpensesComponent),
  },

  {
    path: 'wizard/pnl',
    loadComponent: () => import('./pages/wizard/pnl/pnl.component').then((m) => m.PnlComponent),
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'debug',
    loadComponent: () =>
      import('./components/debug-panel/debug-panel.component').then((m) => m.DebugPanelComponent),
  },
  {
    path: 'dev/analysis-demo',
    loadComponent: () =>
      import('./components/analysis-block/analysis-block-demo.component').then(
        (m) => m.AnalysisBlockDemoComponent
      ),
  },
];
