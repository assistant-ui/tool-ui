# Completed Work

Archive of completed features and improvements. See `TODO.md` for active work.

---

## January 2026

### Landing Page & Docs UX
- Re-evaluate landing page showcase order — prioritize most impressive/distinctive components first
- Add "Chat" viewing mode to component docs preview — Canvas / Chat / Code toggles
- Update Canvas/Chat/Code toggle styling to match existing tabs

### Visual Consistency
- Identify and address subtle visual misalignments between components
- Code Block and Terminal headers: use bg-card in dark mode to match other components
- Standardize button variants in responseActions — "Cancel" and negatory actions use tertiary variant

### Audio Component
- Dramatically improve the look of the Audio component
- Play button: solid icon and better position
- Keep scrubber and controls on same line
- Make scrubber handle primary color
- Allow description to go 2 lines max
- Smaller image border radius for proper inset with card

### Image & Image Gallery
- Revisit Image component — mobile UX for metadata without hover
- Remove bottom border under header/description on Image Gallery
- Image Gallery lightbox scrim: darker/more opaque in light mode
- Image Gallery grid thumbnails: add focus outlines, hover scale up, active scale down, cubic transition
- Revisit Image Gallery "+n" feature — removed maxVisible for now

### Terminal Component
- Ensure Terminal component adheres to color standards (like Code Block)
- Remove timing indicator from header, prepend code with label, smaller header text

### Other Components
- Fine-comb review of all social media post component UIs — fix subtle layout/spacing issues
- Add animated transitions to accordions in the Plan component
- Improve Item Carousel mobile layout — cards become too narrow
- Fix broken enter animation on preset nav active indicator

### Documentation
- Fix Citation docs accessibility section — convert markdown table to bulleted list
- Fix platform tabs visuals under Social Posts / Examples
- Ensure all components have an example preset showing responseActions

### Content
- Replace Video component video with something more visually interesting
- Use shorter nature videos for Video component examples

### Stats Display Component
- Restructure stat layout: sparkline underneath value, diff to the right of value
- Add hairline grid borders between items (no outer edges, avoid double borders)
- Typography: larger, thinner stat numbers
- Fix semantic color choices: positive metrics use green, negative use red
- Add semantic color guidance to copy-guide.md and tool-ui-examples.md
- Use varied colors for Q4 Performance preset (green/blue/purple/yellow)
- Narrower max-width (max-w-sm) for single stat case
- Remove "minimal" preset
- Conditional CardHeader rendering (already implemented)
- Full-bleed separators between stats in stacked mode (@container query)
- Reduce CardHeader to CardContent gap from gap-6 to gap-2
