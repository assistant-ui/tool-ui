# Component Architecture Guidelines

> **Purpose**  
> A concise, copy‑pasteable set of conventions for building UI components that “just work” in our codebase—**grounded in shadcn/ui primitives**, Tailwind, and the patterns we’ve established with `DataTable`, `SocialPost`, and `MediaCard`.

---

## Core Principles

1. **Shadcn-first**
   - Components are composed from **shadcn/ui** primitives (`Card`, `Button`, `DropdownMenu`, `Tooltip`, etc.).
   - All styling uses our Tailwind tokens and shadcn defaults—**no bespoke CSS** unless strictly necessary.
   - Re-export primitives via a local `_ui.tsx` adapter so downstream components stay stable if our UI library changes.

2. **Serializable-first API**
   - Public props split into:
     - **Serializable props**: pure JSON (safe to produce from tools/LLMs, safe to persist).
     - **Client props**: event handlers, className, and UI state controls.
   - Validate serializable props using **Zod** schemas (guardrails against untrusted tool data).

3. **Responsiveness via Container Queries**
   - Root containers opt‑in with `@container`.
   - Prefer container queries for layout changes (not viewport breakpoints) to keep components adaptive wherever they live (card, feed, sidebar, etc.).

4. **Accessibility is Non‑negotiable**
   - Semantic structure (`article`, `header`, `footer`, `<time>`, `lang`), **keyboard** affordances, and descriptive labels.
   - Toggle buttons expose `aria-pressed`; menus use `aria-haspopup="menu"` and meaningful triggers.
   - **Images require `alt`** (enforced in dev or schema).

5. **Predictable Interaction Model**
   - Normalized action IDs (e.g., `open`, `copyLink`, `playPause`) + event hooks:
     - `onBeforeAction` (can cancel)
     - `onAction`
     - Nested hooks for navigation/media (`onNavigate`, `onMediaEvent`)
   - Controlled/uncontrolled **state pattern**: `state`/`onStateChange` (controlled) or `defaultState` (uncontrolled).

6. **Security & Safety**
   - **Sanitize links** (http/https only), avoid `dangerouslySetInnerHTML`, never nest anchors (use **LinkOverlay** pattern).
   - All external links: `rel="noopener noreferrer"`.

---

## Repository Layout (by convention)

components//
├── \_cn.ts # cn helper re-export (from data-table/\_cn)
├── \_ui.tsx # shadcn/ui re-exports (Button, Card, etc.)
├── index.tsx # public exports
├── schema.ts # zod schemas + parseSerializable…
├── context.tsx # provider + use()
├── .tsx # root; serializable vs client props join here
├── [subparts].tsx # slots (header/body/media/actions/meta/etc.)
├── error-boundary.tsx # standard boundary (opt-in usage)
└── example.tsx # local usage examples

> **Why this matters:** the layout matches `DataTable`/`SocialPost`/`MediaCard`. An LLM or dev can open any folder and instantly understand where to add logic.

---

## Shadcn Integration

- **Always** build on top of `shadcn/ui` primitives:
  - `Card` for surfaces, `Button` for actions, `DropdownMenu` for overflow, `Tooltip` for icon-only affordances.
- Provide a **stable adapter** for primitives:

```tsx
// components/<component>/_ui.tsx
"use client";

export { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
export { Button } from "@/components/ui/button";
export {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
export {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

	•	Style with Tailwind classes and our CSS variables; no custom theme context inside component files.

⸻

Props & Schemas (template)

Serializable props (safe to pass from tools):

// schema.ts
import { z } from "zod";

export const serializableMyComponentSchema = z.object({
  id: z.string(),
  // domain-specific fields:
  title: z.string().optional(),
  description: z.string().optional(),
  createdAtISO: z.string().datetime().optional(),
  locale: z.string().optional(), // default "en-US"
  href: z.string().url().optional(),
  // ...any media/OG fields for previews...
}).superRefine((v, ctx) => {
  // add cross-field rules here (e.g., require alt for images)
});

export type SerializableMyComponent = z.infer<typeof serializableMyComponentSchema>;

export function parseSerializableMyComponent(input: unknown): SerializableMyComponent {
  const r = serializableMyComponentSchema.safeParse(input);
  if (!r.success) throw new Error(`Invalid payload: ${r.error.message}`);
  return r.data;
}

Client props (handlers/state):

export interface MyComponentClientProps {
  className?: string;
  variant?: "outline" | "elevated" | "subtle" | "ghost";
  density?: "compact" | "cozy";
  maxWidth?: string;
  isLoading?: boolean;

  // Controlled/uncontrolled UI state
  state?: Record<string, unknown>;
  defaultState?: Record<string, unknown>;
  onStateChange?: (next: Record<string, unknown>) => void;

  // Events
  onBeforeAction?: (args: { action: string; id: string }) => boolean | Promise<boolean>;
  onAction?: (action: string, payload?: unknown) => void;
  onNavigate?: (href: string) => void;
}

Root props:

export type MyComponentProps = SerializableMyComponent & MyComponentClientProps;


⸻

Context & State Pattern
	•	Export Provider and a use<Component>() hook for subparts:

// context.tsx
"use client";
import * as React from "react";
import type { SerializableMyComponent } from "./schema";

export interface MyComponentContextValue {
  data: SerializableMyComponent;
  locale: string;
  state: Record<string, unknown>;
  setState: (patch: Record<string, unknown>) => void;
  handlers: {
    onBeforeAction?: (args: { action: string; id: string }) => boolean | Promise<boolean>;
    onAction?: (action: string, payload?: unknown) => void;
    onNavigate?: (href: string) => void;
  };
}
const Ctx = React.createContext<MyComponentContextValue | null>(null);
export const useMyComponent = () => {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useMyComponent must be used within Provider");
  return v;
};
export function MyComponentProvider({ value, children }: { value: MyComponentContextValue; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

	•	Root component owns the controlled/uncontrolled state merge, then passes the resolved state via context.

⸻

Layout & Slots (repeatable pattern)
	•	Use slots to keep DOM readable and override-friendly:
	•	Header — title/eyebrow/domain/kebab
	•	Body — main content (e.g., text, list, content segments)
	•	Media — framed media region with aspect-ratio (for image/video/audio/link)
	•	Actions — primary & overflow actions; map IDs → labels/icons
	•	Meta/Footer — counts, <time>, domain/source, secondary actions
	•	Compose from shadcn’s Card:

// <component>.tsx (root)
"use client";

import { Card, CardContent, CardFooter } from "./_ui";
import { cn } from "./_cn";
import { MyComponentProvider } from "./context";
import type { MyComponentProps } from "./types"; // merged props

export const DEFAULT_LOCALE = "en-US" as const;

export function MyComponent(props: MyComponentProps) {
  const { className, variant = "outline", density = "cozy", isLoading, onNavigate, onAction, onBeforeAction, ...serializable } = props;
  const locale = serializable.locale ?? DEFAULT_LOCALE;

  // controlled/uncontrolled state
  // ...merge logic identical to SocialPost/MediaCard...

  const value = { data: serializable, locale, state: resolvedState, setState, handlers: { onNavigate, onAction, onBeforeAction } };

  return (
    <article className={cn("@container", "rounded-lg border bg-card text-card-foreground", className)} role="article" aria-labelledby={`comp-${serializable.id}-title`}>
      <MyComponentProvider value={value}>
        <Card className="border-0 shadow-none">
          <CardContent className={density === "compact" ? "p-3" : "p-4"}>
            {/* <Header /> <Media /> <Body /> */}
          </CardContent>
          <CardFooter className={density === "compact" ? "p-3 pt-0" : "p-4 pt-0"}>
            {/* <Actions /> <Meta /> */}
          </CardFooter>
        </Card>
      </MyComponentProvider>
    </article>
  );
}

Note: The outer <article> provides @container + semantics. The inner shadcn Card handles spacing and default surface visuals.

⸻

Responsiveness
	•	Mark root with @container and compose container-query classes in slots:
	•	Example: media grid switches from 2 → 3 columns with @md:grid-cols-3.
	•	Actions collapse into a kebab on narrow containers (optional phase two).
	•	Use style={{ aspectRatio }} for media frames; choose sensible defaults per kind:
	•	image: cover, video: contain with preload="metadata", audio: compact row.

⸻

Accessibility Checklist (apply to every new component)
	•	Structure: <article> when self-contained content; <header>, <footer>, <time dateTime> when applicable; lang={locale} passthrough.
	•	Images: meaningful alt (warn in dev or enforce in schema).
	•	Buttons: icon-only → tooltip + aria-label. Toggle → aria-pressed.
	•	Keyboard: interactive surfaces support Enter/Space; focus ring visible.
	•	Links: no nested anchors. Use a LinkOverlay when the entire card is clickable. External links set rel="noopener noreferrer".

⸻

Navigation & Actions
	•	Normalized actions with IDs (e.g., open, copyLink, download, muteToggle).
	•	Implement:
	•	onBeforeAction({ action, id }) → boolean | Promise<boolean> (cancel support)
	•	onAction(action, payload)
	•	onNavigate(href) (called from every anchor/button that navigates)
	•	Optimistic UI state (e.g., toggling mute) is fine; external effects belong to the host app.

⸻

Performance Guidelines
	•	Images: loading="lazy" + decoding="async", set width/height where known to reduce CLS.
	•	Video/Audio: playsInline, preload="metadata", poster for video when available.
	•	Memoize derived values (splitText, formatted times) if expensive.
	•	Defer heavy work to caller; components render given data—no implicit fetching.

⸻

Error Handling & Skeletons
	•	Provide a local error-boundary.tsx for opt‑in protection around complex render paths.
	•	Skeletons should mirror layout (e.g., avatar line + media rectangle), not a generic gray block.
	•	Add state: "loading" | "error" to serializable props when your component must reflect tool run states.

⸻

Testing (quick hits)
	•	Schema parses valid payloads and rejects invalid ones (image without alt, missing src, bad URLs).
	•	A11y snapshot: buttons expose aria-pressed when toggled; <time> present when createdAtISO.
	•	No nested anchors when LinkOverlay is used; onNavigate fires once per click.

⸻

LLM “Do/Don’t” for New Components

Do
	•	Mirror this folder layout and patterns.
	•	Start from shadcn components via _ui.tsx.
	•	Separate serializable vs client props and validate with Zod.
	•	Use container queries and Tailwind utilities only.
	•	Add a minimal example in example.tsx.

Don’t
	•	Import third‑party component kits inside component code.
	•	Inline business logic or data fetching.
	•	Use dangerouslySetInnerHTML.
	•	Create hard-coded platform brand clones.

⸻

Example: Slot Anatomy (Minimal)

// header.tsx
"use client";
import { useMyComponent } from "./context";
export function Header() {
  const { data } = useMyComponent();
  return (
    <header>
      {data.title && (
        <h3 id={`comp-${data.id}-title`} className="font-medium">
          {data.title}
        </h3>
      )}
      {/* eyebrow/domain/source, menus if needed */}
    </header>
  );
}

// actions.tsx
"use client";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./_ui";
import { useMyComponent } from "./context";

export function Actions() {
  const { data, state, setState, handlers } = useMyComponent();
  async function run(id: string) {
    const ok = (await handlers.onBeforeAction?.({ action: id, id: data.id })) ?? true;
    if (!ok) return;
    // optimistic local state toggles if needed...
    handlers.onAction?.(id);
  }
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="ghost" aria-label="Open" onClick={() => run("open")}>Open</Button>
          </TooltipTrigger>
          <TooltipContent>Open</TooltipContent>
        </Tooltip>
        {/* more actions */}
      </div>
    </TooltipProvider>
  );
}


⸻

Final Notes
	•	Components should be platform‑inspired where appropriate but not brand clones.
	•	Favor small, composable parts over monoliths; let renderers (if any) only manage ordering/layout, never duplicate logic.
	•	Keep the copy/paste path frictionless: shadcn primitives, Tailwind classes, and familiar slot anatomy ensure anyone can drop a new component into the app and it will “just work.”

```
