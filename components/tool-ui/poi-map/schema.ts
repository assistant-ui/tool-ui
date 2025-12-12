import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

export const POICategorySchema = z.enum([
  "restaurant",
  "cafe",
  "museum",
  "park",
  "shopping",
  "entertainment",
  "landmark",
  "transit",
  "other",
]);

export type POICategory = z.infer<typeof POICategorySchema>;

export const POISchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: POICategorySchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type POI = z.infer<typeof POISchema>;

export const MapCenterSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type MapCenter = z.infer<typeof MapCenterSchema>;

export const POIMapWidgetStateSchema = z.object({
  selectedPoiId: z.string().nullable(),
  favoriteIds: z.array(z.string()),
  mapCenter: MapCenterSchema,
  mapZoom: z.number().min(1).max(20),
  categoryFilter: POICategorySchema.nullable(),
});

export type POIMapWidgetState = z.infer<typeof POIMapWidgetStateSchema>;

export const POIMapPropsSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  pois: z.array(POISchema),
  initialCenter: MapCenterSchema.optional(),
  initialZoom: z.number().min(1).max(20).optional(),
  title: z.string().optional(),
});

export type POIMapProps = z.infer<typeof POIMapPropsSchema>;

export const SerializablePOIMapSchema = POIMapPropsSchema;
export type SerializablePOIMap = z.infer<typeof SerializablePOIMapSchema>;

export function parseSerializablePOIMap(input: unknown): SerializablePOIMap {
  return parseWithSchema(SerializablePOIMapSchema, input, "POIMap");
}

export const DEFAULT_CENTER: MapCenter = { lat: 37.7749, lng: -122.4194 };
export const DEFAULT_ZOOM = 12;

export const CATEGORY_LABELS: Record<POICategory, string> = {
  restaurant: "Restaurant",
  cafe: "Cafe",
  museum: "Museum",
  park: "Park",
  shopping: "Shopping",
  entertainment: "Entertainment",
  landmark: "Landmark",
  transit: "Transit",
  other: "Other",
};

export const CATEGORY_ICONS: Record<POICategory, string> = {
  restaurant: "utensils",
  cafe: "coffee",
  museum: "landmark",
  park: "tree",
  shopping: "shopping-bag",
  entertainment: "ticket",
  landmark: "mountain",
  transit: "train",
  other: "map-pin",
};
