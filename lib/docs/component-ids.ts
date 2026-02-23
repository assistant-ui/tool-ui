export const componentIds = [
  "approval-card",
  "chart",
  "citation",
  "code-block",
  "code-diff",
  "data-table",
  "image",
  "image-gallery",
  "video",
  "audio",
  "instagram-post",
  "link-preview",
  "linkedin-post",
  "message-draft",
  "item-carousel",
  "option-list",
  "order-summary",
  "parameter-slider",
  "plan",
  "preferences-panel",
  "progress-tracker",
  "stats-display",
  "terminal",
  "question-flow",
  "weather-widget",
  "x-post",
] as const;

export type ComponentId = (typeof componentIds)[number];

export function isComponentId(
  value: string | undefined | null,
): value is ComponentId {
  if (typeof value !== "string") {
    return false;
  }

  return componentIds.includes(value as ComponentId);
}
