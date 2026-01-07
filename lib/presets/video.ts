import type { SerializableVideo } from "@/components/tool-ui/video";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface VideoData {
  video: SerializableVideo;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateVideoCode(data: VideoData): string {
  const { video, responseActions } = data;
  const props: string[] = [];

  props.push(`  id="${video.id}"`);
  props.push(`  assetId="${video.assetId}"`);
  props.push(`  src="${video.src}"`);

  if (video.poster) {
    props.push(`  poster="${video.poster}"`);
  }

  if (video.title) {
    props.push(`  title="${escape(video.title)}"`);
  }

  if (video.description) {
    props.push(`  description="${escape(video.description)}"`);
  }

  if (video.ratio) {
    props.push(`  ratio="${video.ratio}"`);
  }

  if (video.fit) {
    props.push(`  fit="${video.fit}"`);
  }

  if (video.durationMs) {
    props.push(`  durationMs={${video.durationMs}}`);
  }

  if (video.createdAt) {
    props.push(`  createdAt="${video.createdAt}"`);
  }

  if (video.source) {
    props.push(`  source={${formatObject(video.source as Record<string, unknown>)}}`);
  }

  if (responseActions && responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(
      `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
    );
  }

  return `<Video\n${props.join("\n")}\n/>`;
}

export type VideoPresetName = "basic" | "with-poster" | "with-actions";

export const videoPresets: Record<VideoPresetName, PresetWithCodeGen<VideoData>> = {
  basic: {
    description: "Simple video player",
    data: {
      video: {
        id: "video-preview-basic",
        assetId: "video-basic",
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        title: "Product demo",
        ratio: "16:9",
      },
    } satisfies VideoData,
    generateExampleCode: generateVideoCode,
  },
  "with-poster": {
    description: "Video with poster thumbnail and metadata",
    data: {
      video: {
        id: "video-preview-poster",
        assetId: "video-poster",
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        poster: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop",
        title: "Tears of Steel",
        description: "A sci-fi short film about robots and humanity's future.",
        ratio: "16:9",
        fit: "contain",
        durationMs: 734000,
        createdAt: "2025-01-15T08:00:00.000Z",
        source: {
          label: "Blender Foundation",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=blender",
        },
      },
    } satisfies VideoData,
    generateExampleCode: generateVideoCode,
  },
  "with-actions": {
    description: "Video with response action buttons",
    data: {
      video: {
        id: "video-preview-actions",
        assetId: "video-actions",
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&auto=format&fit=crop",
        title: "Sintel",
        ratio: "16:9",
        durationMs: 888000,
      },
      responseActions: [
        { id: "share", label: "Share", variant: "default" },
        { id: "download", label: "Download", variant: "secondary" },
      ],
    } satisfies VideoData,
    generateExampleCode: generateVideoCode,
  },
};
