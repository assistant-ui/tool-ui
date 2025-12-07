import type { SerializableMediaCard } from "@/components/tool-ui/media-card";
import type { SerializableAction } from "@/components/tool-ui/shared";

export interface MediaCardConfig {
  card: SerializableMediaCard;
  responseActions?: SerializableAction[];
}

export type MediaCardPresetName =
  | "image"
  | "video"
  | "audio"
  | "link"
  | "actions";

const imagePreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-image",
    assetId: "media-card-image",
    kind: "image",
    src: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?w=1200&auto=format&fit=crop",
    alt: "Vintage mainframe with blinking lights",
    title: "From mainframes to microchips",
    description:
      "A snapshot of when rooms were computers — not just what ran inside them.",
    ratio: "4:3",
    domain: "unsplash.com",
    createdAtISO: "2025-02-10T15:30:00.000Z",
    fileSizeBytes: 2457600,
    source: {
      label: "Computing archives",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=archives",
      url: "https://assistant-ui.com/tools/alignment",
    },
  },
};

const videoPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-video",
    assetId: "media-card-video",
    kind: "video",
    src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    thumb:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop",
    title: "The GUI moment",
    description: "From command lines to windows, icons, menus, and pointers.",
    ratio: "16:9",
    fit: "contain",
    durationMs: 128000,
    createdAtISO: "2025-02-11T08:00:00.000Z",
    source: {
      label: "Retro demo",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=retro",
      url: "https://assistant-ui.com/tools/demo-exporter",
    },
  },
};

const audioPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-audio",
    assetId: "media-card-audio",
    kind: "audio",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    title: "Bell Labs hallway recording",
    description: "Ambient sounds where UNIX, C, and more took shape.",
    thumb:
      "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&auto=format&fit=crop",
    fileSizeBytes: 215040,
    durationMs: 30000,
    domain: "samplelib.com",
    createdAtISO: "2025-02-12T10:15:00.000Z",
    source: {
      label: "Archive reel",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=reel",
    },
  },
};

const linkPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-link",
    assetId: "media-card-link",
    kind: "link",
    href: "https://en.wikipedia.org/wiki/History_of_computing_hardware",
    src: "https://en.wikipedia.org/wiki/History_of_computing_hardware",
    title: "A brief history of computing hardware",
    description:
      "Mechanical calculators, vacuum tubes, transistors, microprocessors — and what came next.",
    ratio: "16:9",
    domain: "wikipedia.org",
    thumb:
      "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=2046",
    og: {
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2046",
      description: "A timeline of machines that shaped modern software.",
      title: "A brief history of computing hardware",
    },
  },
};

const actionsPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-actions",
    assetId: "media-card-actions",
    kind: "image",
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
    alt: "Circuit board with processor chip",
    title: "System architecture diagram",
    description:
      "A detailed overview of the microprocessor layout and memory subsystem.",
    ratio: "16:9",
    domain: "unsplash.com",
    createdAtISO: "2025-03-15T10:00:00.000Z",
    source: {
      label: "Tech archives",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=tech",
      url: "https://assistant-ui.com",
    },
  },
  responseActions: [
    { id: "download", label: "Download", variant: "secondary" },
    { id: "share", label: "Share", variant: "default" },
    {
      id: "delete",
      label: "Delete",
      confirmLabel: "Confirm delete",
      variant: "destructive",
    },
  ],
};

export const mediaCardPresets: Record<MediaCardPresetName, MediaCardConfig> = {
  image: imagePreset,
  video: videoPreset,
  audio: audioPreset,
  link: linkPreset,
  actions: actionsPreset,
};

export const mediaCardPresetDescriptions: Record<MediaCardPresetName, string> =
  {
    image: "Image attachment with title and source attribution",
    video: "Video preview with metadata, duration, and media controls",
    audio: "Audio clip with optional poster artwork and duration metadata",
    link: "Rich link preview using OpenGraph data",
    actions: "Image with response action buttons and confirmation",
  };
