import { componentsRegistry } from "@/lib/components-config";

export type DocsPageLink = {
  path: string;
  label: string;
};

export const BASE_DOCS_PAGES: DocsPageLink[] = [
  { path: "/docs/overview", label: "Overview" },
  { path: "/docs/quick-start", label: "Quick Start" },
  { path: "/docs/advanced", label: "Advanced" },
  { path: "/docs/design-guidelines", label: "UI Guidelines" },
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
