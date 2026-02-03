import type { SerializableInsightCard } from "@/components/tool-ui/insight-card";
import type { PresetWithCodeGen } from "./types";

export type InsightCardPresetName =
  | "stale-work-alert"
  | "activation-drop"
  | "cost-anomaly"
  | "pipeline-win";

type InsightCardPreset = PresetWithCodeGen<SerializableInsightCard>;

function generateInsightCardCode(data: SerializableInsightCard): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  title="${data.title}"`);
  props.push(`  summary="${data.summary}"`);

  if (data.severity) props.push(`  severity="${data.severity}"`);
  if (data.footer) props.push(`  footer="${data.footer}"`);

  if (data.confidence) {
    props.push(
      `  confidence={${JSON.stringify(data.confidence, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.citations) {
    props.push(
      `  citations={${JSON.stringify(data.citations, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.action) {
    props.push(
      `  action={${JSON.stringify(data.action, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.responseActions) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  return `<InsightCard\n${props.join("\n")}\n/>`;
}

export const insightCardPresets: Record<InsightCardPresetName, InsightCardPreset> = {
  "stale-work-alert": {
    description: "Stale work alert with citations and action",
    data: {
      id: "insight-stale-work",
      title: "Stale Work Alert",
      summary:
        "No commits on core pipeline in 10 days while error rate increased 22%.",
      severity: "warning",
      confidence: { score: 0.83, label: "High" },
      citations: [
        {
          id: "c1",
          title: "Pipeline Error Rate",
          source: "monitoring",
          excerpt: "Error rate rose from 1.8% to 2.2% over 10 days.",
        },
        {
          id: "c2",
          title: "Repo Activity",
          source: "git",
          excerpt: "No commits to /pipeline since Jan 24.",
        },
        {
          id: "c3",
          title: "Incident Timeline",
          source: "ops",
          excerpt: "Last remediation attempt failed on Jan 27.",
        },
      ],
      action: { id: "draft-pr", label: "Draft fix PR", variant: "default" },
      footer: "Last refreshed 4m ago",
    },
    generateExampleCode: generateInsightCardCode,
  },
  "activation-drop": {
    description: "Activation dip with confidence meter",
    data: {
      id: "insight-activation-drop",
      title: "Activation Dip",
      summary:
        "Trial-to-activated conversion fell 3.2% week-over-week in enterprise tier.",
      severity: "warning",
      confidence: { score: 0.71, label: "Medium" },
      citations: [
        {
          id: "c1",
          title: "Activation Funnel",
          source: "analytics",
          excerpt: "Enterprise conversion dropped from 31.4% to 28.2%.",
        },
        {
          id: "c2",
          title: "Product Usage",
          source: "telemetry",
          excerpt: "Aha moment completion rate decreased across new cohorts.",
        },
      ],
      action: { id: "open-report", label: "Open cohort report", variant: "secondary" },
      footer: "Updated 15m ago",
    },
    generateExampleCode: generateInsightCardCode,
  },
  "cost-anomaly": {
    description: "Critical cost anomaly with quick action",
    data: {
      id: "insight-cost-anomaly",
      title: "Cost Anomaly",
      summary: "Compute spend spiked 48% after enabling new batch jobs.",
      severity: "critical",
      confidence: { score: 0.9, label: "High" },
      citations: [
        {
          id: "c1",
          title: "Cloud Cost Ledger",
          source: "billing",
          excerpt: "Batch cluster spend increased from $2.1k to $3.1k/day.",
        },
      ],
      action: { id: "pause-jobs", label: "Pause batch jobs", variant: "destructive" },
      footer: "Detected 2h ago",
    },
    generateExampleCode: generateInsightCardCode,
  },
  "pipeline-win": {
    description: "Positive insight with confirmation action",
    data: {
      id: "insight-pipeline-win",
      title: "Pipeline Win",
      summary: "Deploy latency improved 18% after parallelizing build steps.",
      severity: "success",
      confidence: { score: 0.78, label: "Medium" },
      citations: [
        {
          id: "c1",
          title: "Build Metrics",
          source: "ci",
          excerpt: "Median deploy time dropped from 14.2m to 11.6m.",
        },
      ],
      action: { id: "share-update", label: "Share with team", variant: "default" },
      footer: "Last week",
    },
    generateExampleCode: generateInsightCardCode,
  },
};
