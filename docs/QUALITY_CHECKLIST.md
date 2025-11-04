Audience: Large Language Models (LLMs) assisting on this repository.
Goal: Evaluate and improve a component library to production quality with minimal ambiguity.
Style: Be terse. Cite evidence (files, lines, tests) for every claim. Prefer small, safe PRs.

⸻

0) How to Use This File (LLM protocol)
	1.	Map the repo
	•	Read: package.json, tsconfig.json, README.md, src/components/**, src/lib/**, storybook files (if any), CI config.
	•	Detect: framework (React/Next), styling (Tailwind), primitives (Radix), testing stack, build & publish flow.
	2.	Run the checks below
	•	For each item, return Finding → Evidence → Fix.
	•	If a test is missing, add a failing test first (when feasible), then code, then make it pass.
	3.	Output format

# Scorecard
Accessibility: 1/2
API & DX: 2/2
...

# Blocking (P0)
- [ID] One‑line summary
  Evidence: <file>:<line> or failing test
  Fix: short action plan

# Non‑blocking
- [ID] ...

# PR plan
1) tests-a11y, 2) typing, 3) SSR, 4) perf


	4.	Constraints
	•	Do not introduce breaking API without an explicit migration note + codemod or deprecation strategy.
	•	Keep dependencies minimal; no heavy table frameworks unless explicitly requested.
	•	Maintain TypeScript strict mode. Avoid as unknown as casts on public paths.

⸻

1) P0 — Non‑negotiables (fail any → not production‑ready)

Accessibility
	•	☐ Every interactive component is operable by keyboard only (Tab/Shift+Tab, Enter/Space, arrows where applicable).
	•	☐ Sortable headers announce state with aria-sort and support Enter/Space toggling.
	•	☐ Focus is visible and managed (no loss on portal/open/close).
	•	☐ Follow WAI‑ARIA patterns for menu, dialog, combobox, tooltip, accordion. Document any intentional deviations.

API integrity
	•	☐ Consistent controlled/uncontrolled props (value/defaultValue, open/defaultOpen, sortBy/sortDirection).
	•	☐ ref forwarding on focusable elements; DOM hooks for testing (data-*).
	•	☐ Escape hatches (asChild, className, style, slots) do not break a11y.

SSR/RSC
	•	☐ No window/document at module scope. Hydration produces no warnings in Next.js App Router or Remix.
	•	☐ Side‑effects behind useEffect or guarded by typeof window.

Performance & bundle
	•	☐ Per‑component size measured (min+gzip). Tree‑shaking works (package.json: "sideEffects": false where valid).
	•	☐ Avoid unstable handlers without useCallback when passed deep.
	•	☐ Long lists: guidance or virtualization option; graceful degrade otherwise.

Security
	•	☐ No unsanitized dangerouslySetInnerHTML.
	•	☐ No style/script injection vector via user props.

⸻

2) P1 — High‑leverage multipliers

Design tokens & theming
	•	☐ Tokenized via CSS variables; respects prefers-reduced-motion.
	•	☐ Theme switch without remount; no hardcoded brand colors in components.

i18n & RTL
	•	☐ Works in RTL. No hardcoded English strings. Locale‑aware number/date formatting.

Types & runtime
	•	☐ tsconfig in strict with zero any in public API surfaces.
	•	☐ Runtime prop invariant checks in dev (helpful messages).

Distribution
	•	☐ Proper "exports" map with ESM (and CJS if supported) + types.
	•	☐ Minimal peerDependencies with sane semver ranges.
	•	☐ Works in Vite, Next, Remix, Storybook without special config.

Testing
	•	☐ Unit (logic), Integration/a11y (keyboard + ARIA), Visual regression (key states), Cross‑browser sanity (Chromium/WebKit/Firefox).

Docs
	•	☐ Live, copy‑pasteable examples. Props tables include a11y + SSR notes.
	•	☐ Document escape hatches and unsupported patterns.

Governance
	•	☐ LICENSE, SECURITY.md (private report path), CODE_OF_CONDUCT, CONTRIBUTING, release automation.

⸻

3) Red‑flag sniff tests (quick)
	•	☐ 320px width on iOS Safari remains usable.
	•	☐ prefers-reduced-motion: reduce stops non‑essential animations.
	•	☐ Focus ring not lost when using asChild/custom wrappers.
	•	☐ Importing one component doesn’t pull the whole library (check bundle analyzer).

⸻

4) Pattern‑specific probes

Data Table
	•	☐ aria-sort cycles: undefined → ascending → descending → undefined via Enter/Space and click.
	•	☐ Numeric‑like strings sort numerically; ISO‑like date strings sort chronologically; nulls last.
	•	☐ Mobile card view preserves semantics: headers and data remain associated; action buttons are reachable.
	•	☐ Tooltips are non‑essential; important info is available without hover.

Radix + Tailwind
	•	☐ Portals (menus/dialogs/tooltips) don’t trap focus; scroll lock documented.
	•	☐ Container queries (@container, @md) degrade when unsupported (doc fallback).

⸻

5) Evidence‑oriented prompts (for the LLM to ask itself)
	•	“Show the keyboard path to toggle sort on each header and the SR announcement.”
	•	“Show the CI job that runs axe and the threshold.”
	•	“Show bundle size per component (min+gzip) and the whole library when imported.”
	•	“Show hydration logs from a Next.js example page.”
	•	“Show an RTL and reduced‑motion story for each interactive component.”

⸻

6) Minimal test scaffolds (copy/paste)

Adjust paths to your project layout. Prefer adding these under __tests__/.

6.1 sortData edge cases (Jest/TS)

// __tests__/sortData.spec.ts
import { sortData } from '@/components/data-table/utilities';

type Row = { a: unknown };

test('numeric-like strings sort numerically', () => {
  const rows: Row[] = [{ a: '1,200' }, { a: '900' }, { a: ' 12 ' }];
  const asc = sortData(rows, 'a' as any, 'asc').map(r => r.a);
  expect(asc).toEqual([' 12 ', '900', '1,200']);
});

test('ISO-like dates sort chronologically', () => {
  const rows: Row[] = [{ a: '2024-05-01' }, { a: '2023-12-31' }, { a: '2025-01-01' }];
  const desc = sortData(rows, 'a' as any, 'desc').map(r => r.a);
  expect(desc).toEqual(['2025-01-01', '2024-05-01', '2023-12-31']);
});

test('nulls sort last', () => {
  const rows: Row[] = [{ a: 'b' }, { a: null }, { a: 'a' }];
  const asc = sortData(rows, 'a' as any, 'asc').map(r => r.a);
  expect(asc).toEqual(['a', 'b', null]);
});

6.2 Header a11y + sort cycle (React Testing Library)

// __tests__/DataTableHeader.a11y.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type Column } from '@/components/data-table';

type Row = { name: string; price: number };

const cols: Column<Row>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right' },
];

const rows: Row[] = [
  { name: 'B', price: 2 },
  { name: 'A', price: 1 },
];

test('aria-sort cycles via keyboard', async () => {
  render(<DataTable<Row> columns={cols} data={rows} />);
  const nameHeader = screen.getByRole('columnheader', { name: /name/i });

  // initial: undefined
  expect(nameHeader).not.toHaveAttribute('aria-sort');

  // Enter -> ascending
  await userEvent.click(nameHeader);
  expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

  // Enter -> descending
  await userEvent.click(nameHeader);
  expect(nameHeader).toHaveAttribute('aria-sort', 'descending');

  // Enter -> undefined
  await userEvent.click(nameHeader);
  expect(nameHeader).not.toHaveAttribute('aria-sort');
});

6.3 Playwright + axe (integration/a11y)

// tests/a11y.datatable.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('DataTable has no serious a11y violations', async ({ page }) => {
  await page.goto('/playground/datatable'); // point to a real route or story
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''));
  expect(serious).toEqual([]);
});

6.4 Hydration mismatch guard (Next.js)

// app/(test)/datatable-hydration/page.tsx
'use client';
import { DataTable, type Column } from '@/components/data-table';
type Row = { name: string; n: number };
const columns: Column<Row>[] = [{ key: 'name', label: 'Name' }, { key: 'n', label: 'N', align: 'right' }];
const rows: Row[] = [{ name: 'A', n: 1 }];

export default function Page() {
  return <DataTable<Row> columns={columns} data={rows} />;
}
// Expect: no hydration warnings in console on first load.


⸻

7) CI skeleton (GitHub Actions)

# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  build_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --ci
      - run: npm run test:e2e -- --reporter=line || true # allow flaky env, report anyway

(Consider adding size tracking via size-limit and a job to fail on regressions.)

⸻

8) PR template (enforce evidence)

Create .github/pull_request_template.md:

## Purpose
<!-- What user problem does this change solve? -->

## Checklist
- [ ] Tests updated/added
- [ ] A11y verified (keyboard + aria)
- [ ] SSR/RSC-safe (no hydration warnings)
- [ ] Bundle size checked
- [ ] Docs/examples updated

## Evidence
- Unit: …
- Integration/a11y: …
- Visual: …


⸻

9) Severity rubric (score 0–2 each; P0 must be ≥1)

Category	0 = missing	1 = partial	2 = solid
Accessibility	☐	☐	☐
API & DX	☐	☐	☐
SSR/RSC	☐	☐	☐
Performance	☐	☐	☐
Theming/Tokens	☐	☐	☐
i18n/RTL	☐	☐	☐
Types/Runtime	☐	☐	☐
Distribution	☐	☐	☐
Testing	☐	☐	☐
Docs	☐	☐	☐
Governance	☐	☐	☐

Interpretation:
	•	Any P0 at 0 → block release.
	•	Total <15 → not ready. 15–19 → beta. ≥20 with no P0 at 0 → stable.

⸻

10) Repo‑specific notes (tailored to this codebase)

LLM: Use these as immediate action items when working on this repository.

	•	Sortable headers: Good tri‑state logic and aria-sort. Ensure tests cover Enter/Space activation in addition to click.
	•	Tooltip + abbr: abbr[title] is announced by screen readers; keep tooltip non‑essential. If the abbreviation is critical, mirror full text in accessible name (e.g., aria-label on header or visually hidden text).
	•	Row keys: rowIdKey falls back to index. Warn in dev when sorting/filtering without a stable key; document this caveat.
	•	Types: Avoid as unknown as on context/provider values. Prefer a typed context factory or a non‑generic internal context with generic selectors.
	•	Actions: requiresConfirmation exists but is not implemented. Either implement a confirm flow (modal) or remove the flag to avoid false guarantees.
	•	Sorting rules: Numeric‑like and ISO‑like handling is implemented. Document collation limits and expose a compare override for domain sorts (e.g., natural sort).
	•	Performance: For >100 rows, recommend pagination or virtualization in docs; add an example page demonstrating “large data” guidance.

⸻

11) LLM “Do / Don’t”

Do
	•	Produce diffs that are narrowly scoped and fully typed.
	•	Add a failing test before fixing a bug when practical.
	•	Include migration notes when touching public APIs.

Don’t
	•	Add new heavy dependencies for convenience.
	•	Downgrade type safety or bypass SSR safeguards.
	•	Hide failing checks by changing CI thresholds.

⸻

End of file.

⸻

If you want, I can also generate a ready‑to‑run PR template and the CI workflow files tailored to your current scripts.