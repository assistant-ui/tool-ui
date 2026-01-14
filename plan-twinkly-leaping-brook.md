# Implementation Plan: Right-Side Table of Contents Navigation

## Overview

Build a right-side table of contents (TOC) navigation for docs pages that:
- Extracts H2 headings from rendered MDX content
- Highlights active section based on scroll position using IntersectionObserver
- Provides smooth scrolling with smart offset calculation
- Supports keyboard navigation (arrow keys + Enter)
- Collapses on mobile with toggle button

**Scope:** Docs site only (not a Tool UI component)

## Architecture

### Components to Create

1. **`app/docs/_components/docs-toc.tsx`** - Main TOC component
   - Client component rendering list of H2 links
   - Receives headings array and active heading ID
   - Handles click → smooth scroll with offset
   - Keyboard navigation (arrow up/down + Enter)
   - ARIA labels for accessibility

2. **`app/docs/_components/docs-toc-mobile-toggle.tsx`** - Mobile FAB
   - Floating action button (bottom-right) to show TOC on mobile
   - Only renders when headings exist and screen is mobile

3. **`app/docs/_components/docs-layout-with-toc.tsx`** - Layout wrapper
   - Extends existing `ContentLayout` pattern to support right sidebar
   - Three-column layout: left nav (220px) + content (flex-1) + right TOC (220px)
   - Provides scroll container ref via context
   - Extracts headings and passes to TOC

### Hooks to Create

1. **`hooks/use-extract-headings.ts`** - Extract H2s from DOM
   - Queries `h2[id]` elements from content container
   - Returns `{ id: string; text: string }[]`
   - Re-runs on pathname change (different doc page)

2. **`hooks/use-headings-observer.ts`** - Active section tracking
   - Uses IntersectionObserver to track visible H2s
   - Returns currently active heading ID
   - Root margin accounts for sticky header offset (~80px)
   - Cleanup on unmount

3. **`hooks/use-toc-keyboard-nav.ts`** - Keyboard navigation
   - Arrow up/down to navigate between TOC links
   - Enter to scroll to section
   - Focus management with ref tracking
   - Returns event handlers and focus state

### Context for Scroll Container

**`app/docs/_components/docs-toc-context.tsx`** - Shared context
- Provides `scrollContainerRef`, `headings`, `activeId`
- Consumed by DocsToc component
- Handles different scroll containers (DocsArticle vs ComponentDocsTabs)

## Implementation Details

### Layout Integration

**Current:** `app/docs/layout.tsx` renders:
```tsx
<ContentLayout sidebar={<DocsNav />}>{children}</ContentLayout>
```

**New:** Extend ContentLayout to support right sidebar:
```tsx
<ContentLayout
  sidebar={<DocsNav />}
  rightSidebar={<DocsToc />}
>
  {children}
</ContentLayout>
```

Modify `app/components/layout/page-shell.tsx` to accept `rightSidebar` prop and render three-column layout.

### Heading Extraction

MDX headings auto-generated with IDs by fumadocs. Extract after render:

```typescript
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const timer = setTimeout(() => {
    const h2s = container.querySelectorAll('h2[id]');
    const extracted = Array.from(h2s).map(el => ({
      id: el.id,
      text: el.textContent || ''
    }));
    setHeadings(extracted);
  }, 100); // Small delay for MDX render

  return () => clearTimeout(timer);
}, [pathname]);
```

### Scroll Tracking

Use IntersectionObserver for performance:

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  },
  {
    root: scrollContainer,
    rootMargin: '-80px 0px -80% 0px', // Account for sticky header
    threshold: [0, 0.5, 1]
  }
);
```

### Smooth Scrolling with Offset

Calculate sticky header height dynamically:

```typescript
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  const container = scrollContainerRef.current;
  if (!element || !container) return;

  // Check for ComponentDocsTabs header
  const stickyHeader = container.querySelector('[role="tablist"]');
  const offset = stickyHeader
    ? stickyHeader.getBoundingClientRect().height + 20
    : 80; // Default estimate

  const targetScroll = element.offsetTop - offset;

  if (reducedMotion) {
    container.scrollTop = targetScroll;
  } else {
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }
};
```

### Mobile Behavior

Use Sheet component for mobile overlay:

```tsx
const isMobile = useIsMobile();
const [tocOpen, setTocOpen] = useState(false);

{isMobile ? (
  <>
    <DocsTocMobileToggle onClick={() => setTocOpen(true)} />
    <Sheet open={tocOpen} onOpenChange={setTocOpen}>
      <SheetContent side="right">
        <DocsToc headings={headings} activeId={activeId} />
      </SheetContent>
    </Sheet>
  </>
) : (
  <aside className="hidden md:block w-[220px]">
    <DocsToc headings={headings} activeId={activeId} />
  </aside>
)}
```

### Styling

Match existing left sidebar aesthetics:

```tsx
// Right TOC sidebar (desktop)
<aside className="hidden md:block w-[220px] shrink-0 relative">
  <div className="from-background pointer-events-none absolute top-0 right-2 left-0 z-10 h-12 bg-linear-to-b to-transparent" />

  <nav
    aria-label="Table of contents"
    className="scrollbar-subtle h-full overflow-y-auto pt-4 pb-24"
  >
    {/* Links */}
  </nav>

  <div className="from-background pointer-events-none absolute right-2 bottom-0 left-0 z-10 h-12 bg-linear-to-t to-transparent" />
</aside>

// TOC link with active state
<a
  className={cn(
    "block py-2 px-4 text-sm rounded-lg transition-colors",
    "hover:bg-primary/5 focus-visible:ring-2",
    isActive && "bg-primary/10 text-primary font-medium border-l-2 border-primary",
    !isActive && "text-muted-foreground"
  )}
  aria-current={isActive ? "true" : undefined}
>
  {heading.text}
</a>
```

## Critical Files

### Files to Create

1. `app/docs/_components/docs-toc.tsx` - Main TOC component
2. `app/docs/_components/docs-toc-mobile-toggle.tsx` - Mobile FAB
3. `app/docs/_components/docs-toc-context.tsx` - Context provider
4. `hooks/use-extract-headings.ts` - Heading extraction
5. `hooks/use-headings-observer.ts` - IntersectionObserver logic
6. `hooks/use-toc-keyboard-nav.ts` - Keyboard navigation

### Files to Modify

1. `app/components/layout/page-shell.tsx` - Add `rightSidebar` prop support
2. `app/docs/layout.tsx` - Wire up TOC context and right sidebar

## Implementation Sequence

1. **Create hooks** - Start with foundational utilities
   - `use-extract-headings.ts`
   - `use-headings-observer.ts`
   - `use-toc-keyboard-nav.ts`

2. **Create context** - Shared state provider
   - `docs-toc-context.tsx`

3. **Create TOC component** - Main UI
   - `docs-toc.tsx` (desktop version first)

4. **Modify layout** - Integration
   - Update `page-shell.tsx` for right sidebar
   - Update `docs/layout.tsx` to use context

5. **Add mobile support** - Responsive behavior
   - `docs-toc-mobile-toggle.tsx`
   - Sheet integration in layout

6. **Polish** - Edge cases and accessibility
   - Handle pages without H2s
   - URL hash support on mount
   - ARIA labels
   - Focus indicators

## Edge Cases

- **Pages without H2s:** Don't render TOC at all
- **URL hash on load:** Scroll to `window.location.hash` if present
- **ComponentDocsTabs pages:** Extract headings from active tab content
- **Very long heading text:** Truncate with ellipsis, show tooltip
- **Reduced motion:** Use instant scroll instead of smooth

## Verification

### Manual Testing

- [ ] TOC renders on desktop for pages with H2s
- [ ] Active section highlights as user scrolls
- [ ] Clicking TOC link scrolls smoothly with correct offset
- [ ] Keyboard navigation works (arrows + Enter)
- [ ] Mobile toggle appears and Sheet opens correctly
- [ ] Works in both ComponentDocsTabs and DocsArticle layouts
- [ ] Respects `prefers-reduced-motion`
- [ ] URL hash scrolls to section on page load
- [ ] Empty TOC doesn't render for pages without H2s
- [ ] Dark/light theme transitions smooth

### Test Pages

- `/docs/quick-start` - Has H2s: Setup, Usage, Examples
- `/docs/preferences-panel` - Has ComponentDocsTabs
- `/docs/overview` - Regular DocsArticle layout
- `/docs/contributing` - Check edge cases

### Accessibility Checklist

- [ ] `aria-label` on TOC nav
- [ ] `aria-current="true"` on active link
- [ ] Keyboard focus visible
- [ ] Screen reader announces sections
- [ ] Links have meaningful text (H2 text content)

## Dependencies

**No new dependencies required.** Uses:
- `lucide-react` (already installed) for icons
- `useIsMobile` from `hooks/use-mobile.ts`
- `useReducedMotion` from `hooks/use-reduced-motion.ts`
- Sheet component from `components/ui/sheet.tsx` (already exists)
