import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { PresetName, presetDescriptions } from "@/lib/sample-data";

interface PresetSelectorProps {
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
}

const presetNames: PresetName[] = [
  "basic",
  "stocks",
  "products",
  "empty",
  "large",
  "with-actions",
  "sorted",
];

export function PresetSelector({
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      {presetNames.map((preset) => (
        <Card
          key={preset}
          className={
            currentPreset === preset ? "border-primary" : "cursor-pointer"
          }
          onClick={() => onSelectPreset(preset)}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium capitalize">
                  {preset.replace("-", " ")}
                </div>
                <CardDescription className="text-xs">
                  {presetDescriptions[preset]}
                </CardDescription>
              </div>
              {currentPreset === preset && (
                <div className="ml-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
