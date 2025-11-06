"use client";

import { MediaCard } from "./index";

export function MediaCardExample() {
  return (
    <div className="flex flex-col gap-6">
      <MediaCard
        id="mc-img-1"
        kind="image"
        src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        thumb="https://images.unsplash.com/photo-1518791841217-8f162f1e1131"
        alt="Tabby cat napping on a keyboard"
        title="Focus-coach kitten"
        description="A helpful assistant cat ensuring your code ships on time."
        ratio="4:3"
        onAction={(actionId) => console.log("image action", actionId)}
      />

      <MediaCard
        id="mc-video-1"
        kind="video"
        src="https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
        thumb="https://images.unsplash.com/photo-1531297484001-80022131f5a1"
        title="Prototype walkthrough"
        description="A quick overview of the latest media card interactions."
        defaultState={{ muted: true }}
        onMediaEvent={(type) => console.log("video event", type)}
      />

      <MediaCard
        id="mc-audio-1"
        kind="audio"
        src="https://samplelib.com/lib/preview/mp3/sample-6s.mp3"
        title="Interview snippet"
        description="00:30 • Product insights"
        fileSizeBytes={215040}
        durationMs={30000}
      />

      <MediaCard
        id="mc-link-1"
        kind="link"
        href="https://assistant-ui.com"
        src="https://assistant-ui.com"
        title="Assistant UI"
        description="Composable building blocks for tool responses."
        domain="assistant-ui.com"
        thumb="https://images.unsplash.com/photo-1504389273929-44baec1307d2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2046"
        source={{ label: "Tooling", iconUrl: "/og.png", url: "https://assistant-ui.com" }}
        onNavigate={(href) => console.log("navigate to", href)}
      />
    </div>
  );
}
