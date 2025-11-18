import type { SerializableSocialPost } from "@/components/tool-ui/social-post";

export interface SocialPostConfig {
  post: SerializableSocialPost;
}

export const sampleX: SocialPostConfig = {
  post: {
    id: "x-post-1",
    platform: "x",
    author: {
      name: "Athia Zohra",
      handle: "athiazohra",
      avatarUrl:
        "https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774",
      verified: true,
    },
    text: "Wild to think: in the 1940s we literally rewired programs by hand. Today, we ship apps worldwide with a single command.",
    entities: {
      hashtags: ["computingHistory", "eniac", "fromMainframeToMobile"],
      mentions: [],
    },
    stats: {
      likes: 5,
      comments: 2,
      reposts: 1,
      views: 450,
      bookmarks: 3,
    },
    createdAtISO: "2025-11-05T14:01:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
};

const sampleXQuoted: SocialPostConfig = {
  post: {
    id: "x-post-1",
    platform: "x",
    author: {
      name: "Athia Zohra",
      handle: "athiazohra",
      avatarUrl:
        "https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774",
      verified: true,
    },
    text: "Wild to think: in the 1940s we literally rewired programs by hand. Today, we ship apps worldwide with a single command.",
    entities: {
      hashtags: ["computingHistory", "eniac", "fromMainframeToMobile"],
      mentions: [],
    },
    quotedPost: {
      id: "x-post-quoted-1",
      platform: "x",
      author: {
        name: "CHM Archives",
        handle: "computerhistory",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CHM",
        verified: true,
      },
      text: "A look back at the transition from vacuum tubes to transistors to microprocessors — every leap shrank the hardware and expanded possibility.",
      linkPreview: {
        url: "https://www.computerhistory.org/semiconductor/",
        title: "From Tubes to Transistors",
        description: "The invention that powered the information age.",
        imageUrl:
          "https://images.unsplash.com/photo-1668954729109-165b4aea3416?w=600&h=400&fit=crop",
        domain: "computerhistory.org",
      },
      stats: {
        likes: 842,
        comments: 56,
        reposts: 123,
        views: 8500,
      },
      createdAtISO: "2025-11-05T13:00:00.000Z",
    },
    stats: {
      likes: 5,
      comments: 2,
      reposts: 1,
      views: 450,
      bookmarks: 3,
    },
    createdAtISO: "2025-11-05T14:01:00.000Z",
    actions: [
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
      avatarUrl:
        "https://images.unsplash.com/photo-1695840358933-16dd7baa6dfb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=822",
      verified: true,
    },
    text: "Swipe through: a 1970s terminal, a 1980s home computer, and a 1990s laptop. In a few decades, ‘computer rooms’ fit into backpacks.",
    entities: {
      hashtags: ["retroComputing", "vintage", "progress"],
      mentions: [],
    },
    media: [
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1729944950511-e9c71556cfd4?w=800&h=800&fit=crop",
        alt: "Retro CRT terminal",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1677022725616-91e41d36db21?w=800&h=800&fit=crop",
        alt: "Vintage home computer",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1594202304180-f25d9c992442?w=800&h=800&fit=crop",
        alt: "Vintage home computer",
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

export const sampleLinkedIn: SocialPostConfig = {
  post: {
    id: "linkedin-post-1",
    platform: "linkedin",
    author: {
      name: "Dr. Michael Thompson",
      handle: "michaelthompson",
      avatarUrl:
        "https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774",
      verified: false,
      subtitle: "VP of Engineering | Systems & Cloud",
    },
    text: "From batch jobs on mainframes to autoscaling services in the cloud — the fundamentals remain: clear interfaces, small composable tools, and great teams. Sharing notes from our modernization journey.",
    entities: {
      hashtags: ["SystemsDesign", "UNIXPhilosophy", "Cloud"],
      mentions: [],
    },
    linkPreview: {
      url: "https://queue.acm.org/detail.cfm?id=3454124",
      title: "Small, Sharp Tools: Then and Now",
      description: "Why the UNIX way still matters in distributed systems.",
      imageUrl:
        "https://images.unsplash.com/photo-1488229297570-58520851e868?w=600&h=315&fit=crop",
      domain: "acm.org",
    },
    stats: {
      likes: 847,
    },
    createdAtISO: "2025-11-05T09:15:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
};

export type SocialPostPresetName = "x" | "instagram" | "linkedin";

export const socialPostPresets: Record<SocialPostPresetName, SocialPostConfig> =
  {
    x: sampleXQuoted,
    instagram: sampleInstagram,
    linkedin: sampleLinkedIn,
  };

export const socialPostPresetDescriptions: Record<
  SocialPostPresetName,
  string
> = {
  x: "X with quoted post and verified badge",
  instagram: "Instagram post with multiple images",
  linkedin: "LinkedIn post with link preview",
};
