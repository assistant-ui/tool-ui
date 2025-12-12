import type { LinkedInPostData } from "@/components/tool-ui/linkedin-post";
import type { ActionsProp } from "@/components/tool-ui/shared";
import type { Preset } from "./types";

interface LinkedInPostPresetData {
  post: LinkedInPostData;
  responseActions?: ActionsProp;
}

export type LinkedInPostPresetName = "basic" | "link" | "media" | "footer-actions";

export const linkedInPostPresets: Record<LinkedInPostPresetName, Preset<LinkedInPostPresetData>> = {
  basic: {
    description: "Text-only professional post",
    data: {
      post: {
        id: "li-post-basic",
        author: {
          name: "Dr. Sarah Chen",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
          headline: "VP of Engineering at TechCorp | Building the future of AI",
        },
        text: "Excited to share that our team just shipped a major update to our ML pipeline. Six months of hard work, countless iterations, and one incredible team.\n\nKey learnings:\n• Start with the problem, not the solution\n• Iterate fast, fail faster\n• Celebrate small wins\n\nProud of everyone who made this possible!",
        stats: { likes: 847 },
        createdAt: "2025-11-05T09:15:00.000Z",
      },
    } satisfies LinkedInPostPresetData,
  },
  link: {
    description: "Post with link preview",
    data: {
      post: {
        id: "li-post-link",
        author: {
          name: "Michael Torres",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
          headline: "Product Manager | Former Google | Stanford MBA",
        },
        text: "Great read on the future of product management. The role is evolving faster than ever.",
        linkPreview: {
          url: "https://hbr.org/product-management",
          title: "The Future of Product Management",
          description: "How AI is reshaping the PM role and what skills matter most in 2025.",
          imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop",
          domain: "hbr.org",
        },
        stats: { likes: 234 },
        createdAt: "2025-11-24T14:30:00.000Z",
      },
    } satisfies LinkedInPostPresetData,
  },
  media: {
    description: "Post with image",
    data: {
      post: {
        id: "li-post-media",
        author: {
          name: "Jennifer Walsh",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer",
          headline: "CEO at StartupXYZ | Forbes 30 Under 30",
        },
        text: "Just wrapped up our company offsite. Nothing beats getting the whole team together in person!",
        media: {
          type: "image",
          url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=450&fit=crop",
          alt: "Team gathering at company offsite",
        },
        stats: { likes: 1205 },
        createdAt: "2025-11-22T16:00:00.000Z",
      },
    } satisfies LinkedInPostPresetData,
  },
  "footer-actions": {
    description: "Post with custom response actions",
    data: {
      post: {
        id: "li-post-footer",
        author: {
          name: "TechCorp Careers",
          avatarUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=techcorp",
          headline: "Official TechCorp Recruitment Account",
        },
        text: "We're hiring! Looking for senior engineers to join our growing team. Remote-friendly, competitive benefits, and exciting projects.\n\nRoles open:\n• Senior Backend Engineer\n• Staff Frontend Engineer\n• Engineering Manager",
        stats: { likes: 456 },
        createdAt: "2025-11-24T10:00:00.000Z",
      },
      responseActions: [
        { id: "view-jobs", label: "View Open Positions" },
        { id: "apply", label: "Apply Now" },
      ],
    } satisfies LinkedInPostPresetData,
  },
};
