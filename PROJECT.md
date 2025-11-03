# tool-ui-playground Project Documentation

## Project Overview

**tool-ui-playground** is an open-source component library for rendering tool call widgets in TypeScript/React chat applications. The primary focus is on creating beautiful, accessible, production-ready components that display the results of LLM tool calls in chat interfaces.

### Key Principles

1. **Copy-paste distribution** - Components are NOT published to npm. Users copy code directly into their projects (Shadcn-style).
2. **Framework agnostic** - Works with assistant-ui, Vercel AI SDK, or any TypeScript/React chat application.
3. **JSON-serializable props** - All component props (except event handlers) must be JSON-serializable to work with LLM tool call responses.
4. **Accessibility first** - WCAG 2.1 AA compliance is mandatory, not optional.
5. **TypeScript strict mode** - Full type safety with all interfaces exported.

### Target Users

- Developers building AI chat applications
- Users of assistant-ui seeking pre-built widget components
- Teams needing accessible, responsive tool result displays

---

## Project Status

### Current Phase: **Phase 1 Complete** ✅

**What's Done:**
- ✅ Next.js 15.5.4 project setup with TypeScript
- ✅ Tailwind CSS 4 with CSS variables for theming
- ✅ Base UI components (Button, Card, Tabs, Input, Switch, Label)
- ✅ Interactive playground with 3-column layout
- ✅ Collapsible navigation sidebar
- ✅ Collapsible controls panel
- ✅ Dynamic routing (`/playground/[component]`)
- ✅ Component registry system
- ✅ Theme toggle (light/dark)
- ✅ Responsive viewport preview (mobile/tablet/desktop)
- ✅ Code generation panel
- ✅ Sample data and presets
- ✅ Placeholder DataTable component

**What's Next:**
- **Phase 2**: Build the full DataTable component (see DataTable Specification section)
- **Phase 3**: Add documentation site with Fumadocs
- **Phase 4**: Additional components (Form, Chart, FileBrowser, etc.)

---

## Tech Stack

### Core Framework
- **Next.js**: 15.5.4 (App Router, React Server Components)
- **React**: 19.2.0
- **TypeScript**: 5.9.3 (strict mode)
- **Node**: >=18.0.0
- **Package Manager**: pnpm 10.18.0

### Styling
- **Tailwind CSS**: 4.1.14 (latest with `@import` syntax)
- **PostCSS**: 8.5.6
- **class-variance-authority**: 0.7.1
- **clsx**: 2.1.1
- **tailwind-merge**: 3.3.1

### UI Primitives (Radix UI)
- `@radix-ui/react-dropdown-menu`: 2.1.16
- `@radix-ui/react-alert-dialog`: 1.1.15
- `@radix-ui/react-slot`: 1.2.3
- `@radix-ui/react-label`: 2.1.0
- `@radix-ui/react-select`: 2.1.0
- `@radix-ui/react-switch`: 1.1.0
- `@radix-ui/react-tabs`: 1.1.0

### Icons & Fonts
- **lucide-react**: 0.544.0
- **geist**: 1.5.1 (Sans & Mono fonts)

### Development Tools
- **ESLint**: 9.x
- **Prettier**: 3.6.2 with Tailwind plugin
- **Git**: Version control

---

## Project Structure

```
tool-ui-playground/
├── app/                          # Next.js App Router
│   ├── globals.css              # Tailwind + CSS variables
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   │
│   └── playground/              # Interactive playground
│       ├── layout.tsx           # Playground layout (header + nav)
│       ├── page.tsx             # Redirects to default component
│       ├── playground-context.tsx # Shared state (theme, viewport)
│       │
│       ├── [component]/         # Dynamic component routes
│       │   └── page.tsx         # Component-specific page
│       │
│       └── components/          # Playground-specific components
│           ├── component-nav.tsx      # Left sidebar navigation
│           ├── controls-panel.tsx     # Right controls panel
│           ├── preset-selector.tsx    # Preset scenarios
│           └── code-panel.tsx         # Code generation display
│
├── components/
│   ├── ui/                      # Base UI components (Shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── switch.tsx
│   │
│   └── registry/                # Widget components (copy-paste)
│       └── data-table/          # DataTable component
│           └── index.tsx        # Placeholder (Phase 2: full implementation)
│
├── lib/
│   ├── utils.ts                 # cn() helper for className merging
│   ├── sample-data.ts           # Sample datasets for playground
│   └── components-registry.ts   # Component metadata registry
│
├── public/                      # Static assets
├── .gitignore                   # Git ignore patterns
├── .prettierrc                  # Prettier configuration
├── LICENSE                      # Apache-2.0
├── README.md                    # User-facing documentation
├── PROJECT.md                   # This file - comprehensive project guide
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml              # Dependency lock file
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
└── eslint.config.ts            # ESLint configuration
```

---

## Architecture Decisions

### 1. Copy-Paste Distribution (Shadcn Model)

**Why:**
- Users maintain full control over component code
- No npm package versioning issues
- Easy customization without forking
- No bundle size from unused components

**How:**
- Components live in `components/registry/[component-name]/`
- Each component has a README with installation instructions
- Future: CLI tool for automated installation (`npx tool-ui add data-table`)

### 2. Dynamic Routing for Components

**Structure:** `/playground/[component]`

**Why:**
- Scalable: Easy to add new components
- Shareable URLs: Each component gets its own URL
- Clean separation: Each component can have custom controls

**Files:**
- `app/playground/[component]/page.tsx` - Dynamic route handler
- `lib/components-registry.ts` - Component metadata and routing

### 3. Three-Column Playground Layout

```
┌────────────────────────────────────────────────────────────┐
│ Header (full width): Logo | Theme | Viewport | Share       │
├────────┬───────────────────────────────┬───────────────────┤
│ Nav    │ Preview Area                  │ Controls          │
│ (240px)│                               │ (320px)           │
│        │                               │                   │
│ • Data │                               │ • Presets         │
│   Table│                               │ • Config          │
│        │                               │ • State           │
│        │                               │   [X] Close       │
│ [<]    ├───────────────────────────────┴───────────────────┤
│        │ Code Panel (collapsed by default)                 │
└────────┴───────────────────────────────────────────────────┘
```

**Features:**
- **Left Nav**: Collapsible (240px → 60px), persists in localStorage
- **Center Preview**: Responsive frame (mobile/tablet/desktop)
- **Right Controls**: Collapsible with floating button when hidden
- **Bottom Code**: Full-width, collapsed by default, max-height with scroll

### 4. React Context for Shared State

**File:** `app/playground/playground-context.tsx`

**Shares:**
- `theme`: "light" | "dark"
- `viewport`: "mobile" | "tablet" | "desktop"

**Why:**
- Layout manages global state (header controls)
- Page components access state via `usePlayground()` hook
- Clean separation of concerns

### 5. CSS Variables for Theming

**File:** `app/globals.css`

**Design Tokens:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... etc */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... etc */
}
```

**Benefits:**
- Compatible with assistant-ui themes
- Easy to customize
- Automatic dark mode support
- Shadcn/ui conventions

---

## Component Development Guidelines

### Required Props Structure

All widget components must accept JSON-serializable props:

```typescript
interface ComponentProps {
  // ✅ JSON-serializable data
  columns: Column[];
  rows: Record<string, string | number | boolean | null>[];
  config?: {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    emptyMessage?: string;
    isLoading?: boolean;
  };

  // ✅ Event handlers (non-serializable, but expected)
  onAction?: (id: string, data: any) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;

  // ✅ assistant-ui specific (optional)
  messageId?: string;
}
```

### Accessibility Checklist

All components must meet WCAG 2.1 AA:

- [ ] Keyboard navigation (Tab, Enter, Arrows, Esc)
- [ ] Screen reader support (semantic HTML, ARIA labels)
- [ ] Focus management (visible focus indicators, no traps)
- [ ] Color contrast (4.5:1 text, 3:1 interactive)
- [ ] Reduced motion support (`prefers-reduced-motion`)

### Responsive Design

Components must handle three breakpoints:

- **Mobile** (<640px): Card layout, no horizontal scroll
- **Tablet** (640-767px): Optimized table or cards
- **Desktop** (≥768px): Full table with horizontal scroll if needed

### Testing Requirements

Before marking a component complete:

1. **Functional tests**: All features work
2. **Keyboard navigation**: Tab through entire component
3. **Screen reader**: Test with VoiceOver/NVDA
4. **Responsive**: Test all three viewport sizes
5. **Theme**: Works in light and dark modes
6. **Empty/loading states**: Display correctly

---

## DataTable Component Specification

### Overview

The DataTable component is the first widget in the library. It displays tabular data from LLM tool calls with sorting, actions, and responsive layouts.

### Key Features

1. **Column Configuration**
   - Customizable labels, alignment (left/right/center)
   - Optional sorting per column
   - Optional width constraints

2. **Sorting**
   - Click header to cycle: none → asc → desc → none
   - Visual indicators (arrow icons)
   - Controlled or uncontrolled state

3. **Row Actions**
   - 1-2 actions: Inline buttons
   - 3+ actions: Dropdown menu
   - Optional confirmation dialogs for destructive actions

4. **States**
   - Loading: Inline skeleton (3-5 rows)
   - Empty: Centered message with custom text
   - Normal: Full table display

5. **Responsive**
   - Desktop (≥768px): Full table
   - Mobile (<640px): Card layout with stacked fields

6. **Accessibility**
   - Sortable headers with `aria-sort`
   - Action buttons with row context labels
   - Full keyboard navigation
   - Screen reader announcements

### File Structure (Phase 2)

```
components/registry/data-table/
├── index.tsx                   # Re-exports
├── data-table.tsx              # Root component + context
├── data-table-header.tsx       # <thead> compound component
├── data-table-body.tsx         # <tbody> compound component
├── data-table-row.tsx          # <tr> compound component
├── data-table-cell.tsx         # <td> compound component
├── data-table-actions.tsx      # Actions (inline/dropdown)
├── data-table-skeleton.tsx     # Loading state
├── utilities.ts                # sortData(), formatCellValue(), etc.
├── types.ts                    # TypeScript interfaces
└── README.md                   # Installation & usage docs
```

### Props API

```typescript
interface DataTableProps {
  columns: Column[];
  rows: Record<string, Primitive>[];
  actions?: Action[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  isLoading?: boolean;
  maxHeight?: string;
  messageId?: string;
  onAction?: (actionId: string, row: Record<string, any>, context?: ActionContext) => void;
  onSort?: (columnKey: string, direction: "asc" | "desc") => void;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}
```

### Implementation Notes

- **Compound components**: Use React Context for shared state
- **Memoization**: `useMemo` for sorted data, `useCallback` for handlers
- **Controlled/Uncontrolled**: Support both patterns for sorting
- **Performance**: Optimized for up to ~100 rows (document limit)

For full specification, see the DataTable Specification document provided during Phase 1 planning.

---

## Development Workflow

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open playground
open http://localhost:3000/playground
```

### Available Scripts

```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx,md,json}\"",
  "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,md,json}\""
}
```

### Git Workflow

```bash
# Feature development
git checkout -b feature/component-name
# ... make changes ...
git add .
git commit -m "feat: description"
git push origin feature/component-name

# Commit message format
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructure
# test: testing
# chore: maintenance
```

### Adding a New Component

1. **Create component files**
   ```bash
   mkdir -p components/registry/[component-name]
   ```

2. **Add to registry**
   ```typescript
   // lib/components-registry.ts
   {
     id: "component-name",
     label: "Component Name",
     description: "Short description",
     icon: IconName,
     path: "/playground/component-name",
   }
   ```

3. **Create playground page logic**
   ```typescript
   // app/playground/[component]/page.tsx
   if (componentId === "component-name") {
     return <YourComponent {...props} />
   }
   ```

4. **Add sample data**
   ```typescript
   // lib/sample-data.ts
   export const sampleYourComponent = { ... }
   ```

5. **Test in playground**
   ```bash
   open http://localhost:3000/playground/component-name
   ```

---

## Playground System

### Navigation (`app/playground/components/component-nav.tsx`)

- **Collapsible sidebar** with component list
- **Active state** based on current route
- **Persists** collapse state in localStorage
- **Icons** from `lib/components-registry.ts`

### Controls (`app/playground/components/controls-panel.tsx`)

Three tabs:
1. **Presets**: Pre-configured scenarios
2. **Config**: Component-specific settings
3. **State**: Loading, sorting, etc.

**Collapsible**: Close button hides panel, floating button restores

### Preview (`app/playground/[component]/page.tsx`)

- **Responsive frame**: Adjusts width based on viewport selection
- **Live rendering**: Component updates in real-time
- **Event handling**: Actions trigger alerts (demo purposes)

### Code Generation (`app/playground/components/code-panel.tsx`)

- **Auto-generates** code snippets from current state
- **Collapsible**: Closed by default to save space
- **Copy button**: One-click clipboard copy
- **Max height**: Scrolls when code is long

---

## CSS Variables & Theming

### Design Token Structure

```css
@layer base {
  :root {
    /* Colors */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* Borders & Inputs */
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;

    /* Charts (future use) */
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;

    /* Radius */
    --radius: 0.5rem;
  }

  .dark {
    /* Dark mode overrides */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... etc */
  }
}
```

### Usage in Components

```tsx
// Uses HSL color space
<div className="bg-primary text-primary-foreground">
  {/* Automatically themed */}
</div>

// Custom utilities in globals.css
.bg-primary {
  background-color: hsl(var(--primary));
}
```

---

## Future Enhancements

### Phase 3: Documentation Site

**Tools:**
- Fumadocs (MDX-based docs)
- API reference generation
- Interactive examples

**Content:**
- Getting started guide
- Component API docs
- Integration guides (assistant-ui, Vercel AI SDK)
- Accessibility documentation
- Customization examples

### Phase 4: Additional Components

**Candidates:**
- **Form Widget**: Dynamic form generation from JSON schema
- **Chart Widget**: Recharts/Visx for data visualization
- **File Browser**: Tree view for file/folder structures
- **Image Gallery**: Grid/carousel for images
- **Map Widget**: Leaflet/Mapbox integration
- **Code Editor**: Monaco/CodeMirror for code display

### Component Registry CLI

```bash
# Future CLI tool
npx tool-ui add data-table

# Downloads component files + dependencies
# Adds to components/registry/data-table/
```

### Testing Infrastructure

- **Unit tests**: Vitest for component logic
- **Integration tests**: Playwright for playground
- **Accessibility tests**: axe-core automated checks
- **Visual regression**: Percy or Chromatic

---

## Common Issues & Solutions

### Issue: Tailwind classes not applying

**Solution:**
- Check `@import "tailwindcss"` is first in `globals.css`
- Verify PostCSS config has `@tailwindcss/postcss`
- Clear `.next` cache: `rm -rf .next && pnpm dev`

### Issue: Dark mode not working

**Solution:**
- Ensure `suppressHydrationWarning` on `<html>` tag
- Check `document.documentElement.classList.toggle("dark")` is called
- Verify CSS variables are defined for `.dark` class

### Issue: Component not showing in navigation

**Solution:**
- Add to `lib/components-registry.ts`
- Import icon from `lucide-react`
- Check path matches route structure

### Issue: Localhost errors on startup

**Solution:**
- Kill all node processes: `killall node`
- Remove lock files: `rm -rf node_modules pnpm-lock.yaml`
- Reinstall: `pnpm install`
- Clear Next.js cache: `rm -rf .next`

---

## Key Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.ts` | Next.js configuration |
| `postcss.config.mjs` | PostCSS plugins (Tailwind) |
| `eslint.config.ts` | ESLint rules |
| `.prettierrc` | Code formatting rules |
| `.gitignore` | Git ignore patterns |

### Core Application Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout (fonts, metadata) |
| `app/globals.css` | CSS variables, Tailwind imports |
| `app/page.tsx` | Homepage |
| `app/playground/layout.tsx` | Playground layout (header, nav) |
| `app/playground/playground-context.tsx` | Shared state context |

### Library Files

| File | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` helper for classNames |
| `lib/sample-data.ts` | Sample datasets for playground |
| `lib/components-registry.ts` | Component metadata & routing |

---

## Assistant-UI Integration

### How Components Work with assistant-ui

1. **LLM makes tool call** with structured params
2. **Tool executes** and returns data in component-compatible format
3. **assistant-ui renders component** with tool result as props
4. **User interacts** with component (sort, actions, etc.)
5. **Actions trigger** follow-up messages to LLM

### Example Integration

```typescript
// Tool definition
import { DataTable } from '@/components/registry/data-table'

const tools = {
  getStocks: {
    description: 'Fetch stock data',
    parameters: z.object({
      columns: z.array(z.object({ ... })),
      rows: z.array(z.record(z.any())),
    }),
    execute: async (args) => {
      // Fetch data
      return {
        columns: [...],
        rows: [...],
      }
    },
    // Register UI component
    render: DataTable,
  },
}
```

### assistant-ui Specific Props

```typescript
interface DataTableProps {
  // ... standard props ...

  // assistant-ui integration
  messageId?: string;
  onAction?: (actionId: string, row: Record<string, any>, context: {
    messageId?: string;
    sendMessage?: (message: string) => void;
  }) => void;
}
```

---

## Design Decisions Log

### Why Tailwind CSS 4?

- Latest version with improved `@import` syntax
- Better performance with Turbopack
- Matches assistant-ui docs tech stack
- Future-proof for upcoming features

### Why Copy-Paste Distribution?

- **Control**: Users maintain full control over code
- **Customization**: Easy to modify without forking
- **No Dependencies**: No npm package version conflicts
- **Bundle Size**: Only include what you use
- **Proven**: Shadcn/ui model is widely adopted

### Why Radix UI?

- **Accessibility**: Built-in WCAG compliance
- **Headless**: Full styling control with Tailwind
- **Primitives**: Low-level building blocks
- **Battle-tested**: Used by Vercel, Shadcn, many others

### Why Next.js App Router?

- **React Server Components**: Better performance
- **File-based routing**: Intuitive structure
- **Layouts**: Shared UI between routes
- **Future**: Aligned with React's direction

### Why pnpm?

- **Fast**: Faster than npm/yarn
- **Efficient**: Shared dependency storage
- **Strict**: Better dependency management
- **Monorepo-friendly**: Future expansion support

---

## Getting Help

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives
- **assistant-ui**: https://www.assistant-ui.com
- **Shadcn/ui**: https://ui.shadcn.com (reference)

### Debugging Tips

1. **Check browser console** for React/Next.js errors
2. **Clear .next cache** if builds are acting strange
3. **Restart dev server** after config changes
4. **Use React DevTools** to inspect component state
5. **Check network tab** for API/routing issues

---

## Project Milestones

### Phase 1: Foundation ✅ (Completed)

- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Base UI components
- [x] Playground infrastructure
- [x] Component registry system
- [x] Dynamic routing
- [x] Collapsible panels
- [x] Theme system
- [x] Code generation

### Phase 2: DataTable Component (Next)

- [ ] Compound component architecture
- [ ] Sorting functionality
- [ ] Row actions (inline + dropdown)
- [ ] Loading & empty states
- [ ] Responsive card layout
- [ ] Accessibility implementation
- [ ] Utility functions
- [ ] Component documentation

### Phase 3: Documentation (Future)

- [ ] Fumadocs setup
- [ ] API reference pages
- [ ] Integration guides
- [ ] Component registry
- [ ] Example gallery

### Phase 4: Expansion (Future)

- [ ] Additional components
- [ ] CLI tool
- [ ] Testing suite
- [ ] CI/CD pipeline
- [ ] Community contributions

---

## License & Contributing

**License:** Apache-2.0

**Contributing:**
- Project is in active development
- Contributions welcome after Phase 2
- Follow existing code style (Prettier enforced)
- All PRs must pass linting and type checks
- Accessibility is non-negotiable

---

## Contact & Links

- **Repository**: [GitHub link - TBD]
- **Documentation**: [Docs site - TBD]
- **assistant-ui**: https://www.assistant-ui.com
- **License**: Apache-2.0

---

*Last Updated: 2024-10-31*
*Current Version: 0.1.0*
*Current Phase: Phase 1 Complete, Starting Phase 2*
