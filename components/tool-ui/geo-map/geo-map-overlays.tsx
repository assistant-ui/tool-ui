"use client";

import { useMemo, useState } from "react";

import { Popup, Tooltip, cn } from "./_adapter";

function GeoMapPopupContent({
  label,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: {
  label?: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {label && (
        <p
          className={cn(
            "block text-sm leading-tight font-semibold tracking-tight text-foreground",
            titleClassName,
          )}
        >
          {label}
        </p>
      )}
      {description && (
        <p
          className={cn(
            "block text-xs leading-relaxed text-muted-foreground",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function GeoMapTooltipContent({ text }: { text: string }) {
  return <span className="block">{text}</span>;
}

export function GeoMapOverlays({
  tooltipMode,
  tooltipContent,
  label,
  description,
  tooltipClassName,
  popupClassName,
  popupContentClassName,
  popupTitleClassName,
  popupDescriptionClassName,
}: {
  tooltipMode: "none" | "hover" | "always";
  tooltipContent?: string;
  label?: string;
  description?: string;
  tooltipClassName?: string;
  popupClassName?: string;
  popupContentClassName?: string;
  popupTitleClassName?: string;
  popupDescriptionClassName?: string;
}) {
  const hasPopup = Boolean(label || description);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const shouldRenderTooltip =
    tooltipMode !== "none" && tooltipContent && (!hasPopup || !isPopupOpen);
  const popupEventHandlers = useMemo(
    () => ({
      add: () => setIsPopupOpen(true),
      remove: () => setIsPopupOpen(false),
    }),
    [],
  );

  return (
    <>
      {shouldRenderTooltip && (
        <Tooltip
          direction="top"
          permanent={tooltipMode === "always"}
          className={cn("geo-map-tooltip", tooltipClassName)}
        >
          <GeoMapTooltipContent text={tooltipContent} />
        </Tooltip>
      )}
      {hasPopup && (
        <Popup
          className={cn("geo-map-popup", popupClassName)}
          closeButton
          closeOnEscapeKey
          minWidth={0}
          maxWidth={288}
          eventHandlers={popupEventHandlers}
        >
          <GeoMapPopupContent
            label={label}
            description={description}
            className={popupContentClassName}
            titleClassName={popupTitleClassName}
            descriptionClassName={popupDescriptionClassName}
          />
        </Popup>
      )}
    </>
  );
}
