- [ ] ID: lifecycle-fine-segmentation-missing-inputs
      Area: lifecycle
      Summary: Years 2–5 and 6+ tiers exist in KPI rules config, but UI collects only new/existing store type.
      Proposed Change: Add store age inputs and activate additional lifecycle bands.
      Impact: Tighter KPI alignment for mature stores.
      Status: proposed

- [ ] ID: rent-guard-average-input
      Area: expenses
      Summary: KPI Rules V2 rent evaluator expects local average rent data; Quick Start wizard no longer captures this input.
      Proposed Change: Restore local average rent / rent period inputs and feed into rent evaluation logic.
      Impact: Enables actionable rent guardrail guidance for offices above market.
      Status: proposed

- [ ] ID: payroll-benchmark-input
      Area: expenses
      Summary: Payroll evaluator needs regional benchmark (average payroll) to compare against; field is not currently collected.
      Proposed Change: Introduce optional local payroll benchmark input and surface comparison in Expenses guidance.
      Impact: Supports payroll KPI advice beyond raw percentage.
      Status: proposed
