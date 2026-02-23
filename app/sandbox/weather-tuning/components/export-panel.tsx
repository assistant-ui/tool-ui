"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileCode } from "lucide-react";
import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";
import { hasAnyTuningDelta } from "../lib/has-any-tuning-delta";
import { listUpdatedParams } from "../lib/list-updated-params";

interface ExportPanelProps {
  checkpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >;
  signedOff: Set<WeatherConditionCode>;
  onApplied?: (
    checkpointOverrides: Partial<
      Record<WeatherConditionCode, CheckpointOverrides>
    >,
  ) => void;
  onRecovered?: (
    checkpointOverrides: Partial<
      Record<WeatherConditionCode, CheckpointOverrides>
    >,
  ) => void;
}

type ToastState = {
  tone: "success" | "error" | "info";
  title: string;
  detail?: string;
} | null;

export function ExportPanel({
  checkpointOverrides,
  signedOff,
  onApplied,
  onRecovered,
}: ExportPanelProps) {
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const canApply = hasAnyTuningDelta(checkpointOverrides);

  const handleRecover = async () => {
    setApplyError(null);
    try {
      const response = await fetch("/api/weather-tuning/recover");
      if (!response.ok) {
        const message = await response.text();
        setApplyError(message || "Failed to recover tuning.");
        return;
      }
      const payload = (await response.json()) as {
        checkpointOverrides?: Partial<
          Record<WeatherConditionCode, CheckpointOverrides>
        >;
      };
      if (!payload?.checkpointOverrides) {
        setApplyError("No recovered presets returned.");
        return;
      }
      onRecovered?.(payload.checkpointOverrides);
      setToast({
        tone: "info",
        title: "Recovered tuning from repo presets",
      });
    } catch (error) {
      console.error("Failed to recover tuning.", error);
      setApplyError("Failed to recover tuning.");
    }
  };

  const handleApply = async () => {
    if (!canApply) return;

    setApplyStatus("saving");
    setApplyError(null);
    try {
      const response = await fetch("/api/weather-tuning/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkpointOverrides,
          signedOff: Array.from(signedOff),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setApplyStatus("error");
        setApplyError(message || "Failed to apply export.");
        return;
      }

      const payload = (await response.json()) as {
        path?: string;
        checkpointOverrides?: Partial<
          Record<WeatherConditionCode, CheckpointOverrides>
        >;
      };
      const filePath =
        typeof payload?.path === "string"
          ? payload.path
          : "lib/weather-authoring/presets/tuned-presets.json";

      const updatedParams = listUpdatedParams(checkpointOverrides);
      const detail =
        updatedParams.length > 0
          ? `Updated params (${updatedParams.length}): ${updatedParams.join(", ")}`
          : "Updated params: none";

      setToast({
        tone: "success",
        title: `Applied tuning → ${filePath}`,
        detail,
      });
      setApplyStatus("success");
      try {
        if (payload?.checkpointOverrides) {
          onApplied?.(payload.checkpointOverrides);
        } else {
          onApplied?.({});
        }
      } catch (error) {
        console.error("onApplied() failed after apply.", error);
      }
      setTimeout(() => setApplyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to apply export.", error);
      setApplyStatus("error");
      setApplyError("Failed to apply export.");
      setToast({
        tone: "error",
        title: "Failed to apply tuning",
      });
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 7000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRecover}
          disabled={applyStatus === "saving"}
        >
          <FileCode className="size-4" />
          Recover from repo
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleApply}
          disabled={applyStatus === "saving" || !canApply}
        >
          <FileCode className="size-4" />
          {applyStatus === "saving"
            ? "Applying…"
            : applyStatus === "success"
              ? "Applied"
              : "Apply to repo"}
          {applyStatus === "success" && (
            <Check className="size-4 text-emerald-400" />
          )}
        </Button>
      </div>
      {applyError && (
        <span className="ml-2 text-xs text-red-500/80">{applyError}</span>
      )}
      {toast && (
        <div
          style={{ zIndex: 2147483647 }}
          className={`fixed bottom-6 right-6 z-50 max-h-56 max-w-[44rem] overflow-auto rounded-md border px-3 py-2 text-xs shadow-lg ${
            toast.tone === "success"
              ? "border-emerald-500/60 bg-emerald-950/95 text-emerald-50"
              : toast.tone === "error"
                ? "border-rose-500/60 bg-rose-950/95 text-rose-50"
                : "border-slate-500/60 bg-slate-900/95 text-slate-50"
          }`}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.detail && (
            <div className="mt-1 whitespace-pre-wrap opacity-95">
              {toast.detail}
            </div>
          )}
        </div>
      )}
    </>
  );
}
