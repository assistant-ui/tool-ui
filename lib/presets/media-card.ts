import type { SerializableMediaCard } from "@/components/tool-ui/media-card";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface MediaCardData {
  card: SerializableMediaCard;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateMediaCardCode(data: MediaCardData): string {
  const { card, responseActions } = data;
  const props: string[] = [];

  props.push(`  assetId="${card.assetId}"`);
  props.push(`  kind="${card.kind}"`);

  if (card.src) {
    props.push(`  src="${card.src}"`);
  }

  if (card.href) {
    props.push(`  href="${card.href}"`);
  }

  if (card.thumb) {
    props.push(`  thumb="${card.thumb}"`);
  }

  if (card.alt) {
    props.push(`  alt="${escape(card.alt)}"`);
  }

  if (card.title || card.og?.title) {
    props.push(`  title="${escape(card.title ?? card.og?.title ?? "")}"`);
  }

  if (card.description || card.og?.description) {
    props.push(
      `  description="${escape(card.description ?? card.og?.description ?? "")}"`,
    );
  }

  if (card.domain) {
    props.push(`  domain="${card.domain}"`);
  }

  if (card.ratio) {
    props.push(`  ratio="${card.ratio}"`);
  }

  if (card.fit) {
    props.push(`  fit="${card.fit}"`);
  }

  if (card.durationMs) {
    props.push(`  durationMs={${card.durationMs}}`);
  }

  if (card.fileSizeBytes) {
    props.push(`  fileSizeBytes={${card.fileSizeBytes}}`);
  }

  if (card.createdAt) {
    props.push(`  createdAt="${card.createdAt}"`);
  }

  if (card.locale) {
    props.push(`  locale="${card.locale}"`);
  }

  if (card.source) {
    props.push(`  source={${formatObject(card.source as Record<string, unknown>)}}`);
  }

  if (card.og) {
    props.push(`  og={${formatObject(card.og as Record<string, unknown>)}}`);
  }

  if (responseActions && responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(
      `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
    );
  }

  return `<MediaCard\n${props.join("\n")}\n/>`;
}

export type MediaCardPresetName = "image" | "video" | "audio" | "link" | "actions";

export const mediaCardPresets: Record<MediaCardPresetName, PresetWithCodeGen<MediaCardData>> = {
  image: {
    description: "Image attachment with title and source attribution",
    data: {
      card: {
        id: "media-card-preview-image",
        assetId: "media-card-image",
        kind: "image",
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
    } satisfies MediaCardData,
    generateExampleCode: generateMediaCardCode,
  },
  video: {
    description: "Video preview with thumbnail, duration, and media controls",
    data: {
      card: {
        id: "media-card-preview-video",
        assetId: "media-card-video",
        kind: "video",
        src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop",
        title: "The GUI moment",
        description: "From command lines to windows, icons, menus, and pointers.",
        ratio: "16:9",
        fit: "contain",
        durationMs: 128000,
        createdAt: "2025-02-11T08:00:00.000Z",
        source: {
          label: "Retro demo",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=retro",
          url: "https://assistant-ui.com/tools/demo-exporter",
        },
      },
    } satisfies MediaCardData,
    generateExampleCode: generateMediaCardCode,
  },
  audio: {
    description: "Audio clip with poster artwork and duration metadata",
    data: {
      card: {
        id: "media-card-preview-audio",
        assetId: "media-card-audio",
        kind: "audio",
        src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
        title: "Bell Labs hallway recording",
        description: "Ambient sounds where UNIX, C, and more took shape.",
        thumb: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&auto=format&fit=crop",
        fileSizeBytes: 215040,
        durationMs: 30000,
        domain: "samplelib.com",
        createdAt: "2025-02-12T10:15:00.000Z",
        source: {
          label: "Archive reel",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=reel",
        },
      },
    } satisfies MediaCardData,
    generateExampleCode: generateMediaCardCode,
  },
  link: {
    description: "Rich link preview using OpenGraph data",
    data: {
      card: {
        id: "media-card-preview-link",
        assetId: "media-card-link",
        kind: "link",
        href: "https://en.wikipedia.org/wiki/History_of_computing_hardware",
        src: "https://en.wikipedia.org/wiki/History_of_computing_hardware",
        title: "A brief history of computing hardware",
        description: "Mechanical calculators, vacuum tubes, transistors, microprocessors — and what came next.",
        ratio: "16:9",
        domain: "wikipedia.org",
        thumb: "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=2046",
        og: {
          imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2046",
          description: "A timeline of machines that shaped modern software.",
          title: "A brief history of computing hardware",
        },
      },
    } satisfies MediaCardData,
    generateExampleCode: generateMediaCardCode,
  },
  actions: {
    description: "Media with response action buttons and confirmation",
    data: {
      card: {
        id: "media-card-preview-actions",
        assetId: "media-card-actions",
        kind: "image",
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
        alt: "Circuit board with processor chip",
        title: "System architecture diagram",
        description: "A detailed overview of the microprocessor layout and memory subsystem.",
        ratio: "16:9",
        domain: "unsplash.com",
        createdAt: "2025-03-15T10:00:00.000Z",
        source: {
          label: "Tech archives",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=tech",
          url: "https://assistant-ui.com",
        },
      },
      responseActions: [
        { id: "delete", label: "Delete", confirmLabel: "Confirm delete", variant: "destructive" },
        { id: "download", label: "Download", variant: "secondary" },
        { id: "share", label: "Share", variant: "default" },
      ],
    } satisfies MediaCardData,
    generateExampleCode: generateMediaCardCode,
  },
};
