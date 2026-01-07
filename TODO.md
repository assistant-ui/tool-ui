# TODO

## Goals
- Refinement and polish as a key differentiator
- Visual consistency across all components
- Documentation that showcases components effectively

## High Priority
<!-- First impressions, consistency, and core experience -->
- [x] Re-evaluate landing page showcase order — prioritize most impressive/distinctive components first
- [x] Add "Chat" viewing mode to component docs preview — Canvas / Chat / Code toggles, where Chat shows the component in a pseudo chat UI with appropriate bubbles before and after
- [x] Identify and address subtle visual misalignments between components (e.g., code block has different bg color than other components)
- [x] Fine-comb review of all social media post component UIs — fix subtle layout/spacing issues across all of them
- [x] Update Canvas/Chat/Code toggle styling to match existing tabs — add container with padding around toggle items, high-contrast bg color for active item, same colors as tabs

## Medium Priority
<!-- Component-specific polish and improvements -->
- [x] Dramatically improve the look of the Audio component
- [x] Revisit Image component — how to make it better? Consider mobile UX: how does someone see metadata without hover?
- [x] Remove bottom border under header/description on Image Gallery component — align with other components that have similar headers
- [x] Ensure Terminal component adheres to color standards (like Code Block)
- [x] Add animated transitions to accordions in the Plan component
- [x] Improve Item Carousel mobile layout — cards become too narrow
- [x] Fix broken enter animation on preset nav active indicator (the little white vertical bar) — used to animate but no longer does
- [x] Ensure all components have an example preset showing how responseActions work with it

## Low Priority
<!-- Smaller fixes, content updates, edge cases -->
- [x] Fix Citation docs accessibility section — markdown table is broken, convert to bulleted list (refer to other docs for format)
- [x] Fix platform tabs visuals under Social Posts / Examples — should match top-level Docs / Examples tabs styling
- [x] Replace Video component video with something more visually interesting from a reliable source
- [x] Revisit Image Gallery "+n" feature — removed maxVisible feature for now

## High Priority
<!-- Visual consistency — the core differentiator -->
- [x] Code Block and Terminal headers: use bg-card in dark mode to match other components
- [x] Terminal component: remove timing indicator from header, prepend code with label, smaller header text
- [x] Standardize button variants in responseActions — "Cancel" and negatory actions should use tertiary variant (no border)

## Medium Priority
<!-- Component-specific polish -->
- [x] Image Gallery lightbox scrim: make darker/more opaque in light mode
- [x] Image Gallery grid thumbnails: add focus outlines, hover scale up, active scale down, cubic transition
- [x] Audio player fixes:
  - Play button needs solid icon and better position
  - Keep scrubber and controls on same line
  - Make scrubber handle primary color
  - Allow description to go 2 lines max
  - Smaller image border radius for proper inset with card

## Low Priority
<!-- Content/examples -->
- [x] Use shorter nature videos for Video component examples
