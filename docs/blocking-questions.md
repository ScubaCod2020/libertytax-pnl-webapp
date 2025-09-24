Blocking Questions — Integration Strategy

Storage: docs/blocking-questions.md

Legend

- [Unanswered] — needs decision/clarification
- [Answered] — resolved; action recorded

[Answered] Q0: Where should blocking-questions.md live?

- Decision: docs/blocking-questions.md
- Action: File created/maintained at this path with tagging system

[Unanswered] Q1: Confirm feature flag policy/location

- Is `FEATURE_FLAGS` the desired mechanism? Should defaults be provided in `app.config.ts` or token factory is sufficient?
- Action pending

[Unanswered] Q2: Placement confirmation

- Wizard Step 1: preferred container/component region for the analysis card?
- Dashboard: which column/panel should host the analysis?
- Action pending

[Unanswered] Q3: Data contract details

- Should comparison show Good/Better/Best vs Custom deltas by returns, avgNetFee, or combined revenue only?
- Any copy guidelines for insights types (strategic vs tactical)?
- Action pending

[Unanswered] Q4: Tracing

- Any global debug logger to use, or are inline console statements acceptable for dev-only?
- Action pending

[Unanswered] Q5: Primary Sources of Truth for Integration

- What are the primary sources of truth for business logic and requirements (before using React as QA reference)?
- Should we prioritize: Business requirements docs, existing Angular patterns, domain expertise, or other sources?
- React app should be used for QA validation, not as primary implementation guide
- Action pending

[Unanswered] Q6: Integration Priority Order

- What should be the priority order for integration tasks?
- Should we start with core calculation services, UI components, or routing infrastructure?
- Which components are most critical for initial functionality?
- Action pending

[Unanswered] Q7: Testing Strategy Clarification

- What level of React parity is required vs. Angular improvements?
- Should we test for exact React behavior match or focus on business requirement fulfillment?
- How should we handle cases where Angular approach is superior to React implementation?
- Action pending