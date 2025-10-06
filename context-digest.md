## Liberty Tax — Angular Context Digest (Expected Structure & Naming)

See `docs/context-digest.md` for the full digest. This root copy exists to satisfy pre-flight checklist consumers that read from repository root.

Key highlights:

- Angular standalone; expected structure under `angular/src/app` with `components/`, `core/{contracts,services,tokens}`, `domain/{calculations,types}`, `pages/*`.
- Styling via `styles.scss` importing `_tokens.scss`, `_base.scss`, `_layout.scss`, `_kpi.scss`.
- Naming and keys: `returns`, `avgNetFee`, `discountsPct`, `discountsAmt`, `otherIncome`, `tr_*`, `py_*`.
- Guardrails: math in `domain/*`, services in `core/services/*`, reactive forms, no template math, $↔% conversions in code.

Blocking questions are tracked in the docs digest.
