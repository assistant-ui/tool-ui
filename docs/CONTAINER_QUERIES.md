# Container Queries Policy

We author components using Tailwind’s shared `@container` DSL and let the Tailwind version decide the implementation. This gives one markup that runs natively on Tailwind v4 and via plugin on Tailwind v3.2+.

- Tailwind v4: container queries are built-in. Use `@container` on the parent and variants like `@md:` on children.
- Tailwind v3.2+: install the official plugin; the same DSL works unchanged.

```html
<div class="@container/main">
  <div class="grid gap-3 @md/main:grid-cols-[1fr_auto]">
    <!-- … -->
  </div>
</div>
```

## Compat Note (publish in examples)

- Tailwind v4: works out of the box.
- Tailwind v3.2+: `npm i -D @tailwindcss/container-queries` and add the plugin:

```js
// tailwind.config.{js,ts}
module.exports = {
  plugins: [require('@tailwindcss/container-queries')],
};
```

If you use a prefix, prefix both sides: `tw-@container` on the container and `@md:tw-flex` (etc.) on children.

Users on v3 who don’t add the plugin simply get the mobile-first baseline — the `@…` rules are ignored — which is acceptable progressive enhancement.

## Guardrails (so one snippet works in both)

- Stick to the common surface area. Use `@xs–@7xl`, named containers, and arbitrary min-widths (e.g., `@[17.5rem]:…`). Avoid v4-only sugar like `@3xs`, `@2xs`, and the `@max-*`/range combinators in public snippets unless you also document how to extend v3’s plugin config to match.
- Document browser support and fallbacks. Container queries require modern browsers (Tailwind v4 targets Safari 16.4+, Chrome 111+, Firefox 128+). Publish components so they look fine at the base (no `@…`) and enhance with container queries. Don’t ship JS feature detection; CSS handles it.
- Named containers are safe. Both v4 and the v3 plugin support `@container/{name}` and variants like `@md/{name}:…`. Use them to keep components robust in unknown layouts.
- Prefix gotcha. If a team uses `prefix: 'tw-'`, they must write `tw-@container` on the container and `@md:tw-…` on children. Include this note once in your docs.

## What Not To Do

- Don’t maintain two sets of classes (`md:` and `@md:`). They can conflict and bloat examples. Prefer container queries and keep your baseline solid. Viewport breakpoints are for page-level layout, not component internals.
- Don’t ship a JS hook to toggle fallbacks. It introduces hydration/SSR edge cases and is unnecessary; CSS already does progressive enhancement well.

## Repository changes

- DataTable now unconditionally uses `@container`/`@md:`. The old feature-detection hook was removed:
  - Removed: `components/data-table/use-container-query.ts`
  - Updated: `components/data-table/data-table.tsx` (always applies `@container`, `@md:block`, `@md:hidden`)
- Docs updated with the compat note and prefix guidance (see DataTable README and usage docs).
