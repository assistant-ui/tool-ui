/**
 * Adapter: UI and utility re-exports for copy-standalone portability.
 *
 * This file must stay free of leaflet: the facade imports it, and leaflet
 * reads `window` at module scope. Map primitives live in `_leaflet-adapter`,
 * which only client-only modules may import.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   cn → Your Tailwind merge utility (e.g., "@/lib/utils", "~/lib/cn")
 */

export { cn } from "@/lib/utils";
