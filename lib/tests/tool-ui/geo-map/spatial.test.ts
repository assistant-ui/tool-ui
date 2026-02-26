import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/tool-ui/geo-map/_adapter", () => ({
  CircleMarker: () => null,
  MapContainer: () => null,
  Marker: () => null,
  Polyline: () => null,
  TileLayer: () => null,
  ZoomControl: () => null,
  useMap: () => ({}),
  useMapEvents: () => ({}),
}));

vi.mock("@/components/tool-ui/geo-map/geo-map-icons", () => ({
  createClusterIcon: () => ({}),
  resolveMarkerIcon: () => null,
}));

vi.mock("@/components/tool-ui/geo-map/geo-map-overlays", () => ({
  GeoMapOverlays: () => null,
}));

import {
  collectFitPoints,
  getClustersForDatelineAwareBbox,
  resolveFitPointsWithFallback,
  splitDatelineBbox,
  toSafeExpansionZoom,
  type GeoMapClusterFeature,
} from "@/components/tool-ui/geo-map/geo-map-engine";

const markers = [
  { id: "m1", lat: 37.7749, lng: -122.4194 },
  { id: "m2", lat: 34.0522, lng: -118.2437 },
];

const routes = [
  {
    id: "r1",
    points: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7306, lng: -73.9352 },
    ],
  },
];

describe("geo-map spatial helpers", () => {
  test("collectFitPoints returns points based on target", () => {
    expect(collectFitPoints(markers, routes, "markers")).toEqual([
      [37.7749, -122.4194],
      [34.0522, -118.2437],
    ]);

    expect(collectFitPoints(markers, routes, "routes")).toEqual([
      [40.7128, -74.006],
      [40.7306, -73.9352],
    ]);

    expect(collectFitPoints(markers, routes, "all")).toEqual([
      [37.7749, -122.4194],
      [34.0522, -118.2437],
      [40.7128, -74.006],
      [40.7306, -73.9352],
    ]);
  });

  test("resolveFitPointsWithFallback falls back to markers when target has no points", () => {
    const points = resolveFitPointsWithFallback(markers, [], "routes");

    expect(points).toEqual([
      [37.7749, -122.4194],
      [34.0522, -118.2437],
    ]);
  });

  test("splitDatelineBbox returns one box when not crossing antimeridian", () => {
    expect(splitDatelineBbox([-130, 20, -100, 50])).toEqual([
      [-130, 20, -100, 50],
    ]);
  });

  test("splitDatelineBbox splits into two boxes when crossing antimeridian", () => {
    expect(splitDatelineBbox([170, -20, -170, 20])).toEqual([
      [170, -20, 180, 20],
      [-180, -20, -170, 20],
    ]);
  });

  test("getClustersForDatelineAwareBbox dedupes cluster and point features", () => {
    const featureA = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [1, 2] },
      properties: { cluster: true, cluster_id: 42, point_count: 4 },
      id: 42,
    } satisfies GeoMapClusterFeature;

    const featureB = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [10, 20] },
      properties: { cluster: false, markerId: "m1" },
      id: "m1",
    } satisfies GeoMapClusterFeature;

    const result = getClustersForDatelineAwareBbox(
      [170, -20, -170, 20],
      5,
      () => [featureA, featureB],
    );

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(featureA);
    expect(result).toContainEqual(featureB);
  });

  test("toSafeExpansionZoom clamps and normalizes zoom values", () => {
    expect(toSafeExpansionZoom(NaN)).toBe(2);
    expect(toSafeExpansionZoom(0)).toBe(1);
    expect(toSafeExpansionZoom(30)).toBe(22);
    expect(toSafeExpansionZoom(10.9)).toBe(11);
  });
});
