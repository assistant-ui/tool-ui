import type { SerializableStatsDisplay } from "@/components/tool-ui/stats-display";
import type { PresetWithCodeGen } from "./types";

export type StatsDisplayPresetName =
  | "business-metrics"
  | "fitness-summary"
  | "portfolio"
  | "mixed-formats"
  | "single-stat";

type StatsDisplayPreset = PresetWithCodeGen<SerializableStatsDisplay>;

function generateStatsDisplayCode(data: SerializableStatsDisplay): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.title) {
    props.push(`  title="${data.title}"`);
  }

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  props.push(
    `  stats={${JSON.stringify(data.stats, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  return `<StatsDisplay\n${props.join("\n")}\n/>`;
}

export const statsDisplayPresets: Record<StatsDisplayPresetName, StatsDisplayPreset> = {
  "business-metrics": {
    description: "Full-featured dashboard with sparklines and diff indicators",
    data: {
      id: "stats-display-business-metrics",
      title: "Q4 Performance",
      description: "October through December 2024",
      stats: [
        {
          key: "revenue",
          label: "Revenue",
          value: 847300,
          format: { kind: "currency", currency: "USD", decimals: 0 },
          sparkline: {
            data: [72000, 68000, 74000, 81000, 78000, 85000, 89000, 91000, 86000, 94000, 97000, 102000],
            color: "var(--chart-1)",
          },
          diff: { value: 12.4, decimals: 1 },
        },
        {
          key: "active-users",
          label: "Active Users",
          value: 24890,
          format: { kind: "number", compact: true },
          sparkline: {
            data: [18200, 19100, 19800, 20400, 21200, 21900, 22600, 23100, 23800, 24200, 24500, 24890],
            color: "var(--chart-3)",
          },
          diff: { value: 8.2, decimals: 1 },
        },
        {
          key: "churn",
          label: "Churn Rate",
          value: 2.1,
          format: { kind: "percent", decimals: 1, basis: "unit" },
          sparkline: {
            data: [3.2, 3.0, 2.8, 2.9, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.1, 2.1],
            color: "var(--chart-4)",
          },
          diff: { value: -0.8, decimals: 1, upIsPositive: false },
        },
        {
          key: "nps",
          label: "NPS Score",
          value: 72,
          format: { kind: "number" },
          sparkline: {
            data: [58, 61, 64, 62, 65, 68, 66, 69, 70, 71, 71, 72],
            color: "var(--chart-5)",
          },
          diff: { value: 5.0, decimals: 0 },
        },
      ],
    },
    generateExampleCode: generateStatsDisplayCode,
  },
  "fitness-summary": {
    description: "Personal health metrics with sparklines",
    data: {
      id: "stats-display-fitness-summary",
      title: "Today's Activity",
      stats: [
        {
          key: "steps",
          label: "Steps",
          value: 8432,
          format: { kind: "number" },
          sparkline: {
            data: [1200, 2400, 3100, 4800, 5200, 6100, 7400, 8432],
            color: "var(--chart-3)",
          },
          diff: { value: 12.4, decimals: 0 },
        },
        {
          key: "calories",
          label: "Calories",
          value: 524,
          format: { kind: "number" },
          sparkline: {
            data: [80, 145, 210, 285, 340, 410, 465, 524],
            color: "var(--chart-5)",
          },
        },
        {
          key: "active-minutes",
          label: "Active Minutes",
          value: 47,
          format: { kind: "number" },
          sparkline: {
            data: [8, 15, 22, 28, 32, 38, 43, 47],
            color: "var(--chart-4)",
          },
        },
        {
          key: "heart-rate",
          label: "Avg Heart Rate",
          value: 72,
          format: { kind: "number" },
          sparkline: {
            data: [68, 71, 74, 82, 78, 71, 69, 72],
            color: "var(--chart-2)",
          },
        },
      ],
    },
    generateExampleCode: generateStatsDisplayCode,
  },
  portfolio: {
    description: "Investment performance with currency and percent formatting",
    data: {
      id: "stats-display-portfolio",
      title: "Portfolio Summary",
      description: "As of market close",
      stats: [
        {
          key: "total-value",
          label: "Total Value",
          value: 284750,
          format: { kind: "currency", currency: "USD", decimals: 0 },
          sparkline: {
            data: [268000, 271000, 265000, 274000, 278000, 282000, 279000, 284750],
            color: "var(--chart-1)",
          },
        },
        {
          key: "day-change",
          label: "Day Change",
          value: 1847.50,
          format: { kind: "currency", currency: "USD" },
          diff: { value: 0.65, decimals: 2 },
        },
        {
          key: "total-return",
          label: "Total Return",
          value: 0.182,
          format: { kind: "percent", decimals: 1, basis: "fraction" },
          diff: { value: 18.2, decimals: 1 },
        },
        {
          key: "dividend-yield",
          label: "Dividend Yield",
          value: 2.4,
          format: { kind: "percent", decimals: 1, basis: "unit" },
        },
      ],
    },
    generateExampleCode: generateStatsDisplayCode,
  },
  "mixed-formats": {
    description: "Different format types in a single display",
    data: {
      id: "stats-display-mixed-formats",
      title: "Subscription Overview",
      stats: [
        {
          key: "mrr",
          label: "MRR",
          value: 42850,
          format: { kind: "currency", currency: "EUR", decimals: 0 },
          sparkline: {
            data: [38000, 39200, 40100, 41000, 41800, 42850],
            color: "var(--chart-1)",
          },
          diff: { value: 6.8, decimals: 1 },
        },
        {
          key: "subscribers",
          label: "Active Subscribers",
          value: 1247,
          format: { kind: "number" },
          diff: { value: 3.2, decimals: 1 },
        },
        {
          key: "conversion",
          label: "Trial Conversion",
          value: 0.234,
          format: { kind: "percent", decimals: 1, basis: "fraction" },
        },
        {
          key: "plan",
          label: "Most Popular Plan",
          value: "Professional",
          format: { kind: "text" },
        },
      ],
    },
    generateExampleCode: generateStatsDisplayCode,
  },
  "single-stat": {
    description: "Single prominent metric with sparkline",
    data: {
      id: "stats-display-single-stat",
      stats: [
        {
          key: "active-users",
          label: "Active Users",
          value: 1847,
          format: { kind: "number" },
          sparkline: {
            data: [1420, 1380, 1510, 1620, 1580, 1690, 1720, 1780, 1810, 1847],
            color: "var(--chart-1)",
          },
          diff: { value: 12.3, decimals: 1 },
        },
      ],
    },
    generateExampleCode: generateStatsDisplayCode,
  },
};
