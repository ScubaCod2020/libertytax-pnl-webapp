import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'existing-store',
    loadComponent: () =>
      import('./components/existing-store-shell/existing-store-shell.component').then(
        m => m.ExistingStoreShellComponent
      ),
  },
];
