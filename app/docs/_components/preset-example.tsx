"use client";

import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Chart } from "@/components/tool-ui/chart";
import { chartPresets, ChartPresetName } from "@/lib/presets/chart";
import {
  OptionList,
  OptionListReceipt,
} from "@/components/tool-ui/option-list";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { Terminal } from "@/components/tool-ui/terminal";
import {
  optionListPresets,
  OptionListPresetName,
} from "@/lib/presets/option-list";
import {
  codeBlockPresets,
  CodeBlockPresetName,
} from "@/lib/presets/code-block";
import { terminalPresets, TerminalPresetName } from "@/lib/presets/terminal";
import { Plan } from "@/components/tool-ui/plan";
import { planPresets, PlanPresetName } from "@/lib/presets/plan";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import {
  itemCarouselPresets,
  ItemCarouselPresetName,
} from "@/lib/presets/item-carousel";
import {
  ApprovalCard,
  ApprovalCardReceipt,
} from "@/components/tool-ui/approval-card";
import {
  approvalCardPresets,
  ApprovalCardPresetName,
} from "@/lib/presets/approval-card";
import {
  QuestionFlowProgressive,
  QuestionFlowUpfront,
  QuestionFlowReceipt,
} from "@/components/tool-ui/question-flow";
import {
  questionFlowPresets,
  QuestionFlowPresetName,
} from "@/lib/presets/question-flow";

function generateOptionListCode(preset: OptionListPresetName): string {
  const list = optionListPresets[preset].data;
  const props: string[] = [];

  props.push(
    `  options={${JSON.stringify(list.options, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (list.selectionMode) {
    props.push(`  selectionMode="${list.selectionMode}"`);
  }

  if (list.minSelections && list.minSelections !== 1) {
    props.push(`  minSelections={${list.minSelections}}`);
  }

  if (list.maxSelections) {
    props.push(`  maxSelections={${list.maxSelections}}`);
  }

  if ("choice" in list && list.choice !== undefined) {
    const choiceValue =
      typeof list.choice === "string"
        ? `"${list.choice}"`
        : JSON.stringify(list.choice);
    props.push(`  choice={${choiceValue}}`);
    return `<OptionListReceipt\n${props.join("\n")}\n/>`;
  }

  if ("responseActions" in list && list.responseActions) {
    const hasActions = Array.isArray(list.responseActions)
      ? list.responseActions.length > 0
      : list.responseActions.items.length > 0;

    if (hasActions) {
      props.push(
        `  responseActions={${JSON.stringify(list.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }
  }

  props.push(`  onConfirm={(selection) => console.log(selection)}`);

  return `<OptionList\n${props.join("\n")}\n/>`;
}

function generateCodeBlockCode(preset: CodeBlockPresetName): string {
  const block = codeBlockPresets[preset].data;
  const props: string[] = [];

  props.push(`  code={\`${block.code.replace(/`/g, "\\`")}\`}`);
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

  return `<CodeBlock\n${props.join("\n")}\n/>`;
}

function generateTerminalCode(preset: TerminalPresetName): string {
  const term = terminalPresets[preset].data;
  const props: string[] = [];

  props.push(`  command="${term.command.replace(/"/g, '\\"')}"`);

  if (term.stdout) {
    props.push(`  stdout={\`${term.stdout.replace(/`/g, "\\`")}\`}`);
  }

  if (term.stderr) {
    props.push(`  stderr={\`${term.stderr.replace(/`/g, "\\`")}\`}`);
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

  return `<Terminal\n${props.join("\n")}\n/>`;
}

interface OptionListPresetExampleProps {
  preset: OptionListPresetName;
}

export function OptionListPresetExample({
  preset,
}: OptionListPresetExampleProps) {
  const data = optionListPresets[preset].data;
  const code = generateOptionListCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose mx-auto max-w-md">
          {"choice" in data ? (
            <OptionListReceipt {...data} />
          ) : (
            <OptionList {...data} />
          )}
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

function generateChartCode(preset: ChartPresetName): string {
  const config = chartPresets[preset].data;
  const props: string[] = [];

  props.push(`  id="chart-example"`);
  props.push(`  type="${config.type}"`);

  if (config.title) {
    props.push(`  title="${config.title}"`);
  }

  if (config.description) {
    props.push(`  description="${config.description}"`);
  }

  props.push(
    `  data={${JSON.stringify(config.data, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(`  xKey="${config.xKey}"`);
  props.push(
    `  series={${JSON.stringify(config.series, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (config.showLegend) {
    props.push(`  showLegend`);
  }

  if (config.showGrid) {
    props.push(`  showGrid`);
  }

  return `<Chart\n${props.join("\n")}\n/>`;
}

interface ChartPresetExampleProps {
  preset: ChartPresetName;
}

export function ChartPresetExample({ preset }: ChartPresetExampleProps) {
  const config = chartPresets[preset].data;
  const code = generateChartCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <Chart id={`chart-${preset}`} {...config} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

interface CodeBlockPresetExampleProps {
  preset: CodeBlockPresetName;
}

export function CodeBlockPresetExample({
  preset,
}: CodeBlockPresetExampleProps) {
  const data = codeBlockPresets[preset].data;
  const code = generateCodeBlockCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <CodeBlock {...data} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

interface TerminalPresetExampleProps {
  preset: TerminalPresetName;
}

export function TerminalPresetExample({ preset }: TerminalPresetExampleProps) {
  const data = terminalPresets[preset].data;
  const code = generateTerminalCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <Terminal {...data} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

function generatePlanCode(preset: PlanPresetName): string {
  const plan = planPresets[preset].data;
  const props: string[] = [];

  props.push(`  id="${plan.id}"`);
  props.push(`  title="${plan.title}"`);

  if (plan.description) {
    props.push(`  description="${plan.description}"`);
  }

  props.push(
    `  todos={${JSON.stringify(plan.todos, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (plan.maxVisibleTodos) {
    props.push(`  maxVisibleTodos={${plan.maxVisibleTodos}}`);
  }

  return `<Plan\n${props.join("\n")}\n/>`;
}

interface PlanPresetExampleProps {
  preset: PlanPresetName;
}

export function PlanPresetExample({ preset }: PlanPresetExampleProps) {
  const data = planPresets[preset].data;
  const code = generatePlanCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose mx-auto max-w-xl">
          <Plan {...data} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

function generateItemCarouselCode(preset: ItemCarouselPresetName): string {
  const list = itemCarouselPresets[preset].data;
  const props: string[] = [];

  props.push(`  id="${list.id}"`);
  props.push(
    `  items={${JSON.stringify(list.items, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  onItemClick={(itemId) => console.log("Clicked:", itemId)}`,
  );
  props.push(
    `  onItemAction={(itemId, actionId) => console.log("Action:", itemId, actionId)}`,
  );

  return `<ItemCarousel\n${props.join("\n")}\n/>`;
}

interface ItemCarouselPresetExampleProps {
  preset: ItemCarouselPresetName;
}

export function ItemCarouselPresetExample({
  preset,
}: ItemCarouselPresetExampleProps) {
  const data = itemCarouselPresets[preset].data;
  const code = generateItemCarouselCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <ItemCarousel {...data} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

function generateApprovalCardCode(preset: ApprovalCardPresetName): string {
  const data = approvalCardPresets[preset].data;
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  title="${data.title}"`);

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  if (data.icon) {
    props.push(`  icon="${data.icon}"`);
  }

  if (data.metadata && data.metadata.length > 0) {
    props.push(
      `  metadata={${JSON.stringify(data.metadata, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.variant) {
    props.push(`  variant="${data.variant}"`);
  }

  if (data.confirmLabel) {
    props.push(`  confirmLabel="${data.confirmLabel}"`);
  }

  if (data.cancelLabel) {
    props.push(`  cancelLabel="${data.cancelLabel}"`);
  }

  if ("choice" in data && data.choice !== undefined) {
    props.push(`  choice="${data.choice}"`);
    return `<ApprovalCardReceipt\n${props.join("\n")}\n/>`;
  }

  return `<ApprovalCard\n${props.join("\n")}\n/>`;
}

interface ApprovalCardPresetExampleProps {
  preset: ApprovalCardPresetName;
}

export function ApprovalCardPresetExample({
  preset,
}: ApprovalCardPresetExampleProps) {
  const data = approvalCardPresets[preset].data;
  const code = generateApprovalCardCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose mx-auto max-w-sm">
          {"choice" in data ? (
            <ApprovalCardReceipt {...data} />
          ) : (
            <ApprovalCard {...data} />
          )}
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

interface QuestionFlowPresetExampleProps {
  preset: QuestionFlowPresetName;
}

export function QuestionFlowPresetExample({
  preset,
}: QuestionFlowPresetExampleProps) {
  const presetData = questionFlowPresets[preset];
  const code = presetData.generateExampleCode(presetData.data);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose mx-auto max-w-md">
          {"choice" in presetData.data ? (
            <QuestionFlowReceipt {...presetData.data} />
          ) : "steps" in presetData.data ? (
            <QuestionFlowUpfront {...presetData.data} />
          ) : (
            <QuestionFlowProgressive {...presetData.data} />
          )}
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}
