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
  | "actions"
  | "portrait"
  | "square"
  | "podcast"
  | "product"
  | "document"
  | "screenshot"
  | "gallery"
  | "edgeCases";

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

// ============================================================
// PORTRAIT IMAGE (9:16 Stories format)
// ============================================================
const portraitPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-portrait",
    assetId: "media-card-portrait",
    kind: "image",
    src: "https://images.unsplash.com/photo-1729944950511-e9c71556cfd4?w=450&h=800&auto=format&fit=crop",
    alt: "Vintage CRT monitor with green text display",
    title: "The terminal aesthetic",
    description: "Before GUIs, this green glow was the face of computing.",
    ratio: "9:16",
    domain: "unsplash.com",
    createdAtISO: "2025-11-20T10:00:00.000Z",
    source: {
      label: "RetroTech Archive",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=retro",
    },
  },
};

// ============================================================
// SQUARE IMAGE (1:1 social media format)
// ============================================================
const squarePreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-square",
    assetId: "media-card-square",
    kind: "image",
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&auto=format&fit=crop",
    alt: "Close-up of a vintage circuit board",
    title: "Silicon dreams",
    description: "A macro view of the circuits that changed everything.",
    ratio: "1:1",
    fit: "cover",
    domain: "unsplash.com",
    createdAtISO: "2025-11-18T14:30:00.000Z",
  },
};

// ============================================================
// PODCAST EPISODE (Long-form audio)
// ============================================================
const podcastPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-podcast",
    assetId: "media-card-podcast",
    kind: "audio",
    src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
    title: "Oral History: The ARPANET Years",
    description: "Vint Cerf recounts the early days of packet switching, the first successful message transmission, and the culture of collaboration that built the internet.",
    thumb: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?w=400&auto=format&fit=crop",
    durationMs: 4823000, // ~80 minutes
    fileSizeBytes: 76800000, // ~76MB
    domain: "computerhistory.org",
    createdAtISO: "2025-11-10T08:00:00.000Z",
    source: {
      label: "Computing Pioneers Podcast",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=podcast",
      url: "https://computerhistory.org/podcast",
    },
  },
};

// ============================================================
// PRODUCT IMAGE (E-commerce style)
// ============================================================
const productPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-product",
    assetId: "media-card-product",
    kind: "image",
    src: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&auto=format&fit=crop",
    alt: "Vintage mechanical keyboard with beige keycaps",
    title: "Model M Keyboard",
    description: "The legendary IBM buckling spring keyboard. Built to last decades.",
    ratio: "4:3",
    fit: "contain",
    domain: "vintagecomputing.shop",
    createdAtISO: "2025-11-25T12:00:00.000Z",
    source: {
      label: "Vintage Computing Shop",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=shop",
      url: "https://vintagecomputing.shop",
    },
  },
  responseActions: [
    { id: "add-to-cart", label: "Add to Cart", variant: "default" },
    { id: "wishlist", label: "Save", variant: "secondary" },
  ],
};

// ============================================================
// DOCUMENT LINK (PDF/document preview)
// ============================================================
const documentPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-document",
    assetId: "media-card-document",
    kind: "link",
    href: "https://example.com/turing-1936.pdf",
    src: "https://example.com/turing-1936.pdf",
    title: "On Computable Numbers (1936)",
    description: "Alan Turing's foundational paper introducing the concept of a universal computing machine. PDF, 36 pages.",
    thumb: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600&h=400&fit=crop",
    ratio: "4:3",
    domain: "archive.org",
    createdAtISO: "1936-11-12T00:00:00.000Z",
    source: {
      label: "Internet Archive",
      iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=archive",
    },
    og: {
      title: "On Computable Numbers, with an Application to the Entscheidungsproblem",
      description: "Proceedings of the London Mathematical Society",
    },
  },
};

// ============================================================
// SCREENSHOT (Auto ratio, minimal metadata)
// ============================================================
const screenshotPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-screenshot",
    assetId: "media-card-screenshot",
    kind: "image",
    src: "https://images.unsplash.com/photo-1677022725616-91e41d36db21?w=1200&auto=format&fit=crop",
    alt: "Screenshot of early Macintosh desktop",
    title: "macpaint-demo.png",
    ratio: "auto",
    createdAtISO: "2025-11-28T09:15:00.000Z",
  },
};

// ============================================================
// GALLERY ITEM (Carousel-ready, consistent sizing)
// ============================================================
const galleryPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-gallery",
    assetId: "media-card-gallery",
    kind: "image",
    src: "https://images.unsplash.com/photo-1594202304180-f25d9c992442?w=800&h=600&auto=format&fit=crop",
    alt: "Xerox Alto workstation with mouse and keyboard",
    title: "Xerox Alto (1973)",
    description: "3 of 24",
    ratio: "4:3",
    fit: "cover",
    createdAtISO: "2025-11-01T00:00:00.000Z",
    source: {
      label: "Computing History Gallery",
    },
  },
};

// ============================================================
// EDGE CASES (Missing data, minimal content)
// ============================================================
const edgeCasesPreset: MediaCardConfig = {
  card: {
    id: "media-card-preview-edge",
    assetId: "media-card-edge",
    kind: "image",
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
    alt: "Low resolution test image",
    // No title
    // No description
    // No source
    ratio: "1:1",
    // Very small image to test low-res handling
  },
};

export const mediaCardPresets: Record<MediaCardPresetName, MediaCardConfig> = {
  image: imagePreset,
  video: videoPreset,
  audio: audioPreset,
  link: linkPreset,
  actions: actionsPreset,
  // New presets
  portrait: portraitPreset,
  square: squarePreset,
  podcast: podcastPreset,
  product: productPreset,
  document: documentPreset,
  screenshot: screenshotPreset,
  gallery: galleryPreset,
  edgeCases: edgeCasesPreset,
};

export const mediaCardPresetDescriptions: Record<MediaCardPresetName, string> =
  {
    image: "Image attachment with title and source attribution",
    video: "Video preview with metadata, duration, and media controls",
    audio: "Audio clip with optional poster artwork and duration metadata",
    link: "Rich link preview using OpenGraph data",
    actions: "Image with response action buttons and confirmation",
    portrait: "Vertical image (9:16) for Stories/Reels format",
    square: "Square image (1:1) for social media posts",
    podcast: "Long-form audio with episode metadata",
    product: "E-commerce product image with add-to-cart actions",
    document: "PDF/document link preview",
    screenshot: "Auto-ratio screenshot with minimal metadata",
    gallery: "Carousel-ready image with position indicator",
    edgeCases: "Minimal content with missing optional fields",
  };
