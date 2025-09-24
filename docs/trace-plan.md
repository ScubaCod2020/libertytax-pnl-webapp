Trace Plan — AnalysisBlock feature

Checkpoints

- Input: Wizard selections + Scenario (Good/Better/Best/Custom)
- Service: ProjectedService.applyScenarioPreset → growthPct
- Domain calc: AnalysisDataAssemblerService.buildProjectedVsPresets → AnalysisData
- Output: AnalysisBlockComponent renders metrics, comparison, insights
- UI: Demo route `/dev/analysis-demo`; Wizard Step 1 card; Dashboard middle column

Dev-only trace hooks

- Log when scenario changes and growthPct updates
- Log AnalysisDataAssembler inputs/outputs (stub when added)

Mermaid (later)

Smoke tests TODOs (names only)

- should render AnalysisBlock with primary metric only
- should show comparison section when provided
- should color variance based on sign
- should render insights list in order

Performance Cards

Checkpoints

- Input: YTD and Projected results
- Assembler (future): MetricsAssembler builds PerformanceMetric[]
- Output: PerformanceCardComponent renders values, trends, targets
- UI: Dashboard middle column grid (under flag)

Smoke tests (names)

- should format currency/count/percent correctly
- should color trend/target based on status
