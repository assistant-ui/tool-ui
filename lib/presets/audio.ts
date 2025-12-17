import type { SerializableAudio } from "@/components/tool-ui/audio";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

interface AudioData {
  audio: SerializableAudio;
  responseActions?: SerializableAction[];
}

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function formatObject(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function generateAudioCode(data: AudioData): string {
  const { audio, responseActions } = data;
  const props: string[] = [];

  props.push(`  id="${audio.id}"`);
  props.push(`  assetId="${audio.assetId}"`);
  props.push(`  src="${audio.src}"`);

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

export type AudioPresetName = "basic" | "with-artwork" | "with-actions";

export const audioPresets: Record<AudioPresetName, PresetWithCodeGen<AudioData>> = {
  basic: {
    description: "Simple audio player",
    data: {
      audio: {
        id: "audio-preview-basic",
        assetId: "audio-basic",
        src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
        title: "Sample audio clip",
      },
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
  "with-artwork": {
    description: "Audio with artwork thumbnail and metadata",
    data: {
      audio: {
        id: "audio-preview-artwork",
        assetId: "audio-artwork",
        src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
        title: "Bell Labs hallway recording",
        description: "Ambient sounds where UNIX, C, and more took shape.",
        artwork: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&auto=format&fit=crop",
        fileSizeBytes: 215040,
        durationMs: 30000,
        createdAt: "2025-02-12T10:15:00.000Z",
        source: {
          label: "Archive reel",
          iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=reel",
        },
      },
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
  "with-actions": {
    description: "Audio with response action buttons",
    data: {
      audio: {
        id: "audio-preview-actions",
        assetId: "audio-actions",
        src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
        title: "Podcast episode",
        description: "A deep dive into software architecture.",
        artwork: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&auto=format&fit=crop",
        durationMs: 1800000,
      },
      responseActions: [
        { id: "share", label: "Share", variant: "default" },
        { id: "download", label: "Download", variant: "secondary" },
      ],
    } satisfies AudioData,
    generateExampleCode: generateAudioCode,
  },
};
