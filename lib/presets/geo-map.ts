import type { SerializableGeoMap } from "@/components/tool-ui/geo-map";
import type { PresetWithCodeGen } from "./types";

type GeoMapData = Omit<SerializableGeoMap, "id">;

export type GeoMapPresetName = "facility" | "fleet" | "focused";

function generateGeoMapCode(data: GeoMapData): string {
  const props: string[] = [];

  props.push(`  id="geo-map-example"`);

  if (data.title) {
    props.push(`  title="${data.title}"`);
  }

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  props.push(
    `  markers={${JSON.stringify(data.markers, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.routes && data.routes.length > 0) {
    props.push(
      `  routes={${JSON.stringify(data.routes, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.clustering) {
    props.push(
      `  clustering={${JSON.stringify(data.clustering, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.viewport) {
    props.push(
      `  viewport={${JSON.stringify(data.viewport, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.showZoomControl === false) {
    props.push(`  showZoomControl={false}`);
  }

  if (data.theme === "dark") {
    props.push(`  theme="${data.theme}"`);
  }

  return `<GeoMap\n${props.join("\n")}\n/>`;
}

export const geoMapPresets: Record<
  GeoMapPresetName,
  PresetWithCodeGen<GeoMapData>
> = {
  facility: {
    description: "Single facility location with details",
    data: {
      title: "Oakland Service Facility",
      description: "Primary maintenance and dispatch site",
      markers: [
        {
          id: "facility-oakland",
          lat: 37.8044,
          lng: -122.2711,
          label: "Oakland Facility",
          description: "Open 24/7. Heavy equipment maintenance.",
          tooltip: "always",
          icon: {
            type: "image",
            url: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=80&h=80&q=60",
            width: 30,
            height: 30,
            borderRadius: 10,
          },
        },
      ],
      viewport: {
        mode: "fit",
        maxZoom: 13,
      },
    } satisfies GeoMapData,
    generateExampleCode: generateGeoMapCode,
  },
  fleet: {
    description: "Clustered fleet with route overlays and custom icons",
    data: {
      title: "Fleet Positions",
      description: "Last telemetry update: 30s ago",
      markers: [
        {
          id: "truck-14",
          lat: 34.0522,
          lng: -118.2437,
          label: "Truck 14",
          description: "Delivery in progress",
          icon: { type: "emoji", value: "🚚", size: 24 },
        },
        {
          id: "truck-22",
          lat: 36.1699,
          lng: -115.1398,
          label: "Truck 22",
          description: "Awaiting dispatch",
          icon: { type: "emoji", value: "🚛", size: 24 },
        },
        {
          id: "truck-31",
          lat: 32.7157,
          lng: -117.1611,
          label: "Truck 31",
          description: "Returning to hub",
          icon: {
            type: "dot",
            color: "#0EA5E9",
            borderColor: "#0369A1",
            radius: 8,
          },
        },
        {
          id: "truck-42",
          lat: 34.041,
          lng: -118.257,
          label: "Truck 42",
          description: "Near downtown stop",
          icon: { type: "emoji", value: "📦", size: 22 },
        },
      ],
      routes: [
        {
          id: "route-west-14",
          label: "Truck 14 Route",
          points: [
            { lat: 33.94, lng: -118.4 },
            { lat: 34.012, lng: -118.32 },
            { lat: 34.0522, lng: -118.2437 },
          ],
          color: "#2563EB",
          weight: 4,
          opacity: 0.8,
        },
        {
          id: "route-west-31",
          label: "Truck 31 Route",
          points: [
            { lat: 32.73, lng: -117.2 },
            { lat: 32.721, lng: -117.18 },
            { lat: 32.7157, lng: -117.1611 },
          ],
          color: "#059669",
          dashArray: "8 4",
          weight: 3,
        },
      ],
      clustering: {
        enabled: true,
        radius: 55,
        minPoints: 2,
        maxZoom: 14,
      },
      viewport: {
        mode: "fit",
        padding: 40,
        maxZoom: 11,
        target: "all",
      },
    } satisfies GeoMapData,
    generateExampleCode: generateGeoMapCode,
  },
  focused: {
    description: "Fixed viewport with route-focused styling",
    data: {
      title: "Downtown Sensors",
      markers: [
        {
          id: "sensor-a1",
          lat: 40.7128,
          lng: -74.006,
          label: "Sensor A1",
          icon: {
            type: "dot",
            color: "#A855F7",
            borderColor: "#6D28D9",
            radius: 7,
          },
        },
        {
          id: "sensor-a2",
          lat: 40.7185,
          lng: -74.0021,
          label: "Sensor A2",
          icon: {
            type: "dot",
            color: "#A855F7",
            borderColor: "#6D28D9",
            radius: 7,
          },
        },
      ],
      routes: [
        {
          id: "inspection-loop",
          label: "Inspection Loop",
          points: [
            { lat: 40.7128, lng: -74.006 },
            { lat: 40.7161, lng: -74.0012 },
            { lat: 40.7185, lng: -74.0021 },
          ],
          color: "#7C3AED",
          weight: 3,
          opacity: 0.9,
        },
      ],
      viewport: {
        mode: "center",
        center: { lat: 40.715, lng: -74.0045 },
        zoom: 13,
      },
      showZoomControl: true,
    } satisfies GeoMapData,
    generateExampleCode: generateGeoMapCode,
  },
};
