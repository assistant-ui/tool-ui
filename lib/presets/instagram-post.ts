import type { InstagramPostData } from "@/components/tool-ui/instagram-post";
import type { ActionsProp } from "@/components/tool-ui/shared";

export interface InstagramPostConfig {
  post: InstagramPostData;
  responseActions?: ActionsProp;
}

export const sampleBasic: InstagramPostConfig = {
  post: {
    id: "ig-post-basic",
    author: {
      name: "Alex Rivera",
      handle: "alexrivera",
      avatarUrl:
        "https://images.unsplash.com/photo-1695840358933-16dd7baa6dfb?w=200&h=200&fit=crop",
      verified: true,
    },
    text: "Golden hour in the city. Sometimes you just have to stop and appreciate the view.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=800&fit=crop",
        alt: "City skyline at golden hour",
      },
    ],
    stats: {
      likes: 3842,
    },
    createdAt: "2025-11-05T18:45:00.000Z",
  },
};

export const sampleCarousel: InstagramPostConfig = {
  post: {
    id: "ig-post-carousel",
    author: {
      name: "Tech Reviews",
      handle: "techreviews",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=techreviews",
      verified: true,
    },
    text: "Unboxing the new gadgets! Swipe to see all the goodies we got this week.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
        alt: "Headphones on yellow background",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        alt: "Smart watch",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop",
        alt: "Phone accessories",
      },
    ],
    stats: {
      likes: 12500,
    },
    createdAt: "2025-11-24T12:00:00.000Z",
  },
};

export const sampleWithFooterActions: InstagramPostConfig = {
  post: {
    id: "ig-post-footer",
    author: {
      name: "Travel Blog",
      handle: "wanderlust",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=travel",
    },
    text: "Paradise found! Tag someone you'd bring here.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop",
        alt: "Tropical beach with palm trees",
      },
    ],
    stats: {
      likes: 8921,
    },
    createdAt: "2025-11-23T09:30:00.000Z",
  },
  responseActions: [
    { id: "save-location", label: "Save Location" },
    { id: "view-more", label: "View More Posts" },
  ],
};

export type InstagramPostPresetName = "basic" | "carousel" | "footer-actions";

export const instagramPostPresets: Record<
  InstagramPostPresetName,
  InstagramPostConfig
> = {
  basic: sampleBasic,
  carousel: sampleCarousel,
  "footer-actions": sampleWithFooterActions,
};

export const instagramPostPresetDescriptions: Record<
  InstagramPostPresetName,
  string
> = {
  basic: "Single image post",
  carousel: "Multi-image carousel",
  "footer-actions": "Post with custom response actions",
};
