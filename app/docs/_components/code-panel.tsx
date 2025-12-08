"use client";

import { DataTableConfig } from "@/lib/presets/data-table";
import { MediaCardConfig } from "@/lib/presets/media-card";
import { OptionListConfig } from "@/lib/presets/option-list";
import { ChartConfig } from "@/lib/presets/chart";
import { CodeBlockConfig } from "@/lib/presets/code-block";
import { TerminalConfig } from "@/lib/presets/terminal";
import { PlanConfig } from "@/lib/presets/plan";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

interface CodePanelProps {
  componentId: string;
  config?: DataTableConfig;
  mediaCardConfig?: MediaCardConfig;
  optionListConfig?: OptionListConfig;
  chartConfig?: ChartConfig;
  codeBlockConfig?: CodeBlockConfig;
  terminalConfig?: TerminalConfig;
  planConfig?: PlanConfig;
  optionListSelection?: string[] | string | null;
  mediaCardMaxWidth?: string;
  sort?: { by?: string; direction?: "asc" | "desc" };
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  mode?: "details" | "plain";
}

export function CodePanel({
  componentId,
  config,
  mediaCardConfig,
  optionListConfig,
  chartConfig,
  codeBlockConfig,
  terminalConfig,
  planConfig,
  optionListSelection,
  mediaCardMaxWidth,
  sort,
  isLoading,
  emptyMessage,
}: CodePanelProps) {
  const generateDataTableCode = () => {
    if (!config) return "";

    const props: string[] = [];

    props.push(
      `  columns={${JSON.stringify(config.columns, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    props.push(
      `  data={${JSON.stringify(config.data, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (config.rowIdKey) {
      props.push(`  rowIdKey="${config.rowIdKey}"`);
    }

    if (config.defaultSort) {
      props.push(
        `  defaultSort={${JSON.stringify(config.defaultSort, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    if (emptyMessage && emptyMessage !== "No data available") {
      props.push(`  emptyMessage="${emptyMessage}"`);
    }

    if (config.maxHeight) {
      props.push(`  maxHeight="${config.maxHeight}"`);
    }

    if (config.locale) {
      props.push(`  locale="${config.locale}"`);
    }

    if (config.responseActions && config.responseActions.length > 0) {
      props.push(
        `  responseActions={${JSON.stringify(config.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
      props.push(
        `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
      );
    }

    // Generate sorting guidance only when relying on controlled state
    const sortingComment: string[] = [];
    if (!config.defaultSort && sort?.by && sort?.direction) {
      sortingComment.push(
        `  {/* Sorting: Choose controlled or uncontrolled pattern */}`,
      );
      sortingComment.push(
        `  {/* Option 1 (Uncontrolled): defaultSort={{ by: "${sort.by}", direction: "${sort.direction}" }} */}`,
      );
      sortingComment.push(
        `  {/* Option 2 (Controlled): sort={sort} onSortChange={setSort} */}`,
      );
    }

    const sortingExplanation =
      sortingComment.length > 0 ? `\n${sortingComment.join("\n")}\n` : "";

    return `${sortingExplanation}<DataTable\n${props.join("\n")}\n/>`;
  };

  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const formatObject = (value: Record<string, unknown>) =>
    JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");

  const generateMediaCardCode = () => {
    if (!mediaCardConfig) return "";
    const card = mediaCardConfig.card;
    const props: string[] = [];

    props.push(`  assetId="${card.assetId}"`);
    props.push(`  kind="${card.kind}"`);

    if (card.src) {
      props.push(`  src="${card.src}"`);
    }

    if (card.href) {
      props.push(`  href="${card.href}"`);
    }

    if (card.thumb) {
      props.push(`  thumb="${card.thumb}"`);
    }

    if (card.alt) {
      props.push(`  alt="${escape(card.alt)}"`);
    }

    if (card.title || card.og?.title) {
      props.push(`  title="${escape(card.title ?? card.og?.title ?? "")}"`);
    }

    if (card.description || card.og?.description) {
      props.push(
        `  description="${escape(
          card.description ?? card.og?.description ?? "",
        )}"`,
      );
    }

    if (card.domain) {
      props.push(`  domain="${card.domain}"`);
    }

    if (card.ratio) {
      props.push(`  ratio="${card.ratio}"`);
    }

    if (card.fit) {
      props.push(`  fit="${card.fit}"`);
    }

    if (card.durationMs) {
      props.push(`  durationMs={${card.durationMs}}`);
    }

    if (card.fileSizeBytes) {
      props.push(`  fileSizeBytes={${card.fileSizeBytes}}`);
    }

    if (card.createdAtISO) {
      props.push(`  createdAtISO="${card.createdAtISO}"`);
    }

    if (card.locale) {
      props.push(`  locale="${card.locale}"`);
    }

    if (card.source) {
      props.push(
        `  source={${formatObject(card.source as Record<string, unknown>)}}`,
      );
    }

    if (card.og) {
      props.push(`  og={${formatObject(card.og as Record<string, unknown>)}}`);
    }

    if (mediaCardMaxWidth && mediaCardMaxWidth.trim().length > 0) {
      props.push(`  maxWidth="${mediaCardMaxWidth.trim()}"`);
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    if (
      mediaCardConfig.responseActions &&
      mediaCardConfig.responseActions.length > 0
    ) {
      props.push(
        `  responseActions={${JSON.stringify(mediaCardConfig.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
      props.push(
        `  onResponseAction={(actionId) => console.log("Action:", actionId)}`,
      );
    }

    return `<MediaCard\n${props.join("\n")}\n/>`;
  };

  const generateOptionListCode = () => {
    if (!optionListConfig) return "";
    const list = optionListConfig.optionList;
    const props: string[] = [];

    props.push(
      `  options={${JSON.stringify(list.options, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (list.selectionMode && list.selectionMode !== "multi") {
      props.push(`  selectionMode="${list.selectionMode}"`);
    }

    if (optionListSelection) {
      props.push(`  value={${JSON.stringify(optionListSelection)}}`);
    }

    if (list.minSelections && list.minSelections !== 1) {
      props.push(`  minSelections={${list.minSelections}}`);
    }

    if (list.maxSelections) {
      props.push(`  maxSelections={${list.maxSelections}}`);
    }

    if (list.responseActions) {
      props.push(
        `  responseActions={${JSON.stringify(list.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    props.push(
      `  onConfirm={(selection) => {\n    console.log("Selection:", selection);\n  }}`,
    );

    return `<OptionList\n${props.join("\n")}\n/>`;
  };

  const generateChartCode = () => {
    if (!chartConfig) return "";
    const props: string[] = [];

    props.push(`  id="chart-example"`);
    props.push(`  type="${chartConfig.type}"`);

    if (chartConfig.title) {
      props.push(`  title="${chartConfig.title}"`);
    }

    if (chartConfig.description) {
      props.push(`  description="${chartConfig.description}"`);
    }

    props.push(
      `  data={${JSON.stringify(chartConfig.data, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(`  xKey="${chartConfig.xKey}"`);
    props.push(
      `  series={${JSON.stringify(chartConfig.series, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (chartConfig.colors) {
      props.push(
        `  colors={${JSON.stringify(chartConfig.colors, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (chartConfig.showLegend) {
      props.push(`  showLegend`);
    }

    if (chartConfig.showGrid) {
      props.push(`  showGrid`);
    }

    return `<Chart\n${props.join("\n")}\n/>`;
  };

  const generateCodeBlockCode = () => {
    if (!codeBlockConfig) return "";
    const block = codeBlockConfig.codeBlock;
    const props: string[] = [];

    props.push(`  code={\`${escape(block.code)}\`}`);
    props.push(`  language="${block.language}"`);

    if (block.filename) {
      props.push(`  filename="${block.filename}"`);
    }

    if (block.showLineNumbers !== undefined) {
      props.push(`  showLineNumbers={${block.showLineNumbers}}`);
    }

    if (block.highlightLines && block.highlightLines.length > 0) {
      props.push(`  highlightLines={[${block.highlightLines.join(", ")}]}`);
    }

    if (block.maxCollapsedLines) {
      props.push(`  maxCollapsedLines={${block.maxCollapsedLines}}`);
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    return `<CodeBlock\n${props.join("\n")}\n/>`;
  };

  const generateTerminalCode = () => {
    if (!terminalConfig) return "";
    const term = terminalConfig.terminal;
    const props: string[] = [];

    props.push(`  command="${escape(term.command)}"`);

    if (term.stdout) {
      props.push(`  stdout={\`${escape(term.stdout)}\`}`);
    }

    if (term.stderr) {
      props.push(`  stderr={\`${escape(term.stderr)}\`}`);
    }

    props.push(`  exitCode={${term.exitCode}}`);

    if (term.durationMs !== undefined) {
      props.push(`  durationMs={${term.durationMs}}`);
    }

    if (term.cwd) {
      props.push(`  cwd="${term.cwd}"`);
    }

    if (term.truncated) {
      props.push(`  truncated={${term.truncated}}`);
    }

    if (term.maxCollapsedLines) {
      props.push(`  maxCollapsedLines={${term.maxCollapsedLines}}`);
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    return `<Terminal\n${props.join("\n")}\n/>`;
  };

  const generatePlanCode = () => {
    if (!planConfig) return "";
    const plan = planConfig.plan;
    const props: string[] = [];

    props.push(`  id="${plan.id}"`);
    props.push(`  title="${escape(plan.title)}"`);

    if (plan.description) {
      props.push(`  description="${escape(plan.description)}"`);
    }

    props.push(
      `  todos={${JSON.stringify(plan.todos, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (plan.maxVisibleTodos) {
      props.push(`  maxVisibleTodos={${plan.maxVisibleTodos}}`);
    }

    return `<Plan\n${props.join("\n")}\n/>`;
  };

  const generateCode = () => {
    if (componentId === "data-table") {
      return generateDataTableCode();
    } else if (componentId === "media-card") {
      return generateMediaCardCode();
    } else if (componentId === "option-list") {
      return generateOptionListCode();
    } else if (componentId === "chart") {
      return generateChartCode();
    } else if (componentId === "code-block") {
      return generateCodeBlockCode();
    } else if (componentId === "terminal") {
      return generateTerminalCode();
    } else if (componentId === "plan") {
      return generatePlanCode();
    }
    return "";
  };

  const code = generateCode();

  return (
    <DynamicCodeBlock
      lang="tsx"
      code={code}
      codeblock={{
        "data-line-numbers": true,
        "data-line-numbers-start": 1,
      }}
    />
  );
}
