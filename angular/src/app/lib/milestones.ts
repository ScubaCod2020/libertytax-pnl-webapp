export type MilestoneState = 'done' | 'in_progress' | 'planned';

export interface MilestoneItem {
  id: string;
  label: string;
  state: MilestoneState;
  updatedAt?: string;
}

export const MILESTONES: MilestoneItem[] = [
  { id: 'app_boot', label: 'Angular app boots and routes load', state: 'done' },
  { id: 'global_styles', label: 'Global styles consolidated + partials', state: 'done' },
  { id: 'header_footer', label: 'Header + Footer (nav, version, layout)', state: 'done' },
  { id: 'debug_panel', label: 'Debug panel placeholder (push-layout, desktop/mobile)', state: 'done' },
  { id: 'brands_assets', label: 'Brand assets wired (logo/watermark)', state: 'done' },
  { id: 'wizard_income', label: 'Wizard: Income Drivers page scaffolded', state: 'in_progress' },
  { id: 'wizard_expenses', label: 'Wizard: Expenses page scaffolded', state: 'in_progress' },
  { id: 'wizard_pnl', label: 'Wizard: P&L page scaffolded', state: 'in_progress' },
  { id: 'calc_port', label: 'Port calculations from React reference', state: 'planned' },
  { id: 'reports_export', label: 'Reports + Export flows', state: 'planned' },
];


