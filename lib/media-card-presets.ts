import type { SerializableMediaCard } from "@/components/media-card";

export interface MediaCardConfig {
  card: SerializableMediaCard;
}

export type MediaCardPresetName = "image" | "video" | "audio" | "link";

const imagePreset: MediaCardConfig = {
  card: {
    id: "media-card-image",
    kind: "image",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop",
    alt: "Team collaborating on laptops at a wooden desk",
    title: "Design review snapshot",
    description: "Highlights from the latest feedback session — ready for the next sprint.",
    ratio: "4:3",
    domain: "unsplash.com",
    createdAtISO: "2025-02-10T15:30:00.000Z",
    source: {
      label: "Alignment bot",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=align",
      url: "https://assistant-ui.com/tools/alignment",
    },
  },
};

const videoPreset: MediaCardConfig = {
  card: {
    id: "media-card-video",
    kind: "video",
    src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    thumb: "https://images.unsplash.com/photo-1531498860502-7c67cf02f77b?w=900&auto=format&fit=crop",
    title: "Prototype walkthrough",
    description: "2-minute recap of the latest media browsing interactions.",
    ratio: "16:9",
    fit: "contain",
    durationMs: 128000,
    createdAtISO: "2025-02-11T08:00:00.000Z",
    source: {
      label: "Demo exporter",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=demo",
      url: "https://assistant-ui.com/tools/demo-exporter",
    },
  },
};

const audioPreset: MediaCardConfig = {
  card: {
    id: "media-card-audio",
    kind: "audio",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    title: "Interview snippet",
    description: "00:30 • PM sync notes captured during the call.",
    thumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop",
    fileSizeBytes: 215040,
    durationMs: 30000,
    domain: "samplelib.com",
    createdAtISO: "2025-02-12T10:15:00.000Z",
    source: {
      label: "Call recorder",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=recorder",
    },
  },
};

const linkPreset: MediaCardConfig = {
  card: {
    id: "media-card-link",
    kind: "link",
    href: "https://assistant-ui.com/blog/tool-ui-patterns",
    src: "https://assistant-ui.com/blog/tool-ui-patterns",
    title: "Designing tool-friendly media cards",
    description:
      "How to structure robust previews for images, video, audio, and streaming tool output.",
    ratio: "16:9",
    domain: "assistant-ui.com",
    thumb: "https://images.unsplash.com/photo-1504389273929-44baec1307d2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2046",
    createdAtISO: "2025-02-05T09:45:00.000Z",
    source: {
      label: "Docs generator",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=docs",
      url: "https://assistant-ui.com",
    },
    og: {
      imageUrl:
        "https://images.unsplash.com/photo-1504389273929-44baec1307d2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2046",
      description: "Guidance for building resilient tool surfaces.",
      title: "Designing tool-friendly media cards",
    },
  },
};

export const mediaCardPresets: Record<MediaCardPresetName, MediaCardConfig> = {
  image: imagePreset,
  video: videoPreset,
  audio: audioPreset,
  link: linkPreset,
};

export const mediaCardPresetDescriptions: Record<MediaCardPresetName, string> = {
  image: "Image attachment with title, description, and tool attribution",
  video: "Video preview with metadata, duration, and media controls",
  audio: "Audio clip with optional poster artwork and duration metadata",
  link: "Rich link preview using OpenGraph data and full-card navigation",
};
