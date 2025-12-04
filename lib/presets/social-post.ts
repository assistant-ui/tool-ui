import type { SerializableSocialPost } from "@/components/tool-ui/social-post";
import type { ActionsProp } from "@/components/tool-ui/shared";

export interface SocialPostConfig {
  post: SerializableSocialPost;
  footerActions?: ActionsProp;
}

export const sampleX: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-x",
    postId: "x-post-1",
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
    surfaceId: "social-post-preview-x-quoted",
    postId: "x-post-1",
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
      surfaceId: "social-post-preview-x-quoted-inner",
      postId: "x-post-quoted-1",
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
    surfaceId: "social-post-preview-instagram",
    postId: "ig-post-1",
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
    surfaceId: "social-post-preview-linkedin",
    postId: "linkedin-post-1",
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

const sampleActions: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-actions",
    postId: "actions-post-1",
    platform: "x",
    author: {
      name: "DevOps Weekly",
      handle: "devopsweekly",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=devops",
      verified: true,
    },
    text: "Announcing our new CI/CD pipeline templates! Check them out and let us know what you think.",
    entities: {
      hashtags: ["DevOps", "CICD", "Automation"],
      mentions: [],
    },
    stats: {
      likes: 128,
      comments: 24,
      reposts: 45,
      views: 3200,
    },
    createdAtISO: "2025-11-24T16:30:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "bookmark", label: "Bookmark", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
  footerActions: [
    { id: "view-templates", label: "View Templates" },
    { id: "report", label: "Report", variant: "destructive" },
  ],
};

// ============================================================
// VIDEO POST (X with video media)
// ============================================================
const sampleVideo: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-video",
    postId: "x-video-1",
    platform: "x",
    author: {
      name: "Computer History Museum",
      handle: "computerhistory",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=CHM",
      verified: true,
    },
    text: "Rare footage: Watch Grace Hopper explain why we call them 'bugs' in software. This 1985 interview remains one of the best explanations of early computing challenges.",
    entities: {
      hashtags: ["GraceHopper", "ComputingHistory", "Debugging"],
      mentions: [],
    },
    media: [
      {
        kind: "video",
        url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        thumbUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop",
        aspectHint: "16:9",
      },
    ],
    stats: {
      likes: 12400,
      comments: 892,
      reposts: 3200,
      views: 458000,
      bookmarks: 1560,
    },
    createdAtISO: "2025-11-20T15:30:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "share", label: "Share", variant: "ghost" },
    ],
  },
};

// ============================================================
// THREAD STARTER (X thread pattern)
// ============================================================
const sampleThread: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-thread",
    postId: "x-thread-1",
    platform: "x",
    author: {
      name: "Ken Thompson",
      handle: "ken_thompson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ken",
      verified: true,
    },
    text: "A thread on why we made certain decisions in UNIX (1/12):\n\nWhen Dennis and I started, we had one goal: make an operating system we actually wanted to use. Everything else followed from that.",
    entities: {
      hashtags: ["UNIX", "OperatingSystems"],
      mentions: ["dmr"],
    },
    stats: {
      likes: 8942,
      comments: 1247,
      reposts: 2100,
      views: 234000,
    },
    createdAtISO: "2025-11-18T10:00:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "bookmark", label: "Bookmark", variant: "ghost" },
    ],
  },
};

// ============================================================
// REEL (Instagram vertical video)
// ============================================================
const sampleReel: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-reel",
    postId: "ig-reel-1",
    platform: "instagram",
    author: {
      name: "RetroTech",
      handle: "retrotech",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=retro",
      verified: false,
    },
    text: "POV: You're debugging on an original Apple II in 1978 ✨ The green phosphor glow, the click of the keyboard, the satisfaction of finally getting it right. #retrocomputing #apple2 #nostalgia",
    entities: {
      hashtags: ["retrocomputing", "apple2", "nostalgia"],
      mentions: [],
    },
    media: [
      {
        kind: "video",
        url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
        thumbUrl: "https://images.unsplash.com/photo-1677022725616-91e41d36db21?w=450&h=800&fit=crop",
        aspectHint: "9:16",
      },
    ],
    stats: {
      likes: 45200,
      comments: 1823,
    },
    createdAtISO: "2025-11-22T20:00:00.000Z",
  },
};

// ============================================================
// LONG-FORM (LinkedIn at character limit)
// ============================================================
const sampleLongForm: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-longform",
    postId: "linkedin-long-1",
    platform: "linkedin",
    author: {
      name: "Margaret Hamilton",
      handle: "margarethamilton",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Margaret",
      verified: false,
      subtitle: "Director of Software Engineering | Apollo Program Veteran",
    },
    text: `I've been thinking about what we learned during the Apollo program that still applies to software today.

When we were building the guidance computer's software, we didn't have the luxury of "move fast and break things." A bug meant astronauts' lives were at risk. This forced us to develop practices that many teams still struggle with today:

1. Priority-based scheduling: The computer had to handle the most critical tasks first, always. When the landing radar overloaded the system during Apollo 11's descent, our priority system saved the mission.

2. Human-centered error handling: We designed for the reality that humans make mistakes. The software needed to recognize, report, and recover from errors gracefully.

3. Rigorous testing with real scenarios: We tested not just individual components, but the entire integrated system under realistic conditions.

4. Documentation as a first-class citizen: Every decision, every line of code was documented. Future maintainers needed to understand why, not just what.

The most important lesson? Software engineering isn't just about writing code. It's about building systems that work reliably in the real world, where requirements change, humans make mistakes, and failure isn't an option.

What practices from early computing do you think we've forgotten? I'd love to hear your thoughts.`,
    entities: {
      hashtags: ["SoftwareEngineering", "Apollo", "Leadership", "TechHistory"],
      mentions: [],
    },
    stats: {
      likes: 24500,
    },
    createdAtISO: "2025-11-15T09:00:00.000Z",
    actions: [
      { id: "like", label: "Like", variant: "ghost" },
      { id: "comment", label: "Comment", variant: "ghost" },
    ],
  },
};

// ============================================================
// MINIMAL (Edge case: minimal content)
// ============================================================
const sampleMinimal: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-minimal",
    postId: "x-minimal-1",
    platform: "x",
    author: {
      name: "Anonymous",
      handle: "anon",
      avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=anon",
      verified: false,
    },
    text: ".",
    stats: {},
    createdAtISO: "2025-11-01T00:00:00.000Z",
  },
};

// ============================================================
// MAX CONTENT (Edge case: maximum everything)
// ============================================================
const sampleMaxContent: SocialPostConfig = {
  post: {
    surfaceId: "social-post-preview-maxcontent",
    postId: "ig-max-1",
    platform: "instagram",
    author: {
      name: "Very Long Username That Tests Truncation Behavior",
      handle: "verylonghandlethatalsoteststhetruncationbehavior",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=max",
      verified: true,
    },
    text: "Testing maximum content limits across all fields. This post has multiple images, many hashtags, and lots of engagement numbers to verify that the component handles large data gracefully. #test #maximum #content #limits #edge #case #computing #history #software #engineering #development",
    entities: {
      hashtags: ["test", "maximum", "content", "limits", "edge", "case", "computing", "history", "software", "engineering", "development"],
      mentions: ["user1", "user2", "user3", "user4", "user5"],
    },
    media: [
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1729944950511-e9c71556cfd4?w=800&h=800&fit=crop",
        alt: "Test image 1",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1677022725616-91e41d36db21?w=800&h=800&fit=crop",
        alt: "Test image 2",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1594202304180-f25d9c992442?w=800&h=800&fit=crop",
        alt: "Test image 3",
        aspectHint: "1:1",
      },
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop",
        alt: "Test image 4",
        aspectHint: "1:1",
      },
    ],
    stats: {
      likes: 9999999,
      comments: 999999,
      reposts: 99999,
      views: 99999999,
      bookmarks: 9999,
    },
    createdAtISO: "2025-11-25T23:59:59.000Z",
  },
};

export type SocialPostPresetName =
  | "x"
  | "instagram"
  | "linkedin"
  | "actions"
  // New presets
  | "video"       // X with video content
  | "thread"      // X thread starter
  | "reel"        // Instagram vertical video
  | "longForm"    // LinkedIn at character limit
  | "minimal"     // Minimal content edge case
  | "maxContent"; // Maximum content edge case

export const socialPostPresets: Record<SocialPostPresetName, SocialPostConfig> =
  {
    x: sampleXQuoted,
    instagram: sampleInstagram,
    linkedin: sampleLinkedIn,
    actions: sampleActions,
    // New presets
    video: sampleVideo,
    thread: sampleThread,
    reel: sampleReel,
    longForm: sampleLongForm,
    minimal: sampleMinimal,
    maxContent: sampleMaxContent,
  };

export const socialPostPresetDescriptions: Record<
  SocialPostPresetName,
  string
> = {
  x: "X with quoted post and verified badge",
  instagram: "Instagram post with multiple images",
  linkedin: "LinkedIn post with link preview",
  actions: "Post with platform actions and footer actions",
  // New descriptions
  video: "X post with video media and high engagement",
  thread: "X thread starter with continuation indicator",
  reel: "Instagram vertical video (9:16 aspect ratio)",
  longForm: "LinkedIn post at character limit",
  minimal: "Edge case: minimal content (single character)",
  maxContent: "Edge case: maximum content (long text, many images)",
};
