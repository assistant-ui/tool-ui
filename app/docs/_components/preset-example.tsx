"use client";

import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Chart } from "@/components/tool-ui/chart";
import { ChartPresetName, presets as chartPresets } from "@/lib/presets/chart";
import { OptionList } from "@/components/tool-ui/option-list";
import {
  optionListPresets,
  OptionListPresetName,
  OptionListConfig,
} from "@/lib/presets/option-list";

function generateOptionListCode(config: OptionListConfig): string {
  const list = config.optionList;
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

  if (list.confirmed) {
    const confirmedValue =
      typeof list.confirmed === "string"
        ? `"${list.confirmed}"`
        : JSON.stringify(list.confirmed);
    props.push(`  confirmed={${confirmedValue}}`);
  }

  if (list.footerActions) {
    const hasActions = Array.isArray(list.footerActions)
      ? list.footerActions.length > 0
      : list.footerActions.items.length > 0;

    if (hasActions) {
      props.push(
        `  footerActions={${JSON.stringify(list.footerActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }
  }

  // Only add onConfirm for interactive (non-receipt) examples
  if (!list.confirmed) {
    props.push(`  onConfirm={(selection) => console.log(selection)}`);
  }

  return `<OptionList\n${props.join("\n")}\n/>`;
}

interface OptionListPresetExampleProps {
  preset: OptionListPresetName;
}

export function OptionListPresetExample({
  preset,
}: OptionListPresetExampleProps) {
  const config = optionListPresets[preset];
  const code = generateOptionListCode(config);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <OptionList {...config.optionList} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}

function generateChartCode(preset: ChartPresetName): string {
  const config = chartPresets[preset];
  const props: string[] = [];

  props.push(`  surfaceId="chart-example"`);
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
  const config = chartPresets[preset];
  const code = generateChartCode(preset);

  return (
    <Tabs items={["Preview", "Code"]}>
      <Tab value="Preview">
        <div className="not-prose">
          <Chart surfaceId={`chart-${preset}`} {...config} />
        </div>
      </Tab>
      <Tab value="Code">
        <DynamicCodeBlock lang="tsx" code={code} />
      </Tab>
    </Tabs>
  );
}
