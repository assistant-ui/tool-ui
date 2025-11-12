"use client";

import * as React from "react";
import {
  renderFormattedValue,
  type FormatConfig,
} from "@/components/data-table";

type Row = Record<
  string,
  string | number | boolean | null | (string | number | boolean | null)[]
>;

interface FormatSampleProps {
  title: string;
  value:
    | string
    | number
    | boolean
    | null
    | (string | number | boolean | null)[];
  format: FormatConfig;
  row?: Row;
  locale?: string;
  code?: string;
  note?: string;
}

function FormatSample({
  title,
  value,
  format,
  row,
  locale,
  code,
  note,
}: FormatSampleProps) {
  const output = React.useMemo(() => {
    return renderFormattedValue({ value, column: { format }, row, locale });
  }, [value, format, row, locale]);

  const codeSnippet = code ?? `format: ${JSON.stringify(format, null, 2)}`;
  const inputSnippet = JSON.stringify(value);

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="text-foreground mb-2 text-sm font-medium">{title}</div>
      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className="space-y-1">
          <div className="text-muted-foreground">Format</div>
          <pre className="bg-muted/40 overflow-auto rounded-md p-2 leading-relaxed">
            <code className="language-ts">{codeSnippet}</code>
          </pre>
          {note ? (
            <div className="text-muted-foreground mt-1">{note}</div>
          ) : null}
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-muted-foreground">Input value</div>
            <div className="font-mono">{inputSnippet}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Rendered</div>
            <div className="not-prose flex min-h-[32px] items-center gap-2">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormattingGallery() {
  const nowIso = "2025-01-05T12:00:00Z";

  return (
    <div className="not-prose grid grid-cols-1 gap-3">
      {/* number */}
      <FormatSample
        title="number (decimals, unit)"
        value={12345.678}
        format={{ kind: "number", decimals: 2, unit: " ms" }}
      />
      <FormatSample
        title="number (compact, showSign)"
        value={52430000}
        format={{ kind: "number", compact: true, showSign: true }}
      />

      {/* currency */}
      <FormatSample
        title="currency (USD)"
        value={178.25}
        format={{ kind: "currency", currency: "USD", decimals: 2 }}
      />

      {/* percent */}
      <FormatSample
        title="percent (fraction basis)"
        value={0.123}
        format={{
          kind: "percent",
          basis: "fraction",
          decimals: 1,
          showSign: true,
        }}
        note="0.123 → 12.3%"
      />
      <FormatSample
        title="percent (unit basis)"
        value={1.23}
        format={{ kind: "percent", basis: "unit", decimals: 2, showSign: true }}
        note="1.23 → 1.23%"
      />

      {/* delta */}
      <FormatSample
        title="delta (positive)"
        value={2.35}
        format={{
          kind: "delta",
          decimals: 2,
          upIsPositive: true,
          showSign: true,
        }}
      />
      <FormatSample
        title="delta (negative)"
        value={-1.2}
        format={{
          kind: "delta",
          decimals: 2,
          upIsPositive: true,
          showSign: true,
        }}
      />

      {/* date */}
      <FormatSample
        title="date (relative)"
        value={nowIso}
        format={{ kind: "date", dateFormat: "relative" }}
      />
      <FormatSample
        title="date (long, de-DE)"
        value={nowIso}
        format={{ kind: "date", dateFormat: "long" }}
        locale="de-DE"
      />

      {/* boolean */}
      <FormatSample
        title="boolean (custom labels)"
        value={true}
        format={{
          kind: "boolean",
          labels: { true: "Enabled", false: "Disabled" },
        }}
      />

      {/* link */}
      <FormatSample
        title="link (hrefKey)"
        value={"Docs Portal"}
        format={{ kind: "link", hrefKey: "url" }}
        row={{ url: "/docs" }}
      />
      <FormatSample
        title="link (external)"
        value={"https://example.com"}
        format={{ kind: "link", external: true }}
      />

      {/* badge */}
      <FormatSample
        title="badge (colorMap)"
        value={"in-progress"}
        format={{
          kind: "badge",
          colorMap: {
            open: "info",
            "in-progress": "warning",
            closed: "success",
            blocked: "danger",
          },
        }}
      />

      {/* status */}
      <FormatSample
        title="status (tone + label)"
        value={"high"}
        format={{
          kind: "status",
          statusMap: {
            high: { tone: "danger", label: "High" },
            medium: { tone: "warning", label: "Medium" },
            low: { tone: "neutral", label: "Low" },
          },
        }}
      />

      {/* array */}
      <FormatSample
        title="array (maxVisible)"
        value={["alpha", "beta", "gamma", "delta"]}
        format={{ kind: "array", maxVisible: 2 }}
      />
    </div>
  );
}

export function FormatInlineExample({
  value,
  format,
  row,
  locale,
  note,
  output,
}: {
  value:
    | string
    | number
    | boolean
    | null
    | (string | number | boolean | null)[];
  format?: FormatConfig;
  row?: Row;
  locale?: string;
  note?: string;
  output?: React.ReactNode;
}) {
  const rendered = React.useMemo(() => {
    if (output) return output;
    if (format)
      return renderFormattedValue({ value, column: { format }, row, locale });
    return String(value ?? "");
  }, [value, format, row, locale, output]);

  return (
    <div className="not-prose bg-card mt-2 rounded-md border p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <span className="text-muted-foreground">Input:</span>{" "}
          <code>{JSON.stringify(value)}</code>
        </div>
        <div>
          <span className="text-muted-foreground">Output:</span>{" "}
          <span className="inline-flex min-h-[20px] items-center gap-1 align-middle">
            {rendered}
          </span>
        </div>
      </div>
      {note ? (
        <div className="text-muted-foreground mt-2 text-[11px]">{note}</div>
      ) : null}
    </div>
  );
}
