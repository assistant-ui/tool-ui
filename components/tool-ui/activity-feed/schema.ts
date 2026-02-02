import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

/**
 * Restricted lucide icon ids supported by ActivityFeed.
 */
export const ActivityIconSchema = z.enum([
  "activity",
  "alert-triangle",
  "bell",
  "book-open",
  "bug",
  "calendar",
  "check",
  "circle-dot",
  "cloud",
  "database",
  "dollar-sign",
  "flag",
  "git-branch",
  "git-commit",
  "git-fork",
  "git-merge",
  "git-pull-request",
  "globe",
  "message-square",
  "package",
  "rocket",
  "shield",
  "sparkles",
  "star",
  "tag",
  "user",
  "x",
  "zap",
]);

export type ActivityIconId = z.infer<typeof ActivityIconSchema>;

/**
 * Fixed palette options for ActivityFeed.
 */
export const ActivityPaletteSchema = z.enum([
  "slate",
  "blue",
  "cyan",
  "emerald",
  "amber",
  "orange",
  "rose",
  "violet",
]);

export type ActivityPaletteId = z.infer<typeof ActivityPaletteSchema>;

/**
 * Appearance hints used by the renderer.
 */
export const ActivityAppearanceSchema = z.object({
  icon: ActivityIconSchema.optional(),
  palette: ActivityPaletteSchema.optional(),
  badge: z.string().min(1).optional(),
});

export type ActivityAppearance = z.infer<typeof ActivityAppearanceSchema>;

/**
 * Actor who performed the activity.
 */
export const ActivityActorSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  url: z.string().url().optional(),
});

export type ActivityActor = z.infer<typeof ActivityActorSchema>;

/**
 * Single activity item in the feed.
 */
export const ActivityItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  timestamp: z.string().datetime(),
  actor: ActivityActorSchema,
  type: z.string().min(1).optional(),
  appearance: ActivityAppearanceSchema.optional(),
  url: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ActivityItem = z.infer<typeof ActivityItemSchema>;

/**
 * Group of activities (e.g., "Today", "Yesterday").
 */
export const ActivityGroupSchema = z.object({
  label: z.string().min(1),
  items: z.array(ActivityItemSchema).min(1),
});

export type ActivityGroup = z.infer<typeof ActivityGroupSchema>;

/**
 * Live update behavior configuration.
 */
export const LiveUpdateBehaviorSchema = z.enum([
  "silent",      // New items appear without notification
  "badge",       // Show "N new" badge
  "highlight",   // Animate new items in
]);

export type LiveUpdateBehavior = z.infer<typeof LiveUpdateBehaviorSchema>;

/**
 * Serializable props for ActivityFeed.
 * These can be passed from an LLM tool call.
 */
export const SerializableActivityFeedSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),

  /** Pre-grouped activity data */
  groups: z.array(ActivityGroupSchema),

  /** Title shown above the feed (optional) */
  title: z.string().optional(),

  /** Auto-refresh interval in milliseconds. null = no auto-refresh */
  refreshInterval: z.number().positive().nullable().optional(),

  /** How to show new items when they arrive */
  updateBehavior: LiveUpdateBehaviorSchema.optional(),

  /** Time in milliseconds before the feed is considered stale */
  staleAfter: z.number().positive().optional(),

  /** Maximum items to display (for virtualization/performance) */
  maxItems: z.number().positive().optional(),

  /** Show empty state if no items */
  emptyMessage: z.string().optional(),
});

export type SerializableActivityFeed = z.infer<
  typeof SerializableActivityFeedSchema
>;

export function parseSerializableActivityFeed(
  input: unknown,
): SerializableActivityFeed {
  return parseWithSchema(
    SerializableActivityFeedSchema,
    input,
    "ActivityFeed",
  );
}

/**
 * Full props including React-specific properties.
 */
export interface ActivityFeedProps extends SerializableActivityFeed {
  className?: string;
  isLoading?: boolean;

  /** Called when data should be refreshed */
  onRefresh?: () => void | Promise<void>;

  /** Called when an item is clicked */
  onItemClick?: (item: ActivityItem) => void;
}
