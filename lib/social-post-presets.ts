import type { SerializableSocialPost } from "@/components/social-post";

export interface SocialPostConfig {
  post: SerializableSocialPost;
}

export const sampleX: SocialPostConfig = {
  post: {
    id: "x-post-1",
    platform: "x",
    author: {
      name: "Sarah Chen",
      handle: "@sarahchen",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      verified: true,
    },
    text: "Just shipped a new feature! 🚀 Really excited about how this will help developers build faster. Check out the blog post for more details.",
    entities: {
      hashtags: ["webdev", "developer"],
      mentions: [],
    },
    stats: {
      likes: 1247,
      comments: 83,
      reposts: 142,
      views: 12500,
      bookmarks: 234,
    },
    createdAtISO: "2025-11-05T14:30:00.000Z",
    actions: [
      { id: "reply", label: "Reply", variant: "ghost" },
      { id: "repost", label: "Repost", variant: "ghost" },
      { id: "like", label: "Like", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
};

export const sampleInstagram: SocialPostConfig = {
  post: {
    id: "ig-post-1",
    platform: "instagram",
    author: {
      name: "Alex Rivera",
      handle: "alexrivera",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      verified: true,
    },
    text: "Golden hour at the beach 🌅 Nothing beats the California coast in autumn. Swipe for more shots from today's adventure!",
    entities: {
      hashtags: ["photography", "sunset", "california", "beach"],
      mentions: [],
    },
    media: [
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop",
        alt: "Golden sunset over ocean waves",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=800&fit=crop",
        alt: "Beach at sunset",
        aspectHint: "1:1",
      },
    ],
    stats: {
      likes: 3842,
      comments: 124,
    },
    createdAtISO: "2025-11-05T18:45:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "comment", label: "Comment", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
      { id: "save", label: "Save", variant: "ghost" },
    ],
  },
};

export const sampleTikTok: SocialPostConfig = {
  post: {
    id: "tiktok-post-1",
    platform: "tiktok",
    author: {
      name: "Jamie Park",
      handle: "@jamiepark",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
      verified: false,
    },
    text: "When you finally fix that bug that's been haunting you for days 😅 #coding #programming #devlife",
    entities: {
      hashtags: ["coding", "programming", "devlife"],
      mentions: [],
    },
    media: [
      {
        kind: "video",
        url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
        thumbUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=700&fit=crop",
        alt: "Developer celebrating fixing a bug",
        aspectHint: "9:16",
      },
    ],
    stats: {
      likes: 12400,
      comments: 287,
      shares: 543,
      views: 85200,
    },
    createdAtISO: "2025-11-05T16:20:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "comment", label: "Comment", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
};

export const sampleLinkedIn: SocialPostConfig = {
  post: {
    id: "linkedin-post-1",
    platform: "linkedin",
    author: {
      name: "Dr. Michael Thompson",
      handle: "michaelthompson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      verified: false,
      subtitle: "VP of Engineering at TechCorp | AI & Cloud Computing",
    },
    text: "Excited to share that our team has successfully migrated our entire infrastructure to a cloud-native architecture! This journey taught us valuable lessons about scalability, resilience, and team collaboration.\n\nKey takeaways:\n• Start with a clear migration strategy\n• Invest in training your team early\n• Embrace automation from day one\n• Monitor everything\n\nHappy to discuss our approach with anyone going through similar transformations.",
    entities: {
      hashtags: ["CloudComputing", "DevOps", "Engineering", "TechLeadership"],
      mentions: [],
    },
    linkPreview: {
      url: "https://example.com/blog/cloud-migration-case-study",
      title: "Cloud Migration Case Study: Lessons from the Trenches",
      description: "A comprehensive guide to our successful cloud migration journey, including challenges, solutions, and best practices.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=315&fit=crop",
      domain: "example.com",
    },
    stats: {
      likes: 847,
      comments: 56,
      reposts: 123,
    },
    createdAtISO: "2025-11-05T09:15:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "comment", label: "Comment", variant: "ghost" },
      { id: "repost", label: "Repost", variant: "ghost" },
      { id: "send", label: "Send", variant: "ghost" },
    ],
  },
};

export type SocialPostPresetName = "x" | "instagram" | "tiktok" | "linkedin";

export const socialPostPresets: Record<SocialPostPresetName, SocialPostConfig> = {
  x: sampleX,
  instagram: sampleInstagram,
  tiktok: sampleTikTok,
  linkedin: sampleLinkedIn,
};

export const socialPostPresetDescriptions: Record<SocialPostPresetName, string> = {
  x: "Twitter/X post with engagement stats and verified badge",
  instagram: "Instagram carousel post with multiple images",
  tiktok: "TikTok video post with hashtags and high view count",
  linkedin: "Professional LinkedIn post with link preview and article",
};
