# Completed Work

Archive of completed features and improvements. See `TODO.md` for active work.

---

## January 2026

### Landing Page Showcase
- Removed X Post example from showcase (less relevant)
- Made Stats Display the first component shown
- Updated parameter slider response text to "Bumped the bass a bit. Here's the current EQ if you want to dial it in further."

### Video Component
- Fixed video src using reliable Archive.org nature video (forest canopy)

### Documentation Structure
- Removed "When To Use" sections from all 18 component docs (overly prescriptive)
- Updated internal documentation templates (tool-ui-reviewer.md, tool-ui-documenter.md, generate-tool-ui.plan.md)

### Component Polish
- Audio (Compact): added spacing between title and description, increased time indicator font-size
- Chart (Monthly Revenue): replaced green/red colors with teal (#14B8A6) and watermelon (#F87171)
- Image: removed hover overlay state (title/source now always visible in footer)

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

### Parameter Slider
- Fixed gallery mobile glitch by adding `isolate` to SliderPrimitive.Root (creates stacking context, prevents CSS columns interference with transforms/clip-paths)

### Stats Display
- Removed decimal places from MRR stat in "mixed-formats" preset (EUR formatting)

### Receipt State Styling
- Applied consistent dimmer styling across all receipt states (`bg-card/60` + `opacity-95`)
- Components updated: OrderSummary, ProgressTracker, OptionList, ApprovalCard, PreferencesPanel

### Landing Page Browser Shell
- Added directional light reflection effect that responds to shell rotation
- Light source simulation at top-left with gradient highlight that shifts based on rotateX/rotateY
- FauxChatShellWithTuning passes rotation as CSS custom properties
- FauxChatShell uses useDirectionalLight hook to compute dynamic gradient

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

### Landing Page Showcase Refinements (Jan 15, 2026)
- Rewrote all showcase copy with casual, informative vibe (e.g., "Q4 numbers are in. Looking solid.")
- Updated movie scenario preamble to "Let's narrow things down. What sounds good?"
- Replaced debounce code example with simpler useLocalStorage hook (half the length)
- Added color to EQ sliders: red for bass, yellow for mid, blue for treble
- Added blur in/out animations to typing indicator dot with right-translate on exit (morphing effect)
- Tool UI components now appear immediately when streaming starts (instead of after preamble completes)
- Sped up text streaming by 35% (18ms per character, down from 28ms)
- Added 2.5-second initial delay to first carousel scene
- Removed Stats Display header from showcase (showing just the stats)
- Added 300ms delay to Tool UI component appearance

### Plan Component Animation Polish (Jan 15, 2026)
- Sped up task description enter animation from 200ms/100ms delay to 120ms/30ms delay
- Fixed task description alignment by changing left padding from pl-8 to pl-7 to match label position
- Removed inner circle from pending todo icons, now showing clean empty circle
- Increased pending icon border width from 1px to 2px for better visibility
- Enhanced pending icon border contrast using border-muted-foreground/30 instead of border-border
- Fixed progress bar shimmer flicker by removing background from keyframe animation (only transform animates)
- Increased shimmer contrast from rgba(255,255,255,0.4) to rgba(255,255,255,0.7) for better visibility
- Verified glow pulse and shimmer animations fire exactly once at 100% completion (already correct)

### Plan Component Visual Refinement (Jan 15, 2026)
- Unified step icon sizing with Progress Tracker: container size-5→size-6, Loader2 size-3→size-5, Check/X size-3→size-4
- Updated pending icon styling to match Progress Tracker: border→border (not border-2), border-muted-foreground/30→border-border
- Adjusted step description left padding from pl-7 to pl-8 to align with larger icons
- Added gorgeous deep emerald gradient to progress bar at 100% completion: linear-gradient(90deg, #047857, #10b981, #34d399)
- Fixed progress bar shimmer glitch by extending animation endpoint from translateX(100%) to translateX(200%)
- Added exit transition to step description (fade-out-stagger animation, reverse of enter)
- Restored original chevron animation using vertical flip (rotateY) instead of rotation
- Removed border from container housing plan steps and progress (cleaner look)
- Removed strikethrough treatment from completed steps (kept muted-foreground dimming)
