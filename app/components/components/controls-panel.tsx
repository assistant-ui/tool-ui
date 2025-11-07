import { PresetSelector } from "./preset-selector";
import { PresetName } from "@/lib/sample-data";
import { SocialPostPresetName } from "@/lib/social-post-presets";
import { MediaCardPresetName } from "@/lib/media-card-presets";
import { DecisionPromptPresetName } from "@/lib/decision-prompt-presets";

interface ControlsPanelProps {
  componentId: string;
  currentPreset:
    | PresetName
    | SocialPostPresetName
    | MediaCardPresetName
    | DecisionPromptPresetName;
  onSelectPreset: (
    preset:
      | PresetName
      | SocialPostPresetName
      | MediaCardPresetName
      | DecisionPromptPresetName,
  ) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  sort: { by?: string; direction?: "asc" | "desc" };
  onSortChange: (next: { by?: string; direction?: "asc" | "desc" }) => void;
  emptyMessage: string;
  onEmptyMessageChange: (message: string) => void;
  mediaCardMaxWidth?: string;
  onMediaCardMaxWidthChange?: (value: string) => void;
}

export function ControlsPanel({
  componentId,
  currentPreset,
  onSelectPreset,
}: ControlsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4 pb-24">
        <PresetSelector
          componentId={componentId}
          currentPreset={currentPreset}
          onSelectPreset={onSelectPreset}
        />
      </div>
    </div>
  );
}
