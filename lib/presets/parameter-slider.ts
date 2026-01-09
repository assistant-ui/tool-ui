import type { SerializableParameterSlider } from "@/components/tool-ui/parameter-slider";
import type { PresetWithCodeGen } from "./types";

export type ParameterSliderPresetName =
  | "photo-adjustments"
  | "color-grading"
  | "audio-eq"
  | "single-slider"
  | "video-export";

function formatSliderConfig(slider: SerializableParameterSlider["sliders"][number]): string {
  const parts: string[] = [
    `id: "${slider.id}"`,
    `label: "${slider.label}"`,
    `min: ${slider.min}`,
    `max: ${slider.max}`,
  ];

  if (slider.step !== undefined && slider.step !== 1) {
    parts.push(`step: ${slider.step}`);
  }

  parts.push(`value: ${slider.value}`);

  if (slider.unit) {
    parts.push(`unit: "${slider.unit}"`);
  }

  if (slider.precision !== undefined) {
    parts.push(`precision: ${slider.precision}`);
  }

  return `{ ${parts.join(", ")} }`;
}

function generateParameterSliderCode(data: SerializableParameterSlider): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  const slidersStr = data.sliders
    .map((s) => `    ${formatSliderConfig(s)}`)
    .join(",\n");
  props.push(`  sliders={[\n${slidersStr},\n  ]}`);

  if (data.responseActions) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  props.push(
    `  onResponseAction={(actionId, values) => {\n    console.log(actionId, values);\n  }}`,
  );

  return `<ParameterSlider\n${props.join("\n")}\n/>`;
}

export const parameterSliderPresets: Record<
  ParameterSliderPresetName,
  PresetWithCodeGen<SerializableParameterSlider>
> = {
  "photo-adjustments": {
    description: "Photo editing exposure controls",
    data: {
      id: "parameter-slider-photo-adjustments",
      sliders: [
        { id: "exposure", label: "Exposure", min: -3, max: 3, step: 0.1, value: 0.3, unit: "EV", precision: 1 },
        { id: "contrast", label: "Contrast", min: -100, max: 100, step: 5, value: 15, unit: "%" },
        { id: "highlights", label: "Highlights", min: -100, max: 100, step: 5, value: -20, unit: "%" },
        { id: "shadows", label: "Shadows", min: -100, max: 100, step: 5, value: 25, unit: "%" },
      ],
      responseActions: [
        { id: "reset", label: "Reset", variant: "ghost" },
        { id: "apply", label: "Apply", variant: "default" },
      ],
    } satisfies SerializableParameterSlider,
    generateExampleCode: generateParameterSliderCode,
  },

  "color-grading": {
    description: "Color temperature and tint adjustments",
    data: {
      id: "parameter-slider-color-grading",
      sliders: [
        { id: "temperature", label: "Temperature", min: 2000, max: 10000, step: 100, value: 5600, unit: "K" },
        { id: "tint", label: "Tint", min: -100, max: 100, step: 5, value: -8 },
        { id: "saturation", label: "Saturation", min: -100, max: 100, step: 5, value: 12, unit: "%" },
      ],
      responseActions: [
        { id: "reset", label: "Reset", variant: "ghost" },
        { id: "apply", label: "Apply", variant: "default" },
      ],
    } satisfies SerializableParameterSlider,
    generateExampleCode: generateParameterSliderCode,
  },

  "audio-eq": {
    description: "Audio equalizer frequency controls",
    data: {
      id: "parameter-slider-audio-eq",
      sliders: [
        { id: "bass", label: "Bass", min: -12, max: 12, step: 1, value: 3, unit: "dB" },
        { id: "mid", label: "Mid", min: -12, max: 12, step: 1, value: -2, unit: "dB" },
        { id: "treble", label: "Treble", min: -12, max: 12, step: 1, value: 4, unit: "dB" },
      ],
      responseActions: [
        { id: "reset", label: "Flat", variant: "ghost" },
        { id: "apply", label: "Apply", variant: "default" },
      ],
    } satisfies SerializableParameterSlider,
    generateExampleCode: generateParameterSliderCode,
  },

  "single-slider": {
    description: "Single slider for simple adjustments",
    data: {
      id: "parameter-slider-single",
      sliders: [
        { id: "blur", label: "Background Blur", min: 0, max: 100, step: 5, value: 35, unit: "%" },
      ],
      responseActions: [
        { id: "reset", label: "Reset", variant: "ghost" },
        { id: "apply", label: "Apply", variant: "default" },
      ],
    } satisfies SerializableParameterSlider,
    generateExampleCode: generateParameterSliderCode,
  },

  "video-export": {
    description: "Video export quality settings",
    data: {
      id: "parameter-slider-video-export",
      sliders: [
        { id: "bitrate", label: "Bitrate", min: 1, max: 50, step: 0.5, value: 24, unit: "Mbps", precision: 1 },
        { id: "keyframe", label: "Keyframe Interval", min: 1, max: 10, step: 1, value: 2, unit: "sec" },
        { id: "quality", label: "CRF Quality", min: 0, max: 51, step: 1, value: 18 },
      ],
      responseActions: [
        { id: "reset", label: "Defaults", variant: "ghost" },
        { id: "apply", label: "Export", variant: "default" },
      ],
    } satisfies SerializableParameterSlider,
    generateExampleCode: generateParameterSliderCode,
  },
};
