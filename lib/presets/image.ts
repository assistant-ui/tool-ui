import type { SerializableImage } from "@/components/tool-ui/image";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface ImageData {
  image: SerializableImage;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateImageCode(data: ImageData): string {
  const { image, responseActions } = data;
  const props: string[] = [];

  props.push(`  id="${image.id}"`);
  props.push(`  assetId="${image.assetId}"`);
  props.push(`  src="${image.src}"`);
  props.push(`  alt="${escape(image.alt)}"`);

  if (image.title) {
    props.push(`  title="${escape(image.title)}"`);
  }

  if (image.description) {
    props.push(`  description="${escape(image.description)}"`);
  }

  if (image.href) {
    props.push(`  href="${image.href}"`);
  }

  if (image.domain) {
    props.push(`  domain="${image.domain}"`);
  }

  if (image.ratio) {
    props.push(`  ratio="${image.ratio}"`);
  }

  if (image.fit) {
    props.push(`  fit="${image.fit}"`);
  }

  if (image.fileSizeBytes) {
    props.push(`  fileSizeBytes={${image.fileSizeBytes}}`);
  }

  if (image.createdAt) {
    props.push(`  createdAt="${image.createdAt}"`);
  }

  if (image.source) {
    props.push(`  source={${formatObject(image.source as Record<string, unknown>)}}`);
  }

  if (responseActions && responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(
      `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
    );
  }

  return `<Image\n${props.join("\n")}\n/>`;
}

export type ImagePresetName = "basic" | "with-source" | "with-actions";

export const imagePresets: Record<ImagePresetName, PresetWithCodeGen<ImageData>> = {
  basic: {
    description: "Simple image with title and description",
    data: {
      image: {
        id: "image-preview-basic",
        assetId: "image-basic",
        src: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?w=1200&auto=format&fit=crop",
        alt: "Vintage mainframe with blinking lights",
        title: "From mainframes to microchips",
        description: "A snapshot of when rooms were computers.",
        ratio: "4:3",
        domain: "unsplash.com",
      },
    } satisfies ImageData,
    generateExampleCode: generateImageCode,
  },
  "with-source": {
    description: "Image with source attribution and metadata",
    data: {
      image: {
        id: "image-preview-source",
        assetId: "image-source",
        src: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?w=1200&auto=format&fit=crop",
        alt: "Vintage mainframe with blinking lights",
        title: "From mainframes to microchips",
        description: "A snapshot of when rooms were computers — not just what ran inside them.",
        ratio: "4:3",
        domain: "unsplash.com",
        createdAt: "2025-02-10T15:30:00.000Z",
        fileSizeBytes: 2457600,
        source: {
          label: "Computing archives",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=archives",
          url: "https://assistant-ui.com/tools/alignment",
        },
      },
    } satisfies ImageData,
    generateExampleCode: generateImageCode,
  },
  "with-actions": {
    description: "Image with response action buttons",
    data: {
      image: {
        id: "image-preview-actions",
        assetId: "image-actions",
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
        alt: "Circuit board with processor chip",
        title: "System architecture diagram",
        description: "A detailed overview of the microprocessor layout.",
        ratio: "16:9",
        domain: "unsplash.com",
        createdAt: "2025-03-15T10:00:00.000Z",
      },
      responseActions: [
        { id: "download", label: "Download", variant: "secondary" },
        { id: "share", label: "Share", variant: "default" },
      ],
    } satisfies ImageData,
    generateExampleCode: generateImageCode,
  },
};
