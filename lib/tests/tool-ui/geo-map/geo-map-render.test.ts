// @vitest-environment jsdom

import { act, render, waitFor } from "@testing-library/react";
import { createElement, type ComponentProps, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { GeoMap } from "@/components/tool-ui/geo-map";

type MockMapEvents = {
  moveend?: () => void;
  zoomend?: () => void;
};

let mockMapEvents: MockMapEvents = {};
let setViewCallCount = 0;
let useUnstableMapReference = false;
const popupPropsSpy = vi.fn();
const tooltipPropsSpy = vi.fn();
const tileLayerPropsSpy = vi.fn();
const markerPropsSpy = vi.fn();
const polylinePropsSpy = vi.fn();
const mapContainerPropsSpy = vi.fn();
const mapContainerAttributeSpy = vi.fn();

const mockMap = {
  closePopup: vi.fn(),
  getContainer: vi.fn(() => ({
    setAttribute: mapContainerAttributeSpy,
  })),
  getBounds: vi.fn(() => ({
    getWest: () => -122.5,
    getSouth: () => 37.7,
    getEast: () => -122.3,
    getNorth: () => 37.9,
  })),
  getZoom: vi.fn(() => 12),
  setView: vi.fn(() => {
    setViewCallCount += 1;
    if (setViewCallCount > 5) {
      throw new Error("viewport-loop-detected");
    }
    mockMapEvents.moveend?.();
  }),
  fitBounds: vi.fn(() => {
    mockMapEvents.moveend?.();
  }),
  flyTo: vi.fn(),
};

function DivWrapper({
  children,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode }) {
  return createElement("div", props, children);
}

function LeafletWrapper({
  children,
}: ComponentProps<"div"> & { children?: ReactNode }) {
  return createElement("div", null, children);
}

function PopupWrapper({
  children,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode }) {
  popupPropsSpy(props);
  return createElement("div", { className: props.className }, children);
}

function TooltipWrapper({
  children,
  ...props
}: ComponentProps<"div"> & { children?: ReactNode }) {
  tooltipPropsSpy(props);
  return createElement("div", { className: props.className }, children);
}

vi.mock("@/lib/utils", () => ({
  cn: (...classes: Array<string | undefined | false | null>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("@/components/ui/card", () => ({
  Card: DivWrapper,
  CardContent: DivWrapper,
  CardDescription: DivWrapper,
  CardHeader: DivWrapper,
  CardTitle: DivWrapper,
}));

vi.mock("leaflet", () => ({
  divIcon: vi.fn(() => ({})),
  latLngBounds: vi.fn(() => ({})),
}));

vi.mock("react-leaflet", () => ({
  CircleMarker: LeafletWrapper,
  MapContainer: ({
    children,
    ...props
  }: ComponentProps<"div"> & { children?: ReactNode }) => {
    mapContainerPropsSpy(props);
    return createElement(
      "div",
      {
        className: props.className,
        role: props.role,
        "aria-label": props["aria-label"],
      },
      children,
    );
  },
  Marker: ({
    children,
    ...props
  }: ComponentProps<"div"> & { children?: ReactNode }) => {
    markerPropsSpy(props);
    return createElement("div", null, children);
  },
  Polyline: ({
    children,
    ...props
  }: ComponentProps<"div"> & { children?: ReactNode }) => {
    polylinePropsSpy(props);
    return createElement("div", null, children);
  },
  Popup: PopupWrapper,
  TileLayer: (props: unknown) => {
    tileLayerPropsSpy(props);
    return null;
  },
  Tooltip: TooltipWrapper,
  ZoomControl: () => null,
  useMap: () => (useUnstableMapReference ? { ...mockMap } : mockMap),
  useMapEvents: (events: MockMapEvents) => {
    mockMapEvents = events;
    return mockMap;
  },
}));

describe("GeoMap render behavior", () => {
  beforeEach(() => {
    mockMapEvents = {};
    setViewCallCount = 0;
    useUnstableMapReference = false;
    mockMap.setView.mockClear();
    mockMap.fitBounds.mockClear();
    mockMap.flyTo.mockClear();
    mockMap.closePopup.mockClear();
    mockMap.getContainer.mockClear();
    mockMap.getBounds.mockClear();
    mockMap.getZoom.mockClear();
    popupPropsSpy.mockClear();
    tooltipPropsSpy.mockClear();
    tileLayerPropsSpy.mockClear();
    markerPropsSpy.mockClear();
    polylinePropsSpy.mockClear();
    mapContainerPropsSpy.mockClear();
    mapContainerAttributeSpy.mockClear();

    vi.stubGlobal(
      "MutationObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("does not repeatedly re-apply viewport when routes are omitted", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-loop-regression",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        viewport: { mode: "fit", maxZoom: 12 },
      }),
    );

    await waitFor(() => {
      expect(mockMap.setView).toHaveBeenCalledTimes(1);
    });
    expect(mockMap.fitBounds).toHaveBeenCalledTimes(0);
  });

  test("renders a simple loading shell until the map engine is ready", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-loading-shell",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
      }),
    );

    expect(
      document.querySelector('[data-slot="geo-map-loading"]'),
    ).not.toBeNull();

    await waitFor(() => {
      expect(tileLayerPropsSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="geo-map-loading"]'),
      ).toBeNull();
    });
  });

  test("does not loop when useMap reference identity changes between renders", async () => {
    useUnstableMapReference = true;

    render(
      createElement(GeoMap, {
        id: "geo-map-map-ref-loop-regression",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        viewport: { mode: "fit", maxZoom: 12 },
      }),
    );

    await waitFor(() => {
      expect(mockMap.setView).toHaveBeenCalled();
    });
    expect(mockMap.setView.mock.calls.length).toBeLessThanOrEqual(2);
    expect(mockMap.fitBounds).toHaveBeenCalledTimes(0);
  });

  test("applies the geo-map popup class for deterministic shell styling", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-popup-class",
        markers: [
          {
            id: "truck-31",
            lat: 32.7157,
            lng: -117.1611,
            label: "Truck 31",
            description: "Returning to hub",
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(popupPropsSpy).toHaveBeenCalled();
    });
    const popupProps = popupPropsSpy.mock.calls[0]?.[0];
    expect(popupProps.className).toContain("geo-map-popup");
  });

  test("keeps popup keyboard dismissible and exposes a close button", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-popup-a11y",
        markers: [
          {
            id: "truck-31",
            lat: 32.7157,
            lng: -117.1611,
            label: "Truck 31",
            description: "Returning to hub",
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(popupPropsSpy).toHaveBeenCalled();
    });

    const popupProps = popupPropsSpy.mock.calls[0]?.[0] as
      | { closeButton?: boolean; closeOnEscapeKey?: boolean }
      | undefined;
    expect(popupProps?.closeButton).toBe(true);
    expect(popupProps?.closeOnEscapeKey).toBe(true);
  });

  test("announces map region with an accessible label", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-map-aria",
        title: "Fleet Positions",
        description: "Last telemetry update: 30s ago",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
      }),
    );

    await waitFor(() => {
      expect(mapContainerPropsSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockMap.getContainer).toHaveBeenCalled();
    });
    expect(mapContainerAttributeSpy).toHaveBeenCalledWith("role", "region");
    expect(mapContainerAttributeSpy).toHaveBeenCalledWith(
      "aria-label",
      "Fleet Positions. Last telemetry update: 30s ago",
    );
  });

  test("adds descriptive marker title and alt text with label and description", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-marker-aria",
        markers: [
          {
            id: "truck-31",
            lat: 32.7157,
            lng: -117.1611,
            label: "Truck 31",
            description: "Returning to hub",
            icon: { type: "emoji", value: "🚚" },
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(markerPropsSpy).toHaveBeenCalled();
    });

    const markerProps = markerPropsSpy.mock.calls[0]?.[0] as
      | { title?: string; alt?: string }
      | undefined;
    expect(markerProps?.title).toBe("Truck 31. Returning to hub");
    expect(markerProps?.alt).toBe("Truck 31. Returning to hub");
  });

  test("closes popups when escape is pressed", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-popup-escape-close",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
      }),
    );

    await waitFor(() => {
      expect(mockMap.getContainer).toHaveBeenCalled();
    });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
        }),
      );
    });

    expect(mockMap.closePopup).toHaveBeenCalledTimes(1);
  });

  test("calls route click callback from polyline interactions", async () => {
    const onRouteClick = vi.fn();

    render(
      createElement(GeoMap, {
        id: "geo-map-route-click",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        routes: [
          {
            id: "route-1",
            points: [
              { lat: 32.7157, lng: -117.1611 },
              { lat: 32.7357, lng: -117.1411 },
            ],
          },
        ],
        onRouteClick,
      }),
    );

    await waitFor(() => {
      expect(polylinePropsSpy).toHaveBeenCalled();
    });

    const routeProps = polylinePropsSpy.mock.calls[0]?.[0] as
      | { eventHandlers?: { click?: () => void } }
      | undefined;

    act(() => {
      routeProps?.eventHandlers?.click?.();
    });

    expect(onRouteClick).toHaveBeenCalledTimes(1);
  });

  test("expands cluster markers by flying to cluster zoom", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-cluster-expand",
        markers: [
          { id: "cluster-a", lat: 37.7749, lng: -122.4194 },
          { id: "cluster-b", lat: 37.775, lng: -122.4195 },
        ],
        clustering: { enabled: true, minPoints: 2 },
      }),
    );

    await waitFor(() => {
      expect(markerPropsSpy).toHaveBeenCalled();
    });

    const clusterMarkerProps = markerPropsSpy.mock.calls
      .map(
        (call) =>
          call[0] as { title?: string; eventHandlers?: { click?: () => void } },
      )
      .find(
        (props) =>
          typeof props.title === "string" &&
          props.title.startsWith("Cluster containing"),
      );

    expect(clusterMarkerProps).toBeDefined();
    act(() => {
      clusterMarkerProps?.eventHandlers?.click?.();
    });

    expect(mockMap.flyTo).toHaveBeenCalledTimes(1);
  });

  test("accepts css variable overrides for popup and tooltip shell theming", () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-token-overrides",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        style: {
          "--geo-map-popup-bg": "var(--card)",
          "--geo-map-popup-fg": "var(--card-foreground)",
          "--geo-map-tooltip-bg": "var(--accent)",
        },
      }),
    );

    const root = document.querySelector(
      '[data-tool-ui-id="geo-map-token-overrides"]',
    ) as HTMLElement | null;

    expect(root).not.toBeNull();
    expect(root?.style.getPropertyValue("--geo-map-popup-bg")).toBe(
      "var(--card)",
    );
    expect(root?.style.getPropertyValue("--geo-map-popup-fg")).toBe(
      "var(--card-foreground)",
    );
    expect(root?.style.getPropertyValue("--geo-map-tooltip-bg")).toBe(
      "var(--accent)",
    );
  });

  test("does not inject runtime style tags for shell styles", () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-zoom-controls-style",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
      }),
    );

    const root = document.querySelector(
      '[data-tool-ui-id="geo-map-zoom-controls-style"]',
    ) as HTMLElement | null;
    expect(root?.querySelector("style")).toBeNull();
    expect(root?.getAttribute("data-slot")).toBe("geo-map");
  });

  test("hides tooltip while popup is open", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-tooltip-popup-interaction",
        markers: [
          {
            id: "truck-31",
            lat: 32.7157,
            lng: -117.1611,
            label: "Truck 31",
            description: "Returning to hub",
            tooltip: "always",
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(popupPropsSpy).toHaveBeenCalled();
      expect(tooltipPropsSpy).toHaveBeenCalled();
    });

    const popupProps = popupPropsSpy.mock.calls[0]?.[0] as
      | {
          eventHandlers?: {
            add?: () => void;
            remove?: () => void;
          };
        }
      | undefined;

    expect(document.querySelector(".geo-map-tooltip")).not.toBeNull();
    expect(popupProps?.eventHandlers?.add).toBeTypeOf("function");
    expect(popupProps?.eventHandlers?.remove).toBeTypeOf("function");

    act(() => {
      popupProps?.eventHandlers?.add?.();
    });

    await waitFor(() => {
      expect(document.querySelector(".geo-map-tooltip")).toBeNull();
    });

    act(() => {
      popupProps?.eventHandlers?.remove?.();
    });

    await waitFor(() => {
      expect(document.querySelector(".geo-map-tooltip")).not.toBeNull();
    });
  });

  test("uses light tiles by default when no theme is provided", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-default-theme",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
      }),
    );

    await waitFor(() => {
      expect(tileLayerPropsSpy).toHaveBeenCalled();
    });

    const firstTileLayerProps = tileLayerPropsSpy.mock.calls[0]?.[0] as
      | { url?: string }
      | undefined;
    expect(firstTileLayerProps?.url).toContain("light_all");
  });

  test("uses dark tiles when theme is explicitly dark", async () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-dark-theme",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        theme: "dark",
      }),
    );

    await waitFor(() => {
      expect(tileLayerPropsSpy).toHaveBeenCalled();
    });

    const firstTileLayerProps = tileLayerPropsSpy.mock.calls[0]?.[0] as
      | { url?: string }
      | undefined;
    expect(firstTileLayerProps?.url).toContain("dark_all");
  });

  test("sets a dark map canvas fallback background token in dark theme", () => {
    render(
      createElement(GeoMap, {
        id: "geo-map-dark-canvas-fallback",
        markers: [{ id: "truck-31", lat: 32.7157, lng: -117.1611 }],
        theme: "dark",
      }),
    );

    const root = document.querySelector(
      '[data-tool-ui-id="geo-map-dark-canvas-fallback"]',
    ) as HTMLElement | null;
    expect(root).not.toBeNull();
    expect(root?.style.getPropertyValue("--geo-map-canvas-bg")).toBe(
      "var(--background)",
    );
  });
});
