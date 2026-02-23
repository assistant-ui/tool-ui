import type { SerializableVideo } from "@/components/tool-ui/video";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface VideoData {
  video: SerializableVideo;
  localActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateVideoCode(data: VideoData): string {
  const { video, localActions } = data;
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
    props.push(
      `  source={${formatObject(video.source as Record<string, unknown>)}}`,
    );
  }

  const videoCode = `<Video\n${props.join("\n")}\n/>`;
  if (!localActions || localActions.length === 0) {
    return videoCode;
  }

  return `${videoCode}
<LocalActions
  surfaceId="${video.id}"
  actions={${JSON.stringify(localActions, null, 2).replace(/\n/g, "\n  ")}}
  onAction={(actionId) => console.log("Local action:", actionId)}
/>`;
}

export type VideoPresetName = "basic" | "with-poster" | "with-actions";

export const videoPresets: Record<
  VideoPresetName,
  PresetWithCodeGen<VideoData>
> = {
  basic: {
    description: "Simple video player",
    data: {
      video: {
        id: "video-preview-basic",
        assetId: "video-basic",
        src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
        title: "Forest canopy",
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
        src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
        poster:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&auto=format&fit=crop",
        title: "Forest Canopy",
        description: "Sunlight filtering through the trees.",
        ratio: "16:9",
        fit: "cover",
        durationMs: 8000,
        createdAt: "2025-01-15T08:00:00.000Z",
        source: {
          label: "Archive.org",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=archive",
        },
      },
    } satisfies VideoData,
    generateExampleCode: generateVideoCode,
  },
  "with-actions": {
    description: "Video with external local actions",
    data: {
      video: {
        id: "video-preview-actions",
        assetId: "video-actions",
        src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
        poster:
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&auto=format&fit=crop",
        title: "Forest Canopy",
        ratio: "16:9",
        durationMs: 8000,
      },
      localActions: [
        { id: "share", label: "Share", variant: "default" },
        { id: "download", label: "Download", variant: "secondary" },
      ],
    } satisfies VideoData,
    generateExampleCode: generateVideoCode,
  },
};
