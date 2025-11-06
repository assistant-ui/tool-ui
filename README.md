# Tool UI

Open source component library for rendering tool call widgets in TypeScript/React chat applications.

## Overview

Tool UI provides a collection of beautifully designed, accessible components for displaying tool call results in AI chat applications. Built with React, TypeScript, and Tailwind CSS, these components are designed to work seamlessly with [assistant-ui](https://www.assistant-ui.com) and other chat frameworks.

## Features

- 🎨 **Beautiful Design** - Built on Radix UI primitives with Tailwind CSS
- ♿ **Accessible** - WCAG 2.1 AA compliant with full keyboard navigation
- 📱 **Responsive** - Mobile-first design with adaptive layouts
- 🎯 **Type-Safe** - Full TypeScript support
- 🎨 **Themeable** - CSS variables for easy customization
- 📋 **Copy-Paste** - Shadcn-style distribution model

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/assistant-ui/tool-ui.git
cd tool-ui

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Playground

The interactive playground is available at [http://localhost:3000/playground](http://localhost:3000/playground). Use it to:

- Test different component configurations
- Try various preset scenarios
- Generate code snippets
- Test responsive layouts
- Toggle light/dark themes

## Project Structure

```
tool-ui/
├── app/                      # Next.js app directory
│   ├── components/          # Component directory
│   └── ...
├── components/
│   ├── ui/                  # Base UI components
│   └── registry/            # Widget components
│       └── data-table/     # DataTable component (Phase 2)
├── lib/                     # Utilities and helpers
│   ├── utils.ts            # cn() helper
│   └── sample-data.ts      # Sample datasets
└── ...
```

## Components

### DataTable

A powerful, accessible data table component for displaying tabular tool call results.

**Features:**

- Column sorting (asc/desc/none)
- Row actions (inline and dropdown)
- Loading and empty states
- Responsive mobile layout (accordion cards)
- Full keyboard navigation
- Screen reader support

## Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

### Tech Stack

- **Framework:** Next.js 15.5.4
- **React:** 19.2.0
- **TypeScript:** 5.9.3
- **Styling:** Tailwind CSS 4.1.14
- **UI Primitives:** Radix UI
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Roadmap

### Phase 1: Foundation & Playground ✅

- ✅ Next.js setup
- ✅ Tailwind CSS configuration
- ✅ Base UI components
- ✅ Interactive playground
- ✅ Theme toggle
- ✅ Responsive preview

### Phase 2: DataTable Component ✅

- ✅ Compound component architecture
- ✅ Sorting functionality
- ✅ Row actions
- ✅ Responsive mobile layout (accordion cards)
- ✅ Accessibility features
- ✅ Loading and empty states

### Phase 3: Documentation & Registry (Future)

- [ ] Fumadocs integration
- [ ] API documentation
- [ ] Integration guides
- [ ] Component registry

### Phase 4: Additional Components (Future)

- [ ] Form widget
- [ ] Chart widget
- [ ] File browser widget
- [ ] And more...

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Shadcn UI](https://ui.shadcn.com)
- Built for [assistant-ui](https://www.assistant-ui.com)
- UI primitives by [Radix UI](https://www.radix-ui.com)
