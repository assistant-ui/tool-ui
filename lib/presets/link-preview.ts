import type { SerializableLinkPreview } from "@/components/tool-ui/link-preview";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface LinkPreviewData {
  linkPreview: SerializableLinkPreview;
  localActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function generateLinkPreviewCode(data: LinkPreviewData): string {
  const { linkPreview, localActions } = data;
  const props: string[] = [];

  props.push(`  id="${linkPreview.id}"`);
  props.push(`  href="${linkPreview.href}"`);

  if (linkPreview.title) {
    props.push(`  title="${escape(linkPreview.title)}"`);
  }

  if (linkPreview.description) {
    props.push(`  description="${escape(linkPreview.description)}"`);
  }

  if (linkPreview.image) {
    props.push(`  image="${linkPreview.image}"`);
  }

  if (linkPreview.domain) {
    props.push(`  domain="${linkPreview.domain}"`);
  }

  if (linkPreview.favicon) {
    props.push(`  favicon="${linkPreview.favicon}"`);
  }

  if (linkPreview.ratio) {
    props.push(`  ratio="${linkPreview.ratio}"`);
  }

  if (linkPreview.createdAt) {
    props.push(`  createdAt="${linkPreview.createdAt}"`);
  }

  const linkPreviewCode = `<LinkPreview\n${props.join("\n")}\n/>`;
  if (!localActions || localActions.length === 0) {
    return linkPreviewCode;
  }

  return `${linkPreviewCode}
<LocalActions
  surfaceId="${linkPreview.id}"
  actions={${JSON.stringify(localActions, null, 2).replace(/\n/g, "\n  ")}}
  onAction={(actionId) => console.log("Local action:", actionId)}
/>`;
}

export type LinkPreviewPresetName = "basic" | "with-image" | "with-actions";

export const linkPreviewPresets: Record<
  LinkPreviewPresetName,
  PresetWithCodeGen<LinkPreviewData>
> = {
  basic: {
    description: "Simple link preview with title and description",
    data: {
      linkPreview: {
        id: "link-preview-basic",
        href: "https://react.dev/reference/rsc/server-components",
        title: "React Server Components",
        description:
          "Server Components are a new type of Component that renders ahead of time.",
        domain: "react.dev",
      },
    } satisfies LinkPreviewData,
    generateExampleCode: generateLinkPreviewCode,
  },
  "with-image": {
    description: "Link preview with OG image",
    data: {
      linkPreview: {
        id: "link-preview-image",
        href: "https://en.wikipedia.org/wiki/History_of_computing_hardware",
        title: "A brief history of computing hardware",
        description:
          "Mechanical calculators, vacuum tubes, transistors, microprocessors — and what came next.",
        image:
          "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=2046",
        domain: "wikipedia.org",
        ratio: "16:9",
      },
    } satisfies LinkPreviewData,
    generateExampleCode: generateLinkPreviewCode,
  },
  "with-actions": {
    description: "Link preview with external local actions",
    data: {
      linkPreview: {
        id: "link-preview-actions",
        href: "https://developer.mozilla.org/en-US/docs/Web/API",
        title: "Web APIs | MDN",
        description:
          "When writing code for the Web, there are a large number of Web APIs available.",
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200",
        domain: "developer.mozilla.org",
        favicon: "https://developer.mozilla.org/favicon.ico",
        ratio: "16:9",
      },
      localActions: [
        { id: "open", label: "Open", variant: "default" },
        { id: "copy", label: "Copy link", variant: "secondary" },
      ],
    } satisfies LinkPreviewData,
    generateExampleCode: generateLinkPreviewCode,
  },
};
