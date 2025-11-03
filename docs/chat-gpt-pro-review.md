Below is a straight‑talk, line‑by‑line code review of what you shared. I’m focusing on what would make experienced OSS engineers pause: correctness, a11y, SSR/Next gotchas, API cohesion, typing, serialization, styling, and maintainability. I include concrete, minimal patches where fixes are obvious.

⸻

Executive summary

Strong: clean compound-component architecture, thoughtful mobile card mode, tidy formatting primitives (FormatConfig), good separation of concerns (actions, cells, header, row), solid sort util incl. numeric-like & ISO date strings, and a nice scroll-shadow hook.

Needs attention before a public launch:
	•	A11y: sortable headers aren’t keyboard-accessible; actions are good, headers aren’t.
	•	Tailwind: you’re using nonstandard variants (@md:) and invalid classes (bg-linear-to-*), which will break on typical Tailwind setups unless stated explicitly.
	•	Docs ↔ Types mismatch: “Serializable (no Dates)” vs. Date in row types + formatters. Clarify and/or constrain.
	•	Mobile primary/secondary logic: default “first two columns = primary” ignores hideOnMobile and can mis-prioritize.
	•	Next.js routing: app/playground/[component]/page.tsx is a client component using params: Promise + notFound()—that will misbehave.
	•	Context typing: useDataTable uses unknown as casts; it works but leaks type safety inside child components.
	•	Small, real bugs: invalid class names (size6, bg-linear-to-*), missing UI dep in README (tooltip), and a few rough edges (e.g., clipped cells, keyboard handlers).

Fix these and the library will feel production‑grade.

⸻

High‑priority issues (blockers)

1) Sortable header is not keyboard accessible
	•	README claims Enter/Space activate sort. In DataTableHead you only wire onClick; no tabIndex, role="button", or onKeyDown.
	•	Screen reader discoverability will be mediocre because a plain <th> is not interactive by default.

Fix (minimal):

// components/data-table/data-table-header.tsx
-  return (
-    <th
+  return (
+    <th
       className={cn(/* ... */)}
       style={column.width ? { width: column.width } : undefined}
-      onClick={handleClick}
+      onClick={handleClick}
+      onKeyDown={(e) => {
+        if (isDisabled) return
+        if (e.key === 'Enter' || e.key === ' ') {
+          e.preventDefault()
+          handleClick()
+        }
+      }}
+      tabIndex={isDisabled ? -1 : 0}
+      role="button"
       aria-sort={/* ... */}
       aria-disabled={isDisabled || undefined}
     >

2) Tailwind variants & classes will surprise users
	•	You use @md: (e.g., @md:hidden, @md:block, @md:min-h-[36px]) and @container class (className="@container"). That’s not standard Tailwind; it requires a specific container-query plugin or custom variant mapping.
	•	You also use invalid gradient classes: bg-linear-to-r / bg-linear-to-l. Tailwind’s class is bg-gradient-to-r/l.

Action:
	•	Docs: Explicitly list your Tailwind + plugin requirements and example config (including which plugin gives you @md: and @container).
	•	Code fixes (gradients):

- bg-linear-to-r
+ bg-gradient-to-r
- bg-linear-to-l
+ bg-gradient-to-l

Files:
	•	components/data-table/data-table.tsx (scroll affordances)

3) Mobile “first 2 columns = primary” miscounts when columns are hidden

In categorizeColumns (accordion card), you base default primary/secondary on the original index:

columns.forEach((col, index) => {
  if (col.hideOnMobile) return;  // filtered out
  if (!priority) {
    if (index < 2) primary.push(col) else secondary.push(col)
  }
})

If the first column is hideOnMobile, the next two still look like index 1 & 2, so you get only one primary. You need a counter of visible, non-hidden columns.

Fix:

function categorizeColumns(columns: Column[]) {
  const primary: Column[] = []
  const secondary: Column[] = []

- columns.forEach((col, index) => {
+ let seenVisible = 0
+ columns.forEach((col) => {
    if (col.hideOnMobile) return;

    if (col.priority === "primary") {
      primary.push(col);
    } else if (col.priority === "secondary") {
      secondary.push(col);
    } else if (col.priority === "tertiary") {
      return;
    } else {
-     if (index < 2) {
+     if (seenVisible < 2) {
        primary.push(col);
      } else {
        secondary.push(col);
      }
+     seenVisible++;
    }
  });

  return { primary, secondary };
}

File: components/data-table/data-table-accordion-card.tsx.

4) Next.js route page is incorrect (client page with async params + notFound())

app/playground/[component]/page.tsx is a client component ("use client") with:
	•	params: Promise<{ component: string }>
	•	calling params.then(...) inside render
	•	calling notFound() from a client module (intended for server components).

This will cause hydration issues and brittle navigation.

Two safe patterns (pick one):
	•	Server page (recommended): remove "use client", make the page a server component, accept params normally ({ params: { component: string } }), and call notFound() server‑side.
	•	Client page: use useEffect to resolve params and useRouter().replace('/404') if needed (don’t notFound()).

Server version sketch:

// app/playground/[component]/page.tsx  (server component)
import { notFound } from "next/navigation";
import { DataTable } from "@/components/registry/data-table";
import { presets } from "@/lib/sample-data";
import { getComponentById } from "@/lib/components-registry";

export default function ComponentPage({ params }: { params: { component: string } }) {
  const component = getComponentById(params.component);
  if (!component) notFound();

  // If you need client state, move the preview into a child `"use client"` component
  return <YourClientPreview componentId={component.id} />;
}

5) Docs vs. code: serialization contract is inconsistent

README claims: “Serializable – Every prop and payload must be JSON-serializable (no functions, Dates, …).”
But:
	•	RowPrimitive includes Date.
	•	formatters.DateValue accepts string | Date.
	•	parseSerializableDataTable & Zod schema do not allow Date (rows only accept string|number|boolean|null|string[]).

You need to pick one and enforce it:
	•	If you truly want JSON‑only payloads, drop Date from type unions and require ISO strings. Keep the formatter accepting strings only.
	•	Or, relax the schema to accept ISO strings and Date (not recommended for tool payloads that cross process boundaries).

Suggested approach (cleanest):
	•	Keep payloads JSON‑only → remove Date from RowPrimitive, from renderFormattedValue value type, and from DataTableRowData.
	•	Keep DateValue but only accept strings; parse as Date internally.
	•	Update README (“all data payloads are JSON; pass dates as ISO strings”).
	•	Keep formatters.format supporting { kind: 'date' } on strings.

6) Context typing round‑trips through unknown

useDataTable returns DataTableContextValue<T> via as unknown as ...; inside children you sometimes call useDataTable<DataTableRowData>(), which defeats generic inference.
	•	This is safe at runtime, but erodes type ergonomics for consumers.
	•	It’s fine to ship v0 with this, but I’d expect commentary in the code and README (“generic typing is best-effort”).

Optional improvement (later): Pattern where you pass the context type parameter via a generic Provider component, or expose a typed hook from the DataTable render path (heavier change).

⸻

Medium‑priority issues (polish and correctness)

7) Missing UI dependency in README

DataTableHeader imports Tooltip, TooltipProvider, etc. README’s dependency list and “Also ensure you have these UI components” omit tooltip.tsx.

Fix: Add @/components/ui/tooltip to README and the dependency list.

8) Invalid Tailwind class

In app/components/ui/thread.tsx, you have:

<ArrowUp className="size6" />

This should be size-6 if you’ve got a plugin, or standard Tailwind h-6 w-6. Use the latter to avoid surprises:

- <ArrowUp className="size6" />
+ <ArrowUp className="h-6 w-6" />

9) Row key param not used

DataTableRowProps includes index, but DataTableRow never uses it.

Fix: remove index from the prop and invocation in DataTableBody. (You already compute keys in DataTableBody.)

10) Cell content clipping

DataTableCell applies max-w-[200px] truncate to every cell. That’s opinionated and can hide content unexpectedly.

Suggestion: make truncation opt‑in:
	•	Only apply truncate when column specifies width or truncate?: boolean.
	•	Or apply truncate on small screens via a container query variant.

11) Action labelling heuristics can be weird

getActionLabel() falls back to Object.values(row)[0] which could be a non‑string ([object Object]), a number, etc. Prefer a predictable fallback.

Safer fallback:

- : row.name || row.title || row.id || Object.values(row)[0]
+ : row.name ?? row.title ?? row.id ?? String(row[rowIdKey] ?? "")

(You can pass rowIdKey optionally into getActionLabel from context.)

12) LinkValue title is okay, but click propagation handling should be consistent

You stop propagation on the link; that’s good. For accessibility, consider adding aria-label when external is true (you already add the ↗ marker).

13) Sort util: string numeric-like parsing is nice—document it

parseNumericLike is forgiving (commas & spaces). Good. Consider documenting precedence in README (“numeric-like strings sorted numerically, else case-insensitive lexical; ISO-like YYYY-MM-DD sorted as dates”). It avoids “why did ‘1,200’ sort above ‘900’?” issues.

14) useScrollShadow ResizeObserver + window listeners

Looks correct (effect‑scoped, cleaned up). In strict-mode development double-mount, it will attach twice; you already clean up on unmount. 👍

15) Controlled vs uncontrolled sort clarity

The onSort contract clears to (undefined, undefined); you reflect that in README—good. Make sure examples also show how to “cycle” off (you did). All good.

16) DataTableAccordionCard “simple card” action click doesn’t stop propagation

In the accordion case you e.stopPropagation() for action buttons (👍). In SimpleCard, you don’t—no accordion there, so it’s fine. Just confirming intent.

⸻

Low‑priority (nits & doc clarity)
	•	Version headers: Several files have // @assistant-ui/widgets v0.1.0 - data-table while README says 0.1.0 and change log 0.1.0 (but README earlier says “NEW in v0.2.0” in the Column interface for priority—typo). Keep versions consistent.
	•	DataTableProps messageId/sendMessage in onAction context: fine, but it contradicts README’s “every prop is serializable”. Clarify that data payloads (columns/rows/actions) are serializable; handler props are not (obviously).
	•	renderFormattedValue: when value is an array but format.kind !== 'array', you’ll String(value) → “a,b,c”. That’s OK but consider a dash like you do for nulls, or keep current behavior but document.
	•	Percent sign display: PercentValue uses absolute value for formatting but preserves sign with showSign. That’s correct and consistent—just noting.
	•	Badge/status tailwind tokens: Using bg-accent / text-accent-foreground for “success” isn’t semantic but acceptable for v0; consider semantic color tokens later.

⸻

Concrete patches (ready-to-paste)

A) Fix keyboard accessibility for header + gradients

--- a/components/data-table/data-table-header.tsx
+++ b/components/data-table/data-table-header.tsx
@@ export function DataTableHead({ column }: DataTableHeadProps) {
   const shouldShowTooltip = column.abbr || displayText.length > 15;

   return (
-    <th
+    <th
       className={cn(
         "text-muted-foreground px-4 text-sm font-medium",
         "py-3 @md:py-3",
         "max-w-[150px]",
         alignClass,
         !isDisabled &&
           "hover:text-foreground active:bg-muted/50 cursor-pointer select-none",
         isDisabled && "opacity-60 cursor-not-allowed",
       )}
       style={column.width ? { width: column.width } : undefined}
-      onClick={handleClick}
+      onClick={handleClick}
+      onKeyDown={(e) => {
+        if (isDisabled) return
+        if (e.key === "Enter" || e.key === " ") {
+          e.preventDefault()
+          handleClick()
+        }
+      }}
+      tabIndex={isDisabled ? -1 : 0}
+      role="button"
       aria-sort={
         isSorted
           ? direction === "asc"
             ? "ascending"
             : "descending"
           : undefined
       }
       aria-disabled={isDisabled || undefined}
     >

--- a/components/data-table/data-table.tsx
+++ b/components/data-table/data-table.tsx
@@
-            {scrollShadow.canScrollLeft && (
-              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-linear-to-r to-transparent" />
-            )}
-            {scrollShadow.canScrollRight && (
-              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-linear-to-l to-transparent" />
-            )}
+            {scrollShadow.canScrollLeft && (
+              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent" />
+            )}
+            {scrollShadow.canScrollRight && (
+              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l to-transparent" />
+            )}

B) Fix mobile column prioritization with hideOnMobile

--- a/components/data-table/data-table-accordion-card.tsx
+++ b/components/data-table/data-table-accordion-card.tsx
@@
-function categorizeColumns(columns: Column[]) {
+function categorizeColumns(columns: Column[]) {
   const primary: Column[] = [];
   const secondary: Column[] = [];
-
-  columns.forEach((col, index) => {
+  let seenVisible = 0;
+  columns.forEach((col) => {
     if (col.hideOnMobile) return;

     if (col.priority === "primary") {
       primary.push(col);
     } else if (col.priority === "secondary") {
       secondary.push(col);
     } else if (col.priority === "tertiary") {
       return;
     } else {
-      if (index < 2) {
+      if (seenVisible < 2) {
         primary.push(col);
       } else {
         secondary.push(col);
       }
+      seenVisible++;
     }
   });

   return { primary, secondary };
 }

C) Fix invalid Tailwind class in chat UI

--- a/app/components/ui/thread.tsx
+++ b/app/components/ui/thread.tsx
@@
-            <ArrowUp className="size6" />
+            <ArrowUp className="h-6 w-6" />

D) Remove unused index prop from DataTableRow

--- a/components/data-table/data-table-row.tsx
+++ b/components/data-table/data-table-row.tsx
@@
-interface DataTableRowProps {
-  row: DataTableRowData;
-  index: number;
-  className?: string;
-}
+interface DataTableRowProps {
+  row: DataTableRowData;
+  className?: string;
+}
 
-export function DataTableRow({ row, className }: DataTableRowProps) {
+export function DataTableRow({ row, className }: DataTableRowProps) {

--- a/components/data-table/data-table-body.tsx
+++ b/components/data-table/data-table-body.tsx
@@
-        return <DataTableRow key={rowKey} row={row} index={index} />
+        return <DataTableRow key={rowKey} row={row} />

E) README + schema consistency (docs change)
	•	In README: replace “Every prop and payload must be JSON-serializable (no functions, Dates…)” with:

Serialization contract: All data payloads (columns, rows, actions) are JSON-serializable (no functions, Symbols, class instances). Dates must be passed as ISO strings (e.g., "2025-11-03T12:34:56Z"). Handler props like onAction are regular functions and are not serialized.

	•	In types: if you follow that, update:
	•	RowPrimitive → remove Date from the union.
	•	renderFormattedValue param type: value: string | number | boolean | null | string[].

(Alternatively, allow Date in Zod schema—but that’s less robust for tools.)

⸻

Documentation & developer‑experience gaps
	•	Tailwind container queries: Show your tailwind.config.cjs snippet (plugin & variant keys). Without it, @md: will be a head‑scratcher.
	•	Required UI primitives: Add tooltip.tsx to the “ensure you have these UI components” list.
	•	Sorting rules: Clarify numeric-like and ISO date detection (and that other strings sort lexically, case‑insensitive).
	•	Performance guidance: You already note no virtualization >100 rows. Add examples of paging or an external “pager” companion component to set expectations.
	•	Type safety: Call out that useDataTable<T>() is best-effort typing (since context is not generic at runtime). Offer a typed wrapper example if consumers really need it.

⸻

Nice‑to‑have refinements
	•	Truncation strategy: Don’t blanket truncate + max-w-[200px] on all cells. Respect column.width or column.truncate?: boolean.
	•	getActionLabel: If you keep it, consider accepting rowIdKey as 3rd param and fallback to that instead of Object.values(row)[0].
	•	Header width: max-w-[150px] on header text may be too tight for a table library. Leave width to the column width prop or remove the max width.
	•	Exports: You export parseSerializableDataTable and serializableDataTableSchema in index.tsx—good call. Also export a DataTableJsonPayload type alias that matches the schema to improve DX when building tools.

⸻

What’s good (keep it)
	•	The formatting model (FormatConfig) is exactly what most chat UIs need (data‑driven, serializable, easily themed). The number/percent/currency/delta semantics are sane and consistent.
	•	Actions defaulting to inline buttons vs. menu is a good heuristic; you also handle destructive colors in the menu—nice touch.
	•	Scroll affordances are tasteful and non‑intrusive. The hook is small and testable.
	•	Mobile accordion UX is appropriately opinionated and aligns with how real chat widgets get embedded.

⸻

If you want, I can produce a small PR branch plan with the above diffs applied (plus README clarifications and Tailwind config snippet). But even if you just apply the patches above, you’ll sidestep the main foot‑guns that would draw negative scrutiny.