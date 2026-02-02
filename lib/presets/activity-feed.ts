import type { SerializableActivityFeed } from "@/components/tool-ui/activity-feed";
import type { PresetWithCodeGen } from "./types";

export type ActivityFeedPresetName =
  | "github-today"
  | "github-week"
  | "minimal"
  | "empty";

type ActivityFeedPreset = PresetWithCodeGen<SerializableActivityFeed>;

function generateActivityFeedCode(data: SerializableActivityFeed): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.title) {
    props.push(`  title="${data.title}"`);
  }

  if (data.refreshInterval) {
    props.push(`  refreshInterval={${data.refreshInterval}}`);
  }

  props.push(
    `  groups={${JSON.stringify(data.groups, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  return `<ActivityFeed\n${props.join("\n")}\n/>`;
}

const now = new Date();
const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

const githubAppearance = {
  prMerged: { icon: "git-merge", palette: "violet", badge: "Merged" },
  prReview: { icon: "check", palette: "emerald", badge: "Review" },
  prOpened: { icon: "git-pull-request", palette: "emerald", badge: "PR" },
  commit: { icon: "git-commit", palette: "blue", badge: "Commit" },
  issue: { icon: "circle-dot", palette: "amber", badge: "Issue" },
  issueClosed: { icon: "check", palette: "emerald", badge: "Resolved" },
  release: { icon: "tag", palette: "amber", badge: "Release" },
  branch: { icon: "git-branch", palette: "blue", badge: "Branch" },
  star: { icon: "star", palette: "amber", badge: "Star" },
  fork: { icon: "git-fork", palette: "violet", badge: "Fork" },
  comment: { icon: "message-square", palette: "slate", badge: "Comment" },
} as const;

export const activityFeedPresets: Record<ActivityFeedPresetName, ActivityFeedPreset> = {
  "github-today": {
    description: "Active GitHub repository with today's activity",
    data: {
      id: "activity-feed-github-today",
      title: "Repository Activity",
      refreshInterval: 30000,
      groups: [
        {
          label: "Today",
          items: [
            {
              id: "evt-1",
              appearance: githubAppearance.prMerged,
              title: "feat: Add activity feed component",
              description: "Implements size-aware activity feed with container queries",
              timestamp: hourAgo.toISOString(),
              actor: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
              url: "https://github.com/acme/widgets/pull/142",
            },
            {
              id: "evt-2",
              appearance: githubAppearance.prReview,
              title: "Approved: Update authentication flow",
              description: "LGTM! Nice cleanup of the OAuth logic.",
              timestamp: twoHoursAgo.toISOString(),
              actor: { name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus" },
            },
            {
              id: "evt-3",
              appearance: githubAppearance.commit,
              title: "fix: Resolve race condition in data fetching",
              timestamp: twoHoursAgo.toISOString(),
              actor: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
            },
            {
              id: "evt-4",
              appearance: githubAppearance.issue,
              title: "Performance regression in dashboard load",
              description: "Page load time increased from 1.2s to 3.8s after latest deploy",
              timestamp: fourHoursAgo.toISOString(),
              actor: { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?u=alex" },
              url: "https://github.com/acme/widgets/issues/89",
            },
            {
              id: "evt-5",
              appearance: githubAppearance.prOpened,
              title: "feat: Add dark mode support",
              description: "Implements system-aware theme switching with CSS variables",
              timestamp: fourHoursAgo.toISOString(),
              actor: { name: "Jordan Lee", avatar: "https://i.pravatar.cc/150?u=jordan" },
            },
          ],
        },
      ],
    },
    generateExampleCode: generateActivityFeedCode,
  },
  "github-week": {
    description: "Week of GitHub activity with multiple groups",
    data: {
      id: "activity-feed-github-week",
      title: "This Week",
      refreshInterval: 30000,
      groups: [
        {
          label: "Today",
          items: [
            {
              id: "evt-1",
              appearance: githubAppearance.prMerged,
              title: "feat: Add activity feed component",
              timestamp: hourAgo.toISOString(),
              actor: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
            },
            {
              id: "evt-2",
              appearance: githubAppearance.commit,
              title: "fix: Resolve race condition in data fetching",
              timestamp: twoHoursAgo.toISOString(),
              actor: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
            },
          ],
        },
        {
          label: "Yesterday",
          items: [
            {
              id: "evt-3",
              appearance: githubAppearance.release,
              title: "v2.4.0 released",
              description: "New features: Activity feed, improved charts, bug fixes",
              timestamp: yesterday.toISOString(),
              actor: { name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus" },
            },
            {
              id: "evt-4",
              appearance: githubAppearance.prReview,
              title: "Requested changes: Refactor API client",
              timestamp: yesterday.toISOString(),
              actor: { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?u=alex" },
            },
            {
              id: "evt-5",
              appearance: githubAppearance.issueClosed,
              title: "Memory leak in chart component",
              timestamp: yesterday.toISOString(),
              actor: { name: "Jordan Lee", avatar: "https://i.pravatar.cc/150?u=jordan" },
            },
          ],
        },
        {
          label: "This Week",
          items: [
            {
              id: "evt-6",
              appearance: githubAppearance.branch,
              title: "Created branch feature/notifications",
              timestamp: twoDaysAgo.toISOString(),
              actor: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
            },
            {
              id: "evt-7",
              appearance: githubAppearance.star,
              title: "Repository starred",
              timestamp: twoDaysAgo.toISOString(),
              actor: { name: "External User" },
            },
            {
              id: "evt-8",
              appearance: githubAppearance.fork,
              title: "Repository forked",
              timestamp: threeDaysAgo.toISOString(),
              actor: { name: "Community Contributor" },
            },
            {
              id: "evt-9",
              appearance: githubAppearance.comment,
              title: "Comment on: API rate limiting discussion",
              description: "We should consider implementing exponential backoff...",
              timestamp: threeDaysAgo.toISOString(),
              actor: { name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus" },
            },
          ],
        },
      ],
    },
    generateExampleCode: generateActivityFeedCode,
  },
  minimal: {
    description: "Minimal feed with few items",
    data: {
      id: "activity-feed-minimal",
      groups: [
        {
          label: "Recent",
          items: [
            {
              id: "evt-1",
              appearance: githubAppearance.commit,
              title: "Initial commit",
              timestamp: hourAgo.toISOString(),
              actor: { name: "Developer" },
            },
            {
              id: "evt-2",
              appearance: githubAppearance.branch,
              title: "Created branch main",
              timestamp: twoHoursAgo.toISOString(),
              actor: { name: "Developer" },
            },
          ],
        },
      ],
    },
    generateExampleCode: generateActivityFeedCode,
  },
  empty: {
    description: "Empty feed for testing empty state",
    data: {
      id: "activity-feed-empty",
      title: "Repository Activity",
      groups: [],
      emptyMessage: "No activity in this repository yet",
    },
    generateExampleCode: generateActivityFeedCode,
  },
};
