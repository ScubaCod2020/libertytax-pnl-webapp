# Ops — CI/CD, QA, Deploy
Path: ops/

Purpose: Centralizes operational assets for workflows, QA, and deployments.

This folder centralizes operational assets separate from the application code.

- workflows/: GitHub Actions design notes, templates, and references
- scripts/: CI helpers (wrappers, env checks, smoke tests)
  - setup/: local setup scripts (moved from repo root)
- docs/: Runbooks and environment setup

Suggested structure:

ops/
  workflows/
    ci-outline.md
  scripts/
    smoke-preview.sh
  docs/
    environments.md

Notes:
- Runtime workflows remain in .github/workflows per GitHub’s conventions.
- Use this folder for documentation and helper scripts referenced by workflows.
