# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]
- Fix: normalize date parsing in `calculateMonthsAndDays` to avoid incorrect month/day counts caused by timezone shifts (e.g., Nov 1 – Apr 30 now correctly yields 6 months).
- UI: replace health insurance dropdown with accessible `radio-toggle` buttons (EsSalud / EPS).
- Test: add `scripts/test_months_days.js` with sanity checks for date range edge cases.
- CI: add GitHub Actions workflow to deploy to GitHub Pages (`.github/workflows/deploy.yml`).
- Docs: add `.github/copilot-instructions.md` and update `README.md` to reference changes.

---

*This file follows Keep a Changelog format (simplified).*