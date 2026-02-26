import { describe, expect, test } from "vitest";

import {
  parseSerializableGeoMap,
  safeParseSerializableGeoMap,
} from "@/components/tool-ui/geo-map/schema";

describe("GeoMap schema", () => {
  test("parses a valid single-marker payload", () => {
    const parsed = parseSerializableGeoMap({
      id: "geo-map-store",
      title: "Store Location",
      markers: [{ id: "store-1", lat: 37.7749, lng: -122.4194 }],
    });

    expect(parsed.id).toBe("geo-map-store");
    expect(parsed.markers).toHaveLength(1);
  });

  test("supports multi-marker payloads", () => {
    const parsed = parseSerializableGeoMap({
      id: "geo-map-fleet",
      markers: [
        { id: "truck-1", lat: 34.0522, lng: -118.2437 },
        { id: "truck-2", lat: 36.1699, lng: -115.1398 },
      ],
    });

    expect(parsed.markers).toHaveLength(2);
  });

  test("rejects marker coordinates outside supported ranges", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-invalid-lat",
        markers: [{ lat: 90.1, lng: 10 }],
      }),
    ).toBeNull();

    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-invalid-lng",
        markers: [{ lat: 10, lng: 180.1 }],
      }),
    ).toBeNull();
  });

  test("rejects duplicate marker ids", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-duplicate-markers",
        markers: [
          { id: "asset-1", lat: 10, lng: 20 },
          { id: "asset-1", lat: 30, lng: 40 },
        ],
      }),
    ).toBeNull();
  });

  test("supports fit and center viewport modes", () => {
    const fit = safeParseSerializableGeoMap({
      id: "geo-map-fit",
      markers: [{ lat: 37.7749, lng: -122.4194 }],
      viewport: { mode: "fit", padding: 48, maxZoom: 12 },
    });
    expect(fit).not.toBeNull();

    const center = safeParseSerializableGeoMap({
      id: "geo-map-center",
      markers: [{ lat: 37.7749, lng: -122.4194 }],
      viewport: {
        mode: "center",
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 10,
      },
    });
    expect(center).not.toBeNull();
  });

  test("rejects center viewport when zoom is missing", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-center-missing-zoom",
        markers: [{ lat: 37.7749, lng: -122.4194 }],
        viewport: { mode: "center", center: { lat: 37.7749, lng: -122.4194 } },
      }),
    ).toBeNull();
  });

  test("accepts valid clustering config", () => {
    const parsed = safeParseSerializableGeoMap({
      id: "geo-map-clustered",
      markers: [
        { id: "a1", lat: 37.7749, lng: -122.4194 },
        { id: "a2", lat: 37.7751, lng: -122.4192 },
      ],
      clustering: {
        enabled: true,
        radius: 50,
        maxZoom: 14,
        minPoints: 3,
      },
    });

    expect(parsed).not.toBeNull();
  });

  test("accepts explicit light/dark themes and rejects auto theme", () => {
    const light = safeParseSerializableGeoMap({
      id: "geo-map-theme-light",
      markers: [{ lat: 37.7749, lng: -122.4194 }],
      theme: "light",
    });
    expect(light).not.toBeNull();

    const dark = safeParseSerializableGeoMap({
      id: "geo-map-theme-dark",
      markers: [{ lat: 37.7749, lng: -122.4194 }],
      theme: "dark",
    });
    expect(dark).not.toBeNull();

    const auto = safeParseSerializableGeoMap({
      id: "geo-map-theme-auto",
      markers: [{ lat: 37.7749, lng: -122.4194 }],
      theme: "auto",
    });
    expect(auto).toBeNull();
  });

  test("rejects invalid clustering ranges", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-bad-cluster-radius",
        markers: [{ lat: 37.7749, lng: -122.4194 }],
        clustering: { radius: 10 },
      }),
    ).toBeNull();

    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-bad-cluster-min-points",
        markers: [{ lat: 37.7749, lng: -122.4194 }],
        clustering: { minPoints: 1 },
      }),
    ).toBeNull();
  });

  test("accepts valid route payload and fit target", () => {
    const parsed = parseSerializableGeoMap({
      id: "geo-map-routes",
      markers: [{ id: "depot", lat: 37.7749, lng: -122.4194 }],
      routes: [
        {
          id: "route-1",
          points: [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.7849, lng: -122.4094 },
          ],
          color: "#2563EB",
          weight: 4,
          opacity: 0.75,
          dashArray: "6 4",
        },
      ],
      viewport: { mode: "fit", target: "all" },
    });

    expect(parsed.routes).toHaveLength(1);
  });

  test("rejects route with less than two points", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-invalid-route",
        markers: [{ lat: 37.7749, lng: -122.4194 }],
        routes: [
          {
            id: "route-1",
            points: [{ lat: 37.7749, lng: -122.4194 }],
          },
        ],
      }),
    ).toBeNull();
  });

  test("rejects duplicate route ids", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-duplicate-routes",
        markers: [{ lat: 37.7749, lng: -122.4194 }],
        routes: [
          {
            id: "route-1",
            points: [
              { lat: 37.7749, lng: -122.4194 },
              { lat: 37.7849, lng: -122.4094 },
            ],
          },
          {
            id: "route-1",
            points: [
              { lat: 37.7649, lng: -122.4294 },
              { lat: 37.7549, lng: -122.4394 },
            ],
          },
        ],
      }),
    ).toBeNull();
  });

  test("accepts supported marker icon variants", () => {
    const parsed = safeParseSerializableGeoMap({
      id: "geo-map-icons",
      markers: [
        {
          id: "dot",
          lat: 37.7749,
          lng: -122.4194,
          icon: {
            type: "dot",
            color: "#3B82F6",
            borderColor: "#1D4ED8",
            radius: 8,
          },
        },
        {
          id: "emoji",
          lat: 37.7849,
          lng: -122.4094,
          icon: { type: "emoji", value: "🚚", size: 24, bgColor: "#0F172A" },
        },
        {
          id: "image",
          lat: 37.7649,
          lng: -122.4294,
          icon: {
            type: "image",
            url: "https://cdn.example.com/truck.png",
            width: 28,
            height: 28,
            borderRadius: 14,
          },
        },
      ],
    });

    expect(parsed).not.toBeNull();
  });

  test("rejects invalid image icon protocol", () => {
    expect(
      safeParseSerializableGeoMap({
        id: "geo-map-invalid-image-icon",
        markers: [
          {
            id: "image",
            lat: 37.7749,
            lng: -122.4194,
            icon: {
              type: "image",
              url: "data:image/png;base64,AAA",
            },
          },
        ],
      }),
    ).toBeNull();
  });

  test("preserves backward compatibility for marker-only payloads", () => {
    const parsed = parseSerializableGeoMap({
      id: "geo-map-back-compat",
      markers: [{ id: "legacy-1", lat: 40.7128, lng: -74.006 }],
    });

    expect(parsed.markers).toHaveLength(1);
    expect(parsed.routes).toBeUndefined();
    expect(parsed.clustering).toBeUndefined();
  });

  test("ignores unknown presentational props from payloads", () => {
    const parsed = parseSerializableGeoMap({
      id: "geo-map-unknown-presentational",
      markers: [{ id: "legacy-1", lat: 40.7128, lng: -74.006 }],
      mapClassName: "should-be-stripped",
      overlayClassName: "should-be-stripped",
      popupContentClassName: "should-be-stripped",
    });

    expect(parsed).not.toHaveProperty("mapClassName");
    expect(parsed).not.toHaveProperty("overlayClassName");
    expect(parsed).not.toHaveProperty("popupContentClassName");
  });
});
