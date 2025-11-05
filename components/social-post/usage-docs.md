# SocialPost

A fully themed, serializable renderer for X, Instagram, TikTok, and LinkedIn posts. Designed for AI tool UIs, embeds, and regular product surfaces.

- JSON-in/React-out: works with raw LLM/tool payloads.
- Per-platform layouts with accessible actions, media, link previews, quoted posts.
- Optional state control, action overrides, and event hooks (media, navigation, entities).
- Tailwind + shadcn atoms; no platform SDKs required.

Paths below assume the component lives at `@/components/social-post`. Adjust imports if you vend it elsewhere.

---

> Compat note
> - Tailwind v4: ready to drop in.
> - Tailwind v3.2+: install `@tailwindcss/container-queries` and add the plugin so the `@…` utilities take effect.
> - If you use a prefix, swap utilities like `@md:` → `tw-@md:` accordingly.

## Quick start

```tsx
import { SocialPost, type SerializableSocialPost } from "@/components/social-post";

const post: SerializableSocialPost = {
  id: "example-linkedin-1",
  platform: "linkedin",
  author: {
    name: "Addison James",
    handle: "addisonj",
    avatarUrl: "https://example.com/avatar.jpg",
    subtitle: "Product Designer @ Airbnb | Meta AI | ArtCenter",
  },
  text: "Thrilled to share our latest accessibility audit findings. Four quick wins every design team can apply today.",
  createdAtISO: "2024-05-06T14:25:00.000Z",
  stats: { likes: 128 },
  actions: [
    { id: "like", label: "Like" },
    { id: "share", label: "Share" },
  ],
  linkPreview: {
    url: "https://example.com/blog/accessibility-audit",
    title: "Accessibility Audit Checklist",
    description: "How we improved onboarding flows for low-vision users.",
    imageUrl: "https://example.com/thumb.jpg",
    domain: "example.com",
  },
};

export default function Example() {
  return (
    <SocialPost
      {...post}
      onAction={(actionId) => {
        console.log("Action clicked:", actionId);
      }}
    />
  );
}
```

---

## Why this component (TL;DR)

- **Serializable contract** – every prop survives `JSON.stringify`. Ideal for LLM tool responses, server-driven UI, or CMS payloads.
- **Native-feeling layouts** – each platform renderer mirrors expected typography, action rows, and media layouts.
- **Accessible & keyboard-friendly** – actions are buttons with aria labels, media is focusable, entity links are reachable without a mouse.
- **Stateful but controllable** – like/bookmark/follow toggles can be controlled externally or left to internal state.
- **Hookable** – respond to entity clicks, media events, and navigation from the host app without forking the component.

---

## Installation checklist

1. **Copy the folder**
   - `components/social-post/*`
   - `lib/social-post-presets.ts` (optional starter payloads for demos/storybook).

2. **UI atoms**
   - The component expects shadcn-style atoms re-exported from `components/ui/*`:
     - `button`, `dropdown-menu`, `tooltip`, `badge`
   - Adjust `components/social-post/_ui.tsx` if your atom paths differ.

3. **Icons**
   - Uses `lucide-react`. Install via `pnpm add lucide-react` (or reuse your icon set and swap imports in `platform.ts` / header).

4. **Tailwind setup**
   - Needs container queries (`@container` utilities). On Tailwind 3.x, add `@tailwindcss/container-queries`.
   - The existing Tailwind config should expose semantic colors: `bg-card`, `text-muted-foreground`, etc.

5. **Type support**
   - Types rely on `zod` for schema validation. If you do not already have it, `pnpm add zod`.

---

## API overview

`SocialPost` accepts the serializable post payload plus optional runtime controls.

```ts
export type SocialPostProps = SerializableSocialPost & SocialPostClientProps;
```

### Base data: `SerializableSocialPost`

```ts
interface SerializableSocialPost {
  id: string;
  platform: "x" | "instagram" | "tiktok" | "linkedin";
  author: {
    name: string;
    handle?: string;          // platform handle without "@"
    avatarUrl: string;
    verified?: boolean;
    subtitle?: string;        // LinkedIn role/bio line
  };
  text?: string;
  entities?: {
    mentions?: string[];      // "@ash" or "ash"; both supported
    hashtags?: string[];      // "#design" or "design"
    urls?: string[];          // canonical URLs to match against text
  };
  media?: Array<{
    kind: "image" | "video";
    url: string;
    thumbUrl?: string;        // used for video posters
    alt?: string;             // required for images (validated in dev)
    aspectHint?: "1:1" | "4:3" | "16:9" | "9:16" | "3:4";
  }>;
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    domain?: string;
  };
  quotedPost?: SerializableSocialPost; // recursively rendered with X-style shell
  stats?: {
    likes?: number;
    comments?: number;
    reposts?: number;
    shares?: number;
    bookmarks?: number;
    views?: number;
  };
  actions?: Array<{
    id: string;
    label: string;
    variant?: "default" | "secondary" | "ghost" | "destructive";
  }>;
  createdAtISO?: string;       // ISO timestamp
  sourceUrl?: string;          // used for “View source” link
  initialState?: {
    liked?: boolean;
    reposted?: boolean;
    saved?: boolean;
    following?: boolean;
    expanded?: boolean;
    muted?: boolean;
  };
  visibility?: "public" | "unlisted";
  language?: string;           // e.g. "en", "ar"
  locale?: string;             // per-post override for formatting
  compact?: boolean;           // clamp body text to platform default
  messageId?: string;          // arbitrary metadata passed to handlers
}
```

**Notes**
- `quotedPost` recursively reuses the SocialPost schema, letting you render X quote retweets or LinkedIn reshares.
- `entities` ensures mentions/hashtags/links in the body become interactive buttons/anchors. Provide canonical forms (trimmed, lowercase) to match text tokens.
- `compact` + `initialState.expanded` control the “Show more” behaviour on long text.
- `stats` are optional. When provided, the renderer maps known counts to matching actions (likes/comments/reposts/shares/bookmarks/views). Platform layouts decide which ones surface.

### Runtime props: `SocialPostClientProps`

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `isLoading` | `boolean` | `false` | Shows a skeleton instead of the rendered post. |
| `className` | `string` | — | Additional wrapper classes. |
| `variant` | `"card" \| "inline"` | `"card"` | `inline` removes padding/border so you can compose inside your own card stack. |
| `maxWidth` | `string` | — | Applies `style={{ maxWidth }}` to the root `<article>`. |
| `allowExternalNavigation` | `boolean` | `true` | When `false`, links omit `target="_blank"` so hosts can intercept navigation. |
| `actionOverrides` | `SocialPostActionOverride[]` | `[]` | Replace labels/icons/variants for existing actions or inject new ones. |
| `defaultState` | `SocialPostState` | `{}` | Initial uncontrolled toggle state (liked, saved, etc.). |
| `state` | `SocialPostState` | — | Controlled state. Provide `onStateChange` to listen for updates. |
| `onStateChange` | `(next) => void` | — | Called whenever toggles change (both controlled/uncontrolled). |
| `onBeforeAction` | `({ action, post, messageId }) => boolean \| Promise<boolean>` | — | Return `false` to cancel an action (confirmation, auth guards, etc.). |
| `onAction` | `(actionId, post, ctx) => void` | — | Fired after a successful action trigger. `ctx.messageId` is forwarded from the payload. |
| `onEntityClick` | `(type, value) => void` | — | Called when a hashtag/mention/url button is pressed. |
| `onMediaEvent` | `(type, payload?) => void` | — | Events: `"open"` (with `{ index }`), `"play"`, `"pause"`. |
| `onNavigate` | `(href, post) => void` | — | Invoked when navigation happens (links in body, “View source”). Use to log telemetry or open modals. |

```ts
type SocialPostState = {
  liked?: boolean;
  reposted?: boolean;
  saved?: boolean;
  following?: boolean;
  expanded?: boolean;
  muted?: boolean;
};

interface SocialPostActionOverride {
  id: string;
  label?: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  icon?: React.ReactNode;
  srLabel?: string;
  hotkey?: string;
  onClick?: (post: SerializableSocialPost) => void; // client-side action in addition to handlers
}
```

### Actions & state model

- Each platform ships with sensible defaults (X: reply/repost/like/share/bookmark, etc.). If the payload includes `actions`, those take precedence.
- Toggling is automatic for the `like`, `repost`, `save`/`bookmark`, and `follow` actions. Controlled mode lets you sync state back into your store.
- Stats are displayed next to matching actions when counts are provided. For X, only the like button shows counts to match native UI expectations.

### Event hooks in practice

```tsx
<SocialPost
  {...post}
  onBeforeAction={async ({ action }) => {
    if (action === "like" && !user) {
      await openAuthModal();
      return false;
    }
    return true;
  }}
  onAction={(action, post, { messageId }) => {
    analytics.track("social_post_action", { action, id: post.id, messageId });
  }}
  onEntityClick={(type, value) => {
    sendMessage?.(`Search ${type}: ${value}`);
  }}
  onMediaEvent={(type, payload) => {
    if (type === "open") {
      openLightbox(post.media!, payload.index);
    }
  }}
/>
```

---

## Validation helper

When consuming untrusted JSON (LLM/tool responses), validate with the shipped schema:

```ts
import {
  SocialPost,
  parseSerializableSocialPost,
} from "@/components/social-post";

async function renderToolResult(raw: unknown) {
  const post = parseSerializableSocialPost(raw); // throws on invalid payloads
  return <SocialPost {...post} />;
}
```

`parseSerializableSocialPost` is powered by Zod and gives developer-friendly error messages when the payload is malformed or missing required fields (e.g., alt text for images).

---

## Platform behaviour cheatsheet

| Platform | Renderer | Key layout notes |
|----------|----------|------------------|
| `x` | `XRenderer` | Quoted posts, link previews, action row under body, stats appear via `Actions`/`Stats`. |
| `instagram` | `InstagramRenderer` | Header and actions inside padding, grid media layout for >1 asset, stats below body. |
| `tiktok` | `TikTokRenderer` | Optional right-rail actions for vertical video, stats below body. |
| `linkedin` | `LinkedInRenderer` | Name/role/time separated lines, link preview under media, streamlined like/share actions. |

Tokens for typography, spacing, and hover states live in `components/social-post/platform.ts`. Tweak these if you want to reskin the platforms or add your own variant.

---

## Localization

- The component defaults to `DEFAULT_LOCALE = "en-US"` for formatting counts and relative time.
- Provide `post.locale` to localize a specific payload or pass `locale` prop to override globally.
- RTL languages (`language` starting with `ar`/`he`) switch `dir="rtl"` on the outer article automatically.

---

## Loading & skeletons

Set `isLoading` to show a neutral skeleton state while you fetch the payload:

```tsx
<SocialPost isLoading platform="x" id="loading" author={{ name: "", avatarUrl: "" }} />
```

You can also pair it with Suspense or your data fetching strategy of choice. Once `isLoading` flips to `false`, the renderer receives the live post body.

---

## Working with AI tool results

Typical flow when responding to an assistant-ui tool call:

```ts
type ToolResult = {
  post: SerializableSocialPost;
};

const toolComponents = {
  render_social_post(result: ToolResult) {
    return (
      <SocialPost
        {...result.post}
        onAction={(actionId, post) => {
          sendMessage(`User selected ${actionId} on ${post.platform} post ${post.id}`);
        }}
      />
    );
  },
};
```

LLM/tool payload → validate (optional) → pass straight into `<SocialPost />`. No client-only props are required.

---

## Sample payloads

The repo ships with presets in `lib/social-post-presets.ts`:

```ts
import { socialPostPresets } from "@/lib/social-post-presets";

const linkedInPost = socialPostPresets.linkedin.post;

<SocialPost {...linkedInPost} />;
```

Use these for Storybook stories, integration tests, or quick demos.

---

## Extending the component

- **Custom actions**: supply `actionOverrides` to add share sheets or route to deep links.
- **Custom platform**: clone an entry in `platform.ts`, add a renderer under `components/social-post/renderers`, and register it in `RENDERERS` inside `social-post.tsx`.
- **Analytics**: combine `onAction`, `onNavigate`, and `onMediaEvent` to emit telemetry without mutating the core component.
- **Host cards**: switch to `variant="inline"` and wrap `<SocialPost />` inside your own container to blend with existing card systems.

After reading this doc you should be able to copy the folder, feed it serializable payloads, hook into actions, and ship a production-ready social post experience. Enjoy!
