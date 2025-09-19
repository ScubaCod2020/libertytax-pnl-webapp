```mermaid
flowchart LR
  A[Wizard Step 1] --> B[Wizard Step 2]
  B --> C[Wizard Step 3 - Reports]
  C --> D[Dashboard]
  subgraph Gating
    E[Region / TaxRush]
  end
  A --> E
  B --> E
```


