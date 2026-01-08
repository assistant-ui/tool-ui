# Tool UI — Strategic Context

## Vision

Tool UI aims to become **the standard component library for AI tool UIs**—the go-to solution for rendering tool call results, user decisions, and structured content in AI assistant interfaces.

This position is earned through four pillars:
- **Copy-paste simplicity**: The shadcn model—no npm install, just copy the code you need and own it
- **Design quality**: Beautiful, polished components that look better than alternatives
- **assistant-ui integration**: First-class support for the assistant-ui ecosystem
- **Comprehensive coverage**: All the UI patterns AI assistants need

## Current Phase

**Polish & refinement.** The core architecture and component patterns are established. Current focus is on improving quality, documentation, and developer experience.

The path to 1.0 requires:
- Real-world validation in production AI applications
- Complete component coverage for common tool call patterns
- Comprehensive documentation that makes adoption frictionless
- Stable APIs that won't break when users update

## Priorities

Current active focus:
1. **New components** — Expanding the library to cover more tool call patterns
2. **Documentation** — Improving guides, examples, and developer onboarding
3. **Component polish** — Refining existing components (APIs, visuals, accessibility)

## Non-Goals

Tool UI is NOT:
- **An npm package** — Don't suggest making this installable; the copy-paste model is intentional
- **A place for abstractions** — Don't DRY things up or add clever patterns that obscure intent
- **A package aggregator** — Don't suggest dependencies beyond shadcn prerequisites
- **A backend solution** — This is UI only; don't suggest server-side features

## Decision Principles

When facing trade-offs, prioritize in this order:

1. **Simplicity** — Fewer moving parts beats more features
2. **Convention** — Following established patterns beats novel solutions
3. **Readability** — Code that's easy to understand beats code that's clever

## Open Questions

Claude should **ask rather than assume** about:

- **Component scope** — When proposing new components, check whether they fit the library's scope
- **API design choices** — When designing props or interfaces, surface the trade-offs rather than deciding unilaterally
- **Visual design** — For styling decisions, defer to user preference rather than making autonomous calls
