import type {
  SerializableWeatherWidget,
  TimeOfDay,
  TemperatureUnit,
  EffectCategory,
} from "./schema";
import type { ActionsProp } from "../shared";

// ---------------------------------------------------------------------------
// UI State
// ---------------------------------------------------------------------------

export interface WeatherWidgetUIState {
  /** Currently selected day for detail view (date string) */
  selectedDay?: string;
  /** Whether the widget is in expanded/collapsed state */
  isExpanded?: boolean;
}

// ---------------------------------------------------------------------------
// Client Props (Behavior & Callbacks)
// ---------------------------------------------------------------------------

export interface WeatherWidgetClientProps {
  className?: string;
  maxWidth?: string;
  isLoading?: boolean;

  // Controlled/uncontrolled state
  state?: WeatherWidgetUIState;
  defaultState?: WeatherWidgetUIState;
  onStateChange?: (state: WeatherWidgetUIState) => void;

  // Callbacks
  onRefresh?: () => void | Promise<void>;
  onLocationChange?: (location: string) => void;

  // Footer actions
  footerActions?: ActionsProp;
  onFooterAction?: (actionId: string) => void | Promise<void>;
  onBeforeFooterAction?: (actionId: string) => boolean | Promise<boolean>;

  // Locale for date/time formatting
  locale?: string;

  // Effect intensity control
  effectIntensity?: "none" | "subtle" | "normal" | "intense";

  // Override time of day (for demo/preview purposes)
  overrideTimeOfDay?: TimeOfDay;
}

// ---------------------------------------------------------------------------
// Combined Props
// ---------------------------------------------------------------------------

export type WeatherWidgetProps = SerializableWeatherWidget &
  WeatherWidgetClientProps;

// ---------------------------------------------------------------------------
// Context Value
// ---------------------------------------------------------------------------

export interface WeatherWidgetContextValue {
  /** The serializable widget data */
  widget: SerializableWeatherWidget;
  /** Locale for formatting */
  locale: string;
  /** Current temperature unit */
  unit: TemperatureUnit;
  /** Current time of day (computed or overridden) */
  timeOfDay: TimeOfDay;
  /** Current effect category based on weather condition */
  effectCategory: EffectCategory;
  /** UI state */
  state: WeatherWidgetUIState;
  /** Update UI state */
  setState: (patch: Partial<WeatherWidgetUIState>) => void;
  /** Effect intensity */
  effectIntensity: "none" | "subtle" | "normal" | "intense";
  /** Event handlers */
  handlers: {
    onRefresh?: () => void | Promise<void>;
    onLocationChange?: (location: string) => void;
  };
}

// ---------------------------------------------------------------------------
// Effect Intensity Multipliers
// ---------------------------------------------------------------------------

export const EFFECT_INTENSITY_CONFIG = {
  none: {
    dropCount: 0,
    flakeCount: 0,
    rayCount: 0,
    cloudCount: 0,
    opacity: 0,
  },
  subtle: {
    dropCount: 20,
    flakeCount: 25,
    rayCount: 6,
    cloudCount: 4,
    opacity: 0.5,
  },
  normal: {
    dropCount: 40,
    flakeCount: 50,
    rayCount: 10,
    cloudCount: 6,
    opacity: 0.8,
  },
  intense: {
    dropCount: 60,
    flakeCount: 70,
    rayCount: 12,
    cloudCount: 8,
    opacity: 1,
  },
} as const;

// ---------------------------------------------------------------------------
// Time of Day Hour Ranges
// ---------------------------------------------------------------------------

export const TIME_OF_DAY_HOURS = {
  dawn: { start: 5, end: 7 },
  day: { start: 8, end: 17 },
  dusk: { start: 18, end: 20 },
  night: { start: 21, end: 4 },
} as const;

/**
 * Determines time of day from current hour (0-23)
 */
export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour <= 7) return "dawn";
  if (hour >= 8 && hour <= 17) return "day";
  if (hour >= 18 && hour <= 20) return "dusk";
  return "night";
}
