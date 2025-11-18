# WIP Tool UIs

This directory contains **Work-In-Progress Tool UI components** for the Waymo Booking Assistant prototype. These are experimental UI components being developed and tested to determine:

1. Which tools benefit from custom UI components
2. What interaction patterns work best for different use cases
3. Which Tool UIs should be promoted to the main Tool UI library

## Purpose

The playground serves as a sandbox for:
- Prototyping Tool UIs for specific AI assistant use cases
- Experimenting with different interaction patterns
- Validating design decisions before committing to the main library
- Testing tool calling behavior and user flows

## Promotion Criteria

Tool UIs in this directory may be promoted to the main Tool UI library when they:
- Demonstrate clear value across multiple use cases
- Have stable APIs and interaction patterns
- Pass usability testing
- Show generic applicability beyond just Waymo

## Structure

```
wip-tool-uis/
├── README.md                      # This file
├── index.tsx                      # Exports all WIP components
└── <individual tool ui components>
```

## Development Guidelines

1. Use shadcn/ui components exclusively
2. Follow the existing project's TypeScript and styling conventions
3. Document the tool and use case clearly
4. Keep components focused and composable
5. Consider accessibility from the start
