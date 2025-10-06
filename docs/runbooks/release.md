# Runbook: Release and Deployment

When to use: any production or staging release.

## Prerequisites

- Access to GitHub Actions and Vercel
- `GITHUB_TOKEN` write permissions enabled for workflows

## Steps

1. Ensure "01 → Code Quality & Analysis" is green
2. Run "02 → Build & Test" (auto from 01 or manual)
3. Verify artifacts and staging via "03 → Deploy to Staging"
4. Complete stakeholder checklist from the staging summary
5. Trigger "04 → Deploy to Production" (use emergency toggle only when necessary)

## Verification

- Validation checks pass (HTML doctype, JS/CSS bundles, React mount point)
- Smoke navigation OK; KPIs visible

## Rollback

- Use Vercel to redeploy previous successful build
- Open an incident issue; capture root cause and follow-ups
