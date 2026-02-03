import type { SerializableTimeSeries } from "@/components/tool-ui/time-series";
import type { PresetWithCodeGen } from "./types";

export type TimeSeriesPresetName =
  | "latency-7d"
  | "revenue-30d"
  | "activation-rate"
  | "error-budget";

type TimeSeriesPreset = PresetWithCodeGen<SerializableTimeSeries>;

function generateTimeSeriesCode(data: SerializableTimeSeries): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.title) props.push(`  title="${data.title}"`);
  if (data.subtitle) props.push(`  subtitle="${data.subtitle}"`);
  if (data.unit) props.push(`  unit="${data.unit}"`);
  if (data.status) props.push(`  status="${data.status}"`);
  if (data.delta) {
    props.push(
      `  delta={${JSON.stringify(data.delta, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  props.push(
    `  points={${JSON.stringify(data.points, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.baseline) {
    props.push(
      `  baseline={${JSON.stringify(data.baseline, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.band) {
    props.push(
      `  band={${JSON.stringify(data.band, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.annotations) {
    props.push(
      `  annotations={${JSON.stringify(data.annotations, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  return `<TimeSeries\n${props.join("\n")}\n/>`;
}

const now = new Date();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const timeSeriesPresets: Record<TimeSeriesPresetName, TimeSeriesPreset> = {
  "latency-7d": {
    description: "API latency trend with band and baseline",
    data: {
      id: "ts-latency-7d",
      title: "API Latency",
      subtitle: "p95, last 7 days",
      unit: "ms",
      status: "warning",
      delta: { value: -12.5, label: "7d" },
      points: [
        { t: daysAgo(6), v: 320 },
        { t: daysAgo(5), v: 310 },
        { t: daysAgo(4), v: 290 },
        { t: daysAgo(3), v: 360 },
        { t: daysAgo(2), v: 410 },
        { t: daysAgo(1), v: 380 },
        { t: daysAgo(0), v: 330 },
      ],
      baseline: [
        { t: daysAgo(6), v: 300 },
        { t: daysAgo(5), v: 295 },
        { t: daysAgo(4), v: 285 },
        { t: daysAgo(3), v: 300 },
        { t: daysAgo(2), v: 305 },
        { t: daysAgo(1), v: 298 },
        { t: daysAgo(0), v: 292 },
      ],
      band: {
        label: "Expected",
        upper: [
          { t: daysAgo(6), v: 360 },
          { t: daysAgo(5), v: 350 },
          { t: daysAgo(4), v: 330 },
          { t: daysAgo(3), v: 390 },
          { t: daysAgo(2), v: 420 },
          { t: daysAgo(1), v: 400 },
          { t: daysAgo(0), v: 350 },
        ],
        lower: [
          { t: daysAgo(6), v: 280 },
          { t: daysAgo(5), v: 270 },
          { t: daysAgo(4), v: 260 },
          { t: daysAgo(3), v: 300 },
          { t: daysAgo(2), v: 340 },
          { t: daysAgo(1), v: 320 },
          { t: daysAgo(0), v: 300 },
        ],
      },
      annotations: [{ t: daysAgo(2), label: "Deploy" }],
    },
    generateExampleCode: generateTimeSeriesCode,
  },
  "revenue-30d": {
    description: "30-day revenue trend with positive delta",
    data: {
      id: "ts-revenue-30d",
      title: "Revenue",
      subtitle: "last 30 days",
      unit: "$",
      status: "positive",
      delta: { value: 8.2, label: "30d" },
      points: [
        { t: daysAgo(6), v: 12000 },
        { t: daysAgo(5), v: 12800 },
        { t: daysAgo(4), v: 13100 },
        { t: daysAgo(3), v: 14050 },
        { t: daysAgo(2), v: 13800 },
        { t: daysAgo(1), v: 14200 },
        { t: daysAgo(0), v: 15020 },
      ],
    },
    generateExampleCode: generateTimeSeriesCode,
  },
  "activation-rate": {
    description: "Activation rate with baseline comparison",
    data: {
      id: "ts-activation-rate",
      title: "Activation Rate",
      subtitle: "trial to activated",
      unit: "%",
      status: "positive",
      delta: { value: 2.4, label: "7d" },
      points: [
        { t: daysAgo(6), v: 28.2 },
        { t: daysAgo(5), v: 29.1 },
        { t: daysAgo(4), v: 30.4 },
        { t: daysAgo(3), v: 31.6 },
        { t: daysAgo(2), v: 30.8 },
        { t: daysAgo(1), v: 32.2 },
        { t: daysAgo(0), v: 33.1 },
      ],
      baseline: [
        { t: daysAgo(6), v: 27.4 },
        { t: daysAgo(5), v: 28.0 },
        { t: daysAgo(4), v: 28.6 },
        { t: daysAgo(3), v: 29.4 },
        { t: daysAgo(2), v: 29.8 },
        { t: daysAgo(1), v: 30.1 },
        { t: daysAgo(0), v: 30.8 },
      ],
    },
    generateExampleCode: generateTimeSeriesCode,
  },
  "error-budget": {
    description: "Error budget burn with warning status",
    data: {
      id: "ts-error-budget",
      title: "Error Budget Burn",
      subtitle: "last 14 days",
      unit: "%",
      status: "warning",
      delta: { value: -4.1, label: "14d" },
      points: [
        { t: daysAgo(6), v: 92.4 },
        { t: daysAgo(5), v: 91.8 },
        { t: daysAgo(4), v: 89.3 },
        { t: daysAgo(3), v: 88.1 },
        { t: daysAgo(2), v: 86.9 },
        { t: daysAgo(1), v: 85.7 },
        { t: daysAgo(0), v: 84.3 },
      ],
      annotations: [{ t: daysAgo(4), label: "Incident" }],
    },
    generateExampleCode: generateTimeSeriesCode,
  },
};
