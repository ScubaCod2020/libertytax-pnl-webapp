export interface DashboardFlags {
  showMonthlyForecastCard: boolean;
  showPerformanceCards: boolean;
  showDebugPanels: boolean;
}
export const DEFAULT_DASHBOARD_FLAGS: DashboardFlags = {
  showMonthlyForecastCard: true,
  showPerformanceCards: true,
  showDebugPanels: false,
};
