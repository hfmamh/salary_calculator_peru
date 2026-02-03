# Copilot instructions for vibe_coding ✅

## Big picture (what this project is)
- Single-page, static web app (vanilla HTML/CSS/JS) that calculates Peruvian net salary, gratifications and CTS.
- Key files:
  - `index.html` — UI and script load order (must load `js/config.js` before `js/app.js`).
  - `js/config.js` — **single source of truth** for rates, UIT and tax brackets.
  - `js/app.js` — application logic and DOM wiring (calculations, helpers, event handlers).
- No build system, no bundler, no tests. Deploys via GitHub Pages (see `DEPLOY.md` and `deploy.sh`).

## What to change and where (concrete & safe edits) 🔧
- Update tax/regulatory numbers in `js/config.js` only. Keep the `CONFIG` object name and `TAX_BRACKETS` shape (min/max in UIT, rate as decimal) to avoid breaking `getTaxBracketsInSoles()` and `js/app.js`.
- Add or adjust UI fields in `index.html`. If you add inputs, wire them in `js/app.js` (read values, use `input` / `change` events) and add displays to the result area.
- If extracting logic to modules or separate files, preserve script load order in `index.html` or convert to a module-aware loader; tests and static serve will be needed when switching to modules.

## Patterns and conventions (what to follow) 📐
- Global config object: update `CONFIG` not inline literals. Examples: UIT, `AFP_RATE`, `INSURANCE_PRIME_RATE`, `TAX_BRACKETS`, `UIT_DEDUCTION`, `MAX_DEDUCTIBLE_EXPENSES_UIT`.
- Pure calculation helpers in `js/app.js`: `calculateProgressiveTax()`, `calculateGratificacion()`, `calculateCTS()`, `calculateMonthsAndDays()` — prefer extending or reusing these helpers rather than reloading logic elsewhere.
- Currency/locale formatting uses `formatCurrency()` (Intl.NumberFormat 'es-PE'); use this for any currency display to keep formatting consistent.
- Date logic uses local Date arithmetic and intentionally limits semester months to 6 — keep this behavior unless legal requirements change.

## Developer workflows (how to run & test) ▶️
- Quick manual run: open `index.html` in a browser (or run a local server `python -m http.server` and open `http://localhost:8000`).
- Deploy: follow `DEPLOY.md` or run `./deploy.sh` after adjusting the remote URL.
- Debugging: use browser DevTools; look at console for alerts and inspect DOM elements with IDs used in `js/app.js` (e.g., `grossSalary`, `netDisplay`, `annualTax`).

## Integration & edge cases to watch for ⚠️
- Script order: `js/config.js` must be loaded before `js/app.js` (see `index.html`). Changing order breaks runtime references to `CONFIG`.
- `TAX_BRACKETS` are declared in UIT units in `config.js` and converted by `getTaxBracketsInSoles()` — when adding brackets, follow existing object shape {min, max, rate}.
- Inputs can be blank or zero; the app guards against negative wages but not against non-number strings—prefer `parseFloat(... ) || 0` when adding code.

## Small examples (explicit edits)
- To update UIT for a new year: change `CONFIG.UIT_2024` in `js/config.js` and verify calculations in browser.
- To add a new tax bracket: add an entry to `CONFIG.TAX_BRACKETS` (min/max in UIT), then reload page — no other changes required.
- To add a new display value: add an element with an `id` in `index.html` and set its `.textContent` in `calculateNetSalary()`.

## Non-goals / Things not present
- There is no CI, unit tests, or linter configured. Avoid adding large infra changes without a follow-up plan (e.g., switch to modules, add tests, add package.json).

---

## Optional: Short Jest unit-test example (how to add tests) ✅
- Add a minimal Node setup locally: `npm init -y` and `npm i -D jest`.
- Extract pure helpers into a small testable module, e.g., create `js/calc.js` that exports functions used by `js/app.js` (keep `js/app.js` as the browser entry):

```javascript
// js/calc.js (example)
function calculateProgressiveTax(taxableAmount, brackets) { /* copy logic */ }
function calculateMonthsAndDays(start, end) { /* copy logic */ }
module.exports = { calculateProgressiveTax, calculateMonthsAndDays };
```

- Add tests in `__tests__/calc.test.js`:

```javascript
const { calculateProgressiveTax, calculateMonthsAndDays } = require('../js/calc');

test('progressive tax simple', () => {
  const brackets = [{min:0, max:1000, rate:0.1}];
  expect(calculateProgressiveTax(500, brackets)).toBeCloseTo(50);
});
```

- Add `"test": "jest"` to `package.json` scripts and run `npm test` locally.

Notes: keep tests narrowly focused on pure functions (no DOM). Use `testEnvironment: 'jsdom'` in `jest.config.js` only if you need DOM APIs.

---

## Optional: Minimal GitHub Actions workflow (run tests & deploy to Pages) ✅
- Create `.github/workflows/deploy.yml` with this minimal, official-pages flow that runs on push to `main` and publishes the repo root to GitHub Pages:

```yaml
name: Test and Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - name: Build static site
        run: echo "No build step; publishing repo root"
      - uses: actions/configure-pages@v3
      - uses: actions/upload-pages-artifact@v1
        with:
          path: ./
      - uses: actions/deploy-pages@v1
```

- If you prefer not to run tests on CI yet, remove the `npm test` step. If you want a simpler deploy-only action, use `peaceiris/actions-gh-pages` to push to the `gh-pages` branch instead.

---

If you'd like, I can (A) create `js/calc.js` and a sample `__tests__/calc.test.js`, (B) add `package.json` and `jest` devDependency, and (C) add the workflow file — tell me which of A/B/C to create and I will add them as safe, minimal files. ✅