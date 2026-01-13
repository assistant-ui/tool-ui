export interface ComponentMeta {
  id: string;
  label: string;
  description: string;
  path: string;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "approval-card",
    label: "Approval Card",
    description: "Binary confirmation for agent actions",
    path: "/docs/approval-card",
  },
  {
    id: "chart",
    label: "Chart",
    description: "Visualize data with interactive charts",
    path: "/docs/chart",
  },
  {
    id: "citation",
    label: "Citation",
    description: "Display source references with attribution",
    path: "/docs/citation",
  },
  {
    id: "code-block",
    label: "Code Block",
    description: "Display syntax-highlighted code snippets",
    path: "/docs/code-block",
  },
  {
    id: "data-table",
    label: "Data Table",
    description: "Present structured data in sortable tables",
    path: "/docs/data-table",
  },
  {
    id: "image",
    label: "Image",
    description: "Display images with metadata and attribution",
    path: "/docs/image",
  },
  {
    id: "image-gallery",
    label: "Image Gallery",
    description: "Masonry grid with fullscreen lightbox viewer",
    path: "/docs/image-gallery",
  },
  {
    id: "video",
    label: "Video",
    description: "Video playback with controls and poster",
    path: "/docs/video",
  },
  {
    id: "audio",
    label: "Audio",
    description: "Audio playback with artwork and metadata",
    path: "/docs/audio",
  },
  {
    id: "link-preview",
    label: "Link Preview",
    description: "Rich link previews with OG data",
    path: "/docs/link-preview",
  },
  {
    id: "option-list",
    label: "Option List",
    description: "Let users select from multiple choices",
    path: "/docs/option-list",
  },
  {
    id: "order-summary",
    label: "Order Summary",
    description: "Display purchases with itemized pricing",
    path: "/docs/order-summary",
  },
  {
    id: "parameter-slider",
    label: "Parameter Slider",
    description: "Numeric parameter adjustment controls",
    path: "/docs/parameter-slider",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Display step-by-step task workflows",
    path: "/docs/plan",
  },
  {
    id: "preferences-panel",
    label: "Preferences Panel",
    description: "Compact settings panel for user preferences",
    path: "/docs/preferences-panel",
  },
  {
    id: "item-carousel",
    label: "Item Carousel",
    description: "Horizontal carousel for browsing collections",
    path: "/docs/item-carousel",
  },
  {
    id: "social-post",
    label: "Social Posts",
    description: "Render social media content previews",
    path: "/docs/social-post",
  },
  {
    id: "stats-display",
    label: "Stats Display",
    description: "Display key metrics in a grid",
    path: "/docs/stats-display",
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Show command-line output and logs",
    path: "/docs/terminal",
  },
];

export function getComponentById(id: string): ComponentMeta | undefined {
  return componentsRegistry.find((component) => component.id === id);
}
