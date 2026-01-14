"use client";

import * as React from "react";
import { useCallback } from "react";
import { CheckCircle, Package } from "lucide-react";
import { cn, Separator, Skeleton } from "./_adapter";
import type { OrderSummaryProps, OrderItem, Pricing } from "./schema";
import { ActionButtons } from "../shared";

const defaultActions = [
  { id: "cancel", label: "Cancel", variant: "outline" as const },
  { id: "confirm", label: "Purchase", variant: "default" as const },
];

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatQuantity(quantity: number): string {
  return quantity === 1 ? "" : `Qty: ${quantity}`;
}

function ItemImage({ src }: { src?: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (!src || hasError) {
    return (
      <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
        <Package className="text-muted-foreground h-5 w-5" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-12 w-12 shrink-0 rounded-md object-cover"
      onError={() => setHasError(true)}
    />
  );
}

function OrderItemRow({
  item,
  currency,
}: {
  item: OrderItem;
  currency: string;
}) {
  const quantity = item.quantity ?? 1;
  const quantityText = formatQuantity(quantity);
  const hasDescription = item.description || quantityText;
  const lineTotal = item.unitPrice * quantity;

  return (
    <div className="flex gap-3">
      <ItemImage src={item.imageUrl} />
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium">{item.name}</span>
            <span className="truncate text-sm tabular-nums">
              {formatCurrency(lineTotal, currency)}
            </span>
          </div>
          {hasDescription && (
            <div className="text-muted-foreground truncate text-sm">
              {[item.description, quantityText].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingBreakdown({
  pricing,
  className,
}: {
  pricing: Pricing;
  className?: string;
}) {
  const currency = pricing.currency ?? "USD";

  return (
    <dl className={cn("flex flex-col gap-2 text-sm", className)}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">
          {formatCurrency(pricing.subtotal, currency)}
        </dd>
      </div>

      {pricing.discount !== undefined && pricing.discount > 0 && (
        <div className="flex justify-between gap-4 text-green-600 dark:text-green-500">
          <dt>{pricing.discountLabel || "Discount"}</dt>
          <dd className="tabular-nums">
            -{formatCurrency(pricing.discount, currency)}
          </dd>
        </div>
      )}

      {pricing.shipping !== undefined && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">
            {pricing.shipping === 0
              ? "Free"
              : formatCurrency(pricing.shipping, currency)}
          </dd>
        </div>
      )}

      {pricing.tax !== undefined && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{pricing.taxLabel || "Tax"}</dt>
          <dd className="tabular-nums">
            {formatCurrency(pricing.tax, currency)}
          </dd>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <dt className="font-medium">Total</dt>
        <dd className="font-semibold tabular-nums">
          {formatCurrency(pricing.total, currency)}
        </dd>
      </div>
    </dl>
  );
}

function formatDate(isoString: string): string | undefined {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return undefined;
  }
}

function ReceiptBadge({
  orderId,
  confirmedAt,
}: {
  orderId?: string;
  confirmedAt?: string;
}) {
  const formattedDate = confirmedAt ? formatDate(confirmedAt) : undefined;

  const parts = [orderId && `#${orderId}`, formattedDate].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className="text-muted-foreground mt-1 text-sm">{parts.join(" · ")}</p>
  );
}

export function OrderSummary({
  id,
  title = "Order Summary",
  items,
  pricing,
  decision,
  className,
  isLoading = false,
  responseActions,
  onResponseAction,
}: OrderSummaryProps) {
  const titleId = `${id}-title`;
  const isReceipt = decision !== undefined;
  const actions = responseActions ?? defaultActions;

  const handleAction = useCallback(
    async (actionId: string) => {
      await onResponseAction?.(actionId);
    },
    [onResponseAction],
  );

  return (
    <article
      data-slot="order-summary"
      data-tool-ui-id={id}
      aria-labelledby={titleId}
      aria-busy={isLoading}
      className={cn("max-w-md min-w-80", className)}
    >
      <div
        className={cn(
          "text-card-foreground rounded-lg border shadow-sm",
          isReceipt ? "bg-card/60" : "bg-card",
          isLoading && "pointer-events-none opacity-70",
        )}
      >
        <div className={cn("space-y-4 p-4", isReceipt && "opacity-95")}>
          <div>
            <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold">
              {isReceipt && (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              )}
              {title}
            </h2>
            {isReceipt && (
              <ReceiptBadge
                orderId={decision.orderId}
                confirmedAt={decision.confirmedAt}
              />
            )}
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                currency={pricing.currency ?? "USD"}
              />
            ))}
          </div>

          <Separator />

          <PricingBreakdown pricing={pricing} />

          {!isReceipt && (
            <div className="@container/actions">
              <ActionButtons actions={actions} onAction={handleAction} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function OrderSummaryProgress({ className }: { className?: string }) {
  return (
    <div
      data-slot="order-summary-progress"
      aria-busy="true"
      className={cn("max-w-md min-w-80", className)}
    >
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="space-y-4 p-4">
          <Skeleton className="h-5 w-28" />

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-18" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
