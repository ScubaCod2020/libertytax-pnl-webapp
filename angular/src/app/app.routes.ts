import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'wizard/step-1', loadComponent: () =>
      import('./features/wizard/step-1/step-1.component').then(m => m.Step1Component) },
  { path: 'wizard/step-2', loadComponent: () =>
      import('./features/wizard/step-2/step-2.component').then(m => m.Step2Component) },
  { path: 'wizard/step-3', loadComponent: () =>
      import('./features/wizard/step-3/step-3.component').then(m => m.Step3Component) },
  { path: 'dashboard', loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
];
