import type { SerializableChart } from "@/components/tool-ui/chart";
import type { Preset } from "./types";

type ChartData = Omit<SerializableChart, "id">;

export type ChartPresetName = "revenue" | "performance" | "minimal";

export const chartPresets: Record<ChartPresetName, Preset<ChartData>> = {
  revenue: {
    description: "Bar chart with revenue vs expenses",
    data: {
      type: "bar",
      title: "Monthly Revenue",
      description: "Revenue vs Expenses (2024)",
      data: [
        { month: "Jan", revenue: 4000, expenses: 2400 },
        { month: "Feb", revenue: 3000, expenses: 1398 },
        { month: "Mar", revenue: 5000, expenses: 3200 },
        { month: "Apr", revenue: 2780, expenses: 3908 },
        { month: "May", revenue: 1890, expenses: 4800 },
        { month: "Jun", revenue: 2390, expenses: 3800 },
      ],
      xKey: "month",
      series: [
        { key: "revenue", label: "Revenue" },
        { key: "expenses", label: "Expenses" },
      ],
      showLegend: true,
      showGrid: true,
    } satisfies ChartData,
  },
  performance: {
    description: "Line chart with system metrics",
    data: {
      type: "line",
      title: "System Performance",
      description: "CPU and Memory usage over time",
      data: [
        { time: "00:00", cpu: 45, memory: 62 },
        { time: "04:00", cpu: 32, memory: 58 },
        { time: "08:00", cpu: 67, memory: 71 },
        { time: "12:00", cpu: 89, memory: 85 },
        { time: "16:00", cpu: 76, memory: 79 },
        { time: "20:00", cpu: 54, memory: 68 },
      ],
      xKey: "time",
      series: [
        { key: "cpu", label: "CPU %" },
        { key: "memory", label: "Memory %" },
      ],
      showLegend: true,
      showGrid: true,
    } satisfies ChartData,
  },
  minimal: {
    description: "Simple bar chart without title or legend",
    data: {
      type: "bar",
      data: [
        { category: "A", value: 100 },
        { category: "B", value: 200 },
        { category: "C", value: 150 },
        { category: "D", value: 300 },
      ],
      xKey: "category",
      series: [{ key: "value", label: "Value" }],
    } satisfies ChartData,
  },
};
