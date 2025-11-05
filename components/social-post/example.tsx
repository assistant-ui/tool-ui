"use client";
import { SocialPost } from "./index";

export function SocialPostExample() {
  return (
    <div className="space-y-6">
      <SocialPost
        id="x-1"
        platform="x"
        author={{ name: "Ada Lovelace", handle: "ada", avatarUrl: "/avatars/ada.png", verified: true }}
        text={"We just shipped a kernel patch. #systems @bob https://example.com"}
        linkPreview={{
          url: "https://example.com",
          title: "Example",
          description: "A preview card",
          imageUrl: "/og.png",
        }}
        stats={{ likes: 1200, comments: 45, reposts: 12, views: 145000 }}
        createdAtISO={new Date().toISOString()}
        sourceUrl="https://x.com/post/123"
        onAction={(actionId) => console.log("action", actionId)}
        initialState={{ liked: false }}
      />

      <SocialPost
        id="ig-1"
        platform="instagram"
        author={{ name: "Ada", handle: "ada.codes", avatarUrl: "/avatars/ada.png", verified: true }}
        text="Weekend build"
        media={[
          { kind: "image", url: "/photos/1.jpg", alt: "Ada working at a desk", aspectHint: "1:1" },
          { kind: "image", url: "/photos/2.jpg", alt: "Close-up of code on a laptop screen", aspectHint: "1:1" },
        ]}
        stats={{ likes: 5400, comments: 122, bookmarks: 43 }}
      />
    </div>
  );
}
