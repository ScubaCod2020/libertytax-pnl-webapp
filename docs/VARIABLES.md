# Application Variables

Authoritative app-level variables persisted to localStorage and exposed via `SettingsService`.

- region (US | CA): Operating region; toggles brand assets and regional features.
- storeType (existing | new): Existing stores use historical data; new stores use targets.
- taxYear (number): Current filing year used for labels and calculations.
- taxRush (boolean): CA-only TaxRush handling.
- otherIncome (boolean): Whether office has additional revenue streams.

## Usage

- Read reactive value via `settingsService.settings$`.
- Update via `settingsService.update({ key: value })`.
- Values are saved under `localStorage['pnl_settings_v1']`.

## Notes

- Reports page may render these as inline variables within its own layout; Page Header shows a read-only summary outside Income Drivers.
