export type ComponentCategory =
  | "media"
  | "artifacts"
  | "display"
  | "input"
  | "confirmation"
  | "progress";

export interface CategoryMeta {
  label: string;
  order: number;
}

export const CATEGORY_META: Record<ComponentCategory, CategoryMeta> = {
  progress: { label: "Progress", order: 1 },
  input: { label: "Input", order: 2 },
  display: { label: "Display", order: 3 },
  artifacts: { label: "Artifacts", order: 4 },
  confirmation: { label: "Confirmation", order: 5 },
  media: { label: "Media", order: 6 },
};

export interface ComponentMeta {
  id: string;
  label: string;
  description: string;
  path: string;
  category: ComponentCategory;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "approval-card",
    label: "Approval Card",
    description: "Binary confirmation for agent actions",
    path: "/docs/approval-card",
    category: "confirmation",
  },
  {
    id: "chart",
    label: "Chart",
    description: "Visualize data with interactive charts",
    path: "/docs/chart",
    category: "artifacts",
  },
  {
    id: "citation",
    label: "Citation",
    description: "Display source references with attribution",
    path: "/docs/citation",
    category: "display",
  },
  {
    id: "code-block",
    label: "Code Block",
    description: "Display syntax-highlighted code snippets",
    path: "/docs/code-block",
    category: "artifacts",
  },
  {
    id: "data-table",
    label: "Data Table",
    description: "Present structured data in sortable tables",
    path: "/docs/data-table",
    category: "artifacts",
  },
  {
    id: "image",
    label: "Image",
    description: "Display images with metadata and attribution",
    path: "/docs/image",
    category: "media",
  },
  {
    id: "image-gallery",
    label: "Image Gallery",
    description: "Masonry grid with fullscreen lightbox viewer",
    path: "/docs/image-gallery",
    category: "media",
  },
  {
    id: "video",
    label: "Video",
    description: "Video playback with controls and poster",
    path: "/docs/video",
    category: "media",
  },
  {
    id: "audio",
    label: "Audio",
    description: "Audio playback with artwork and metadata",
    path: "/docs/audio",
    category: "media",
  },
  {
    id: "link-preview",
    label: "Link Preview",
    description: "Rich link previews with OG data",
    path: "/docs/link-preview",
    category: "display",
  },
  {
    id: "message-draft",
    label: "Message Draft",
    description: "Review and approve messages before sending",
    path: "/docs/message-draft",
    category: "artifacts",
  },
  {
    id: "option-list",
    label: "Option List",
    description: "Let users select from multiple choices",
    path: "/docs/option-list",
    category: "input",
  },
  {
    id: "order-summary",
    label: "Order Summary",
    description: "Display purchases with itemized pricing",
    path: "/docs/order-summary",
    category: "confirmation",
  },
  {
    id: "parameter-slider",
    label: "Parameter Slider",
    description: "Numeric parameter adjustment controls",
    path: "/docs/parameter-slider",
    category: "input",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Display step-by-step task workflows",
    path: "/docs/plan",
    category: "progress",
  },
  {
    id: "preferences-panel",
    label: "Preferences Panel",
    description: "Compact settings panel for user preferences",
    path: "/docs/preferences-panel",
    category: "input",
  },
  {
    id: "progress-tracker",
    label: "Progress Tracker",
    description: "Real-time status feedback for multi-step operations",
    path: "/docs/progress-tracker",
    category: "progress",
  },
  {
    id: "item-carousel",
    label: "Item Carousel",
    description: "Horizontal carousel for browsing collections",
    path: "/docs/item-carousel",
    category: "display",
  },
  {
    id: "social-post",
    label: "Social Posts",
    description: "Render social media content previews",
    path: "/docs/social-post",
    category: "artifacts",
  },
  {
    id: "stats-display",
    label: "Stats Display",
    description: "Display key metrics in a grid",
    path: "/docs/stats-display",
    category: "display",
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Show command-line output and logs",
    path: "/docs/terminal",
    category: "display",
  },
  {
    id: "question-flow",
    label: "Question Flow",
    description: "Multi-step guided questions with branching",
    path: "/docs/question-flow",
    category: "input",
  },
];

export function getComponentById(id: string): ComponentMeta | undefined {
  return componentsRegistry.find((component) => component.id === id);
}
