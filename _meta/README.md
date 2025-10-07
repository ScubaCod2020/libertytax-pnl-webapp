# /\_meta/ Directory - Non-Runtime Assets

**Purpose:** This directory contains assets that are not required for runtime operation but are essential for development, maintenance, and handoff processes.

## Directory Structure

### `/_meta/ai/`

- **Purpose:** AI-related tools, prompts, and automation scripts
- **Contents:**
  - `prompts/` - AI prompt templates and configurations
  - `scripts/` - AI-generated automation tools
  - `debug-tools/` - AI debugging infrastructure

### `/_meta/process/`

- **Purpose:** Process documentation, workflows, and operational procedures
- **Contents:**
  - `design/` - Design documents, brand guidelines, architecture diagrams
  - `blueprints/` - Process blueprints and templates
  - `runbooks/` - Operational runbooks and procedures
  - `deployment/` - Deployment process documentation
  - `maintenance/` - Maintenance procedures and scripts
  - `history/` - Process history and tracking
  - `context/` - Context documentation and digests
  - `checklists/` - Process checklists and validation tools

### `/_meta/archive/`

- **Purpose:** Historical assets, deprecated content, and reference materials
- **Contents:**
  - `docs/` - Archived documentation
  - `ui-snapshots/` - Historical UI screenshots
  - `run-reports/` - Historical test and run reports
  - `growth/` - Historical growth tracking
  - `sessions/` - Session summaries and logs
  - `debug-images/` - Debug screenshots and images
  - `debug-scripts/` - Debug scripts and tools
  - `test-reports/` - Historical test reports
  - `excel-tools/` - Legacy Excel generation tools
  - `external/` - External archive references

### `/_meta/logs/`

- **Purpose:** Append-only logging and audit trails
- **Contents:**
  - Daily rotation logs
  - Audit trails
  - Process logs
  - Maintenance logs

### `/_meta/research/`

- **Purpose:** Research tools, analysis scripts, and investigation materials
- **Contents:**
  - `analysis/` - Research and analysis scripts
  - `testing/` - Research testing tools

## Usage Guidelines

### For Developers

- **Runtime Code:** Keep in `angular/`, `src/`, `public/`, etc.
- **Development Tools:** Keep in `scripts/`, `tools/` (if used in build)
- **AI/Research Tools:** Move to `/_meta/ai/` or `/_meta/research/`
- **Process Docs:** Move to `/_meta/process/`

### For Maintainers

- **Append-Only Logging:** Use `/_meta/logs/` for all logging
- **Process Documentation:** Update `/_meta/process/` with new procedures
- **Archive Deprecated:** Move unused assets to `/_meta/archive/`

### For Handoffs

- **Review `/_meta/`** for complete process understanding
- **Check `/_meta/logs/`** for recent activity and issues
- **Reference `/_meta/process/`** for operational procedures
- **Use `/_meta/archive/`** for historical context

## File Organization Principles

1. **Runtime vs Non-Runtime:** Clear separation between what's needed for the app to run vs what's needed for development/maintenance
2. **Append-Only Logging:** All logs go to `/_meta/logs/` with daily rotation
3. **Process Documentation:** All procedures and workflows documented in `/_meta/process/`
4. **Historical Preservation:** Archive rather than delete deprecated content
5. **Context Preservation:** Maintain context and decision history in `/_meta/`

## Integration with Main Repository

- **Build Process:** `/_meta/` is ignored by build systems
- **Git:** `/_meta/logs/` is ignored by git (append-only, local only)
- **Documentation:** Main docs reference `/_meta/` for process information
- **CI/CD:** Process documentation in `/_meta/process/` guides deployment

## Maintenance

- **Regular Cleanup:** Review and archive outdated content quarterly
- **Log Rotation:** Daily log rotation with 30-day retention
- **Process Updates:** Update process docs when procedures change
- **Archive Management:** Maintain archive with clear organization and access

---

**Last Updated:** 2025-01-27T13:11:03Z  
**Maintained By:** Development Team  
**Review Schedule:** Quarterly
