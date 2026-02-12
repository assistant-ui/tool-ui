import { componentsRegistry } from "@/lib/docs/component-registry";

export type DocsPageLink = {
  path: string;
  label: string;
};

export const BASE_DOCS_PAGES: DocsPageLink[] = [
  { path: "/docs/overview", label: "Overview" },
  { path: "/docs/quick-start", label: "Quick Start" },
  { path: "/docs/agent-skills", label: "Agent Skills" },
  { path: "/docs/response-actions", label: "Response Actions" },
  { path: "/docs/receipts", label: "Receipts" },
  { path: "/docs/advanced", label: "Advanced" },
  { path: "/docs/design-guidelines", label: "UI Guidelines" },
  { path: "/docs/changelog", label: "Changelog" },
  { path: "/docs/contributing", label: "Maintainer Guide" },
];

export function getAllDocsPageLinks(): DocsPageLink[] {
  return [
    ...BASE_DOCS_PAGES,
    ...componentsRegistry.map((component) => ({
      path: component.path,
      label: component.label,
    })),
  ];
}
