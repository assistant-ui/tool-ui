import type { SerializableAudio, AudioVariant } from "@/components/tool-ui/audio";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface AudioData {
  audio: SerializableAudio;
  variant?: AudioVariant;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateAudioCode(data: AudioData): string {
  const { audio, variant, responseActions } = data;
  const props: string[] = [];

  props.push(`  id="${audio.id}"`);
  props.push(`  assetId="${audio.assetId}"`);
  props.push(`  src="${audio.src}"`);

  if (variant) {
    props.push(`  variant="${variant}"`);
  }

  if (audio.title) {
    props.push(`  title="${escape(audio.title)}"`);
  }

  if (audio.description) {
    props.push(`  description="${escape(audio.description)}"`);
  }

  if (audio.artwork) {
    props.push(`  artwork="${audio.artwork}"`);
  }

  if (audio.durationMs) {
    props.push(`  durationMs={${audio.durationMs}}`);
  }

  if (audio.fileSizeBytes) {
    props.push(`  fileSizeBytes={${audio.fileSizeBytes}}`);
  }

  if (audio.createdAt) {
    props.push(`  createdAt="${audio.createdAt}"`);
  }

  if (audio.source) {
    props.push(`  source={${formatObject(audio.source as Record<string, unknown>)}}`);
  }

  if (responseActions && responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(
      `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
    );
  }

  return `<Audio\n${props.join("\n")}\n/>`;
}

export type AudioPresetName = "full" | "compact" | "with-actions";

export const audioPresets: Record<AudioPresetName, PresetWithCodeGen<AudioData>> = {
  full: {
    description: "Portrait card with large artwork",
    data: {
      audio: {
        id: "audio-preview-full",
        assetId: "audio-full",
        src: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
        title: "Morning Forest",
        description: "Dawn chorus recorded in Olympic National Park",
        artwork: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop",
        durationMs: 42000,
      },
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
  compact: {
    description: "Condensed inline player",
    data: {
      variant: "compact",
      audio: {
        id: "audio-preview-compact",
        assetId: "audio-compact",
        src: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
        title: "Morning Forest",
        description: "Olympic National Park",
        artwork: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop",
        durationMs: 42000,
      },
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
  "with-actions": {
    description: "Full player with response action buttons",
    data: {
      audio: {
        id: "audio-preview-actions",
        assetId: "audio-actions",
        src: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf5bf94.mp3",
        title: "Morning Forest",
        description: "Dawn chorus recorded in Olympic National Park",
        artwork: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop",
        durationMs: 42000,
      },
      responseActions: [
        { id: "download", label: "Download", variant: "secondary" },
        { id: "share", label: "Share", variant: "default" },
      ],
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
};
