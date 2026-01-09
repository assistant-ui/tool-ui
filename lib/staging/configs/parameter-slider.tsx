"use client";

import { Fragment, type RefObject } from "react";
import type { StagingConfig, DebugLevel } from "../types";
import {
  RoundedRectOverlay,
  ThumbIndicator,
} from "@/app/staging/_components/rounded-rect-overlay";

interface SliderElementRects {
  label: DOMRect | null;
  value: DOMRect | null;
  thumb: DOMRect | null;
  track: DOMRect | null;
}

function getSliderElements(
  containerRef: RefObject<HTMLElement | null>,
): SliderElementRects[] {
  const container = containerRef.current;
  if (!container) return [];

  // Find the main parameter-slider article - it might be the container itself or a child
  const slider =
    container.getAttribute("data-slot") === "parameter-slider"
      ? container
      : container.querySelector('[data-slot="parameter-slider"]');

  if (!slider) return [];

  // Find all Radix slider root elements - they have the group/slider class and role=group
  // Radix adds data-orientation to the Root element
  const sliderRoots = slider.querySelectorAll('[data-orientation]');

  if (sliderRoots.length === 0) return [];

  return Array.from(sliderRoots).map((root) => {
    // Find the thumb (has role="slider")
    const thumb = root.querySelector('[role="slider"]');

    // The label/value overlay is the last div child of root (after Track and Thumb)
    // It contains 2 span children for label and value
    const divChildren = Array.from(root.children).filter(
      (child) => child.tagName === "DIV"
    );
    const overlayDiv = divChildren.find((div) => {
      const spans = div.querySelectorAll(":scope > span");
      return spans.length === 2;
    });

    let labelSpan: Element | null = null;
    let valueSpan: Element | null = null;

    if (overlayDiv) {
      const spans = overlayDiv.querySelectorAll(":scope > span");
      labelSpan = spans[0] ?? null;
      valueSpan = spans[1] ?? null;
    }

    return {
      label: labelSpan?.getBoundingClientRect() ?? null,
      value: valueSpan?.getBoundingClientRect() ?? null,
      thumb: thumb?.getBoundingClientRect() ?? null,
      track: root.getBoundingClientRect(),
    };
  });
}

function ParameterSliderDebugOverlay({
  level,
  componentRef,
}: {
  level: DebugLevel;
  componentRef: RefObject<HTMLElement | null>;
}) {
  const container = componentRef.current;
  if (!container) {
    return (
      <div className="absolute top-2 left-2 rounded bg-yellow-500/80 px-2 py-1 text-xs text-black">
        Debug: No container ref
      </div>
    );
  }

  const containerRect = container.getBoundingClientRect();
  const sliderElements = getSliderElements(componentRef);

  if (sliderElements.length === 0) {
    return (
      <div className="absolute top-2 left-2 rounded bg-red-500/80 px-2 py-1 text-xs text-white">
        Debug: No slider elements found in container
      </div>
    );
  }

  const hasLabels = sliderElements.some((el) => el.label !== null);
  const hasValues = sliderElements.some((el) => el.value !== null);
  const hasThumbs = sliderElements.some((el) => el.thumb !== null);

  return (
    <>
      <div className="absolute -top-6 right-0 flex gap-1 text-[10px]">
        <span className={`rounded px-1.5 py-0.5 ${hasLabels ? "bg-blue-500" : "bg-red-500"} text-white`}>
          L
        </span>
        <span className={`rounded px-1.5 py-0.5 ${hasValues ? "bg-green-500" : "bg-red-500"} text-white`}>
          V
        </span>
        <span className={`rounded px-1.5 py-0.5 ${hasThumbs ? "bg-orange-500" : "bg-red-500"} text-white`}>
          T
        </span>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5">
          {sliderElements.length}
        </span>
      </div>
      {sliderElements.map((row, index) => (
        <Fragment key={index}>
          {row.label && (
            <RoundedRectOverlay
              rect={row.label}
              containerRect={containerRect}
              padding={6}
              color="blue"
              showMargin={level === "margins" || level === "full"}
              marginSize={16}
              label={level === "full" ? "Label" : undefined}
            />
          )}

          {row.value && (
            <RoundedRectOverlay
              rect={row.value}
              containerRect={containerRect}
              padding={6}
              color="green"
              showMargin={level === "margins" || level === "full"}
              marginSize={16}
              label={level === "full" ? "Value" : undefined}
            />
          )}

          {level === "full" && row.thumb && (
            <ThumbIndicator rect={row.thumb} containerRect={containerRect} />
          )}
        </Fragment>
      ))}
    </>
  );
}

export const parameterSliderStagingConfig: StagingConfig = {
  supportedDebugLevels: ["off", "boundaries", "margins", "full"],
  renderDebugOverlay: ({ level, componentRef }) => (
    <ParameterSliderDebugOverlay level={level} componentRef={componentRef} />
  ),
};
