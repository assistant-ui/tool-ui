"use client";

import { DataTableConfig } from "@/lib/sample-data";
import { SocialPostConfig } from "@/lib/social-post-presets";
import { MediaCardConfig } from "@/lib/media-card-presets";
import { OptionListConfig } from "@/lib/presets/option-list";
import type { OptionListSelection } from "@/components/tool-ui/option-list";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

interface CodePanelProps {
  componentId: string;
  config?: DataTableConfig;
  socialPostConfig?: SocialPostConfig;
  mediaCardConfig?: MediaCardConfig;
  optionListConfig?: OptionListConfig;
  optionListSelection?: OptionListSelection;
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
  socialPostConfig,
  mediaCardConfig,
  optionListConfig,
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

    if (config.actions && config.actions.length > 0) {
      props.push(
        `  actions={${JSON.stringify(config.actions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

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

    const requiresConfirmation = config.actions?.some(
      (action) => action.requiresConfirmation,
    );

    const confirmationHint = requiresConfirmation
      ? `\n// Tip: pair actions that set requiresConfirmation with onBeforeAction to trigger confirms.\n`
      : "";

    return `${sortingExplanation}<DataTable\n${props.join("\n")}\n/>${confirmationHint}`;
  };

  const generateSocialPostCode = () => {
    if (!socialPostConfig) return "";

    const post = socialPostConfig.post;
    const props: string[] = [];

    // Add the serializable props
    props.push(`  id="${post.id}"`);
    props.push(`  platform="${post.platform}"`);
    props.push(
      `  author={${JSON.stringify(post.author, null, 4).replace(/\n/g, "\n  ")}}`,
    );

    if (post.text) {
      props.push(`  text="${post.text.replace(/"/g, '\\"')}"`);
    }

    if (post.entities) {
      props.push(
        `  entities={${JSON.stringify(post.entities, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (post.media && post.media.length > 0) {
      props.push(
        `  media={${JSON.stringify(post.media, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (post.linkPreview) {
      props.push(
        `  linkPreview={${JSON.stringify(post.linkPreview, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (post.stats) {
      props.push(
        `  stats={${JSON.stringify(post.stats, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (post.actions && post.actions.length > 0) {
      props.push(
        `  actions={${JSON.stringify(post.actions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    if (post.createdAtISO) {
      props.push(`  createdAtISO="${post.createdAtISO}"`);
    }

    if (isLoading) {
      props.push(`  isLoading={true}`);
    }

    return `<SocialPost\n${props.join("\n")}\n/>`;
  };

  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const formatObject = (value: Record<string, unknown>) =>
    JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");

  const generateMediaCardCode = () => {
    if (!mediaCardConfig) return "";
    const card = mediaCardConfig.card;
    const props: string[] = [];

    props.push(`  id="${card.id}"`);
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

    if (list.minSelections && list.minSelections !== 1) {
      props.push(`  minSelections={${list.minSelections}}`);
    }

    if (list.maxSelections) {
      props.push(`  maxSelections={${list.maxSelections}}`);
    }

    if (optionListSelection) {
      const selectionValue = Array.isArray(optionListSelection)
        ? JSON.stringify(optionListSelection)
        : optionListSelection === null
          ? "null"
          : `"${optionListSelection}"`;
      props.push(`  value={${selectionValue}}`);
    }

    if (list.footerActions) {
      props.push(
        `  footerActions={${JSON.stringify(list.footerActions, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }

    props.push(
      `  onConfirm={(selection) => {\n    console.log("Selection:", selection);\n    // Handle selection here\n  }}`,
    );

    props.push(`  onCancel={() => {\n    // Handle cancel here\n  }}`);

    return `<OptionList\n${props.join("\n")}\n/>`;
  };

  const generateCode = () => {
    if (componentId === "data-table") {
      return generateDataTableCode();
    } else if (componentId === "social-post") {
      return generateSocialPostCode();
    } else if (componentId === "media-card") {
      return generateMediaCardCode();
    } else if (componentId === "option-list") {
      return generateOptionListCode();
    }
    return "";
  };

  const code = generateCode();

  return (
    <div className="relative mx-4 mt-12">
      <DynamicCodeBlock
        lang="tsx"
        code={code}
        codeblock={{
          "data-line-numbers": true,
          "data-line-numbers-start": 1,
        }}
      />
    </div>
  );
}
