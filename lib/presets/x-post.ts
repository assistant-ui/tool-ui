import type { XPostData } from "@/components/tool-ui/x-post";
import type { ActionsProp } from "@/components/tool-ui/shared";
import type { Preset } from "./types";

interface XPostPresetData {
  post: XPostData;
  responseActions?: ActionsProp;
}

export type XPostPresetName = "basic" | "quoted" | "media" | "link" | "footer-actions";

export const xPostPresets: Record<XPostPresetName, Preset<XPostPresetData>> = {
  basic: {
    description: "Simple text post with stats",
    data: {
      post: {
        id: "x-post-basic",
        author: {
          name: "Athia Zohra",
          handle: "athiazohra",
          avatarUrl: "https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?w=200&h=200&fit=crop",
          verified: true,
        },
        text: "Wild to think: in the 1940s we literally rewired programs by hand. Today, we ship apps worldwide with a single command.",
        stats: { likes: 5 },
        createdAt: "2025-11-05T14:01:00.000Z",
      },
    } satisfies XPostPresetData,
  },
  quoted: {
    description: "Post with quoted tweet",
    data: {
      post: {
        id: "x-post-quoted",
        author: {
          name: "Athia Zohra",
          handle: "athiazohra",
          avatarUrl: "https://images.unsplash.com/photo-1753288695169-e51f5a3ff24f?w=200&h=200&fit=crop",
          verified: true,
        },
        text: "This is a great thread on the history of computing.",
        quotedPost: {
          id: "x-post-inner",
          author: {
            name: "CHM Archives",
            handle: "computerhistory",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CHM",
            verified: true,
          },
          text: "A look back at the transition from vacuum tubes to transistors to microprocessors — every leap shrank the hardware and expanded possibility.",
          createdAt: "2025-11-05T13:00:00.000Z",
        },
        stats: { likes: 5 },
        createdAt: "2025-11-05T14:01:00.000Z",
      },
    } satisfies XPostPresetData,
  },
  media: {
    description: "Post with image attachment",
    data: {
      post: {
        id: "x-post-media",
        author: {
          name: "Tech Daily",
          handle: "techdaily",
          avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=tech",
          verified: true,
        },
        text: "The new MacBook Pro is here. First impressions thread:",
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=450&fit=crop",
            alt: "MacBook Pro on desk",
            aspectRatio: "16:9",
          },
        ],
        stats: { likes: 892 },
        createdAt: "2025-11-24T10:30:00.000Z",
      },
    } satisfies XPostPresetData,
  },
  link: {
    description: "Post with link preview card",
    data: {
      post: {
        id: "x-post-link",
        author: {
          name: "Dev Weekly",
          handle: "devweekly",
          avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=devweekly",
        },
        text: "Great article on modern CSS techniques:",
        linkPreview: {
          url: "https://web.dev/articles/css-nesting",
          title: "CSS Nesting",
          description: "Learn how to use native CSS nesting in your stylesheets.",
          imageUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&h=300&fit=crop",
          domain: "web.dev",
        },
        stats: { likes: 156 },
        createdAt: "2025-11-23T16:45:00.000Z",
      },
    } satisfies XPostPresetData,
  },
  "footer-actions": {
    description: "Post with custom response actions",
    data: {
      post: {
        id: "x-post-footer",
        author: {
          name: "DevOps Weekly",
          handle: "devopsweekly",
          avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=devops",
          verified: true,
        },
        text: "Announcing our new CI/CD pipeline templates! Check them out and let us know what you think.",
        stats: { likes: 128 },
        createdAt: "2025-11-24T16:30:00.000Z",
      },
      responseActions: [
        { id: "view-templates", label: "View Templates" },
        { id: "report", label: "Report", variant: "destructive" },
      ],
    } satisfies XPostPresetData,
  },
};
