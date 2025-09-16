import { Routes } from '@angular/router';
import { DebugToolComponent } from './components/debug-tool/debug-tool.component';
import { ExistingStorePageComponent } from './pages/existing-store/existing-store-page.component';

export const routes: Routes = [
  // Debug route (dev-only)
  {
    path: 'debug',
    component: DebugToolComponent,
    title: 'Debug Tool - App State Snapshots'
  },
  
  // Existing store analysis page
  {
    path: 'existing-store',
    component: ExistingStorePageComponent,
    title: 'Existing Store Analysis'
  },
  
  // Default redirect to main app (handled by AppComponent)
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
