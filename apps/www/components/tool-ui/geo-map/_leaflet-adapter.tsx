/**
 * Adapter: react-leaflet re-exports for copy-standalone portability.
 *
 * Leaflet reads `window` at module scope, so only modules that already live
 * behind the client-only boundary (the engine and its overlays) may import
 * from this file. The facade stays on `_adapter` and must never depend on it.
 *
 * When copying this component to another project, update these imports
 * to match your project's paths:
 *
 *   Leaflet → map primitives from react-leaflet
 */

export {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
