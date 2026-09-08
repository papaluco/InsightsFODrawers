import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  COLOR_PRESETS,
  DEFAULT_INSIGHTS_PREFERENCES,
  InsightsColorScheme,
  InsightsColors,
  InsightsTrendSize,
} from '../constants/insightsColorPresets';

interface InsightsPreferencesState {
  scheme: InsightsColorScheme;
  colors: InsightsColors;
  trendIndicatorSize: InsightsTrendSize;
  setScheme: (scheme: InsightsColorScheme) => void;
  setColor: (key: keyof InsightsColors, hex: string) => void;
  setTrendIndicatorSize: (size: InsightsTrendSize) => void;
  selectCustomScheme: () => void;
  restoreDefaults: () => void;
}

const CUSTOM_SCHEME_RESET_COLOR = '#D1D5DB';

const CSS_VAR_BY_COLOR_KEY: Record<keyof InsightsColors, string> = {
  favorable: '--insights-favorable',
  unfavorable: '--insights-unfavorable',
  neutral: '--insights-neutral',
};

function hexToHslTriplet(hex: string): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = (g - b) / delta + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
  }

  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

function applyColorsToCssVars(colors: InsightsColors) {
  const root = document.documentElement;
  (Object.keys(CSS_VAR_BY_COLOR_KEY) as (keyof InsightsColors)[]).forEach((key) => {
    root.style.setProperty(CSS_VAR_BY_COLOR_KEY[key], hexToHslTriplet(colors[key]));
  });
}

export const useInsightsPreferencesStore = create<InsightsPreferencesState>()(
  persist(
    (set) => ({
      scheme: DEFAULT_INSIGHTS_PREFERENCES.scheme,
      colors: DEFAULT_INSIGHTS_PREFERENCES.colors,
      trendIndicatorSize: DEFAULT_INSIGHTS_PREFERENCES.trendIndicatorSize,

      setScheme: (scheme) =>
        set((state) => ({
          scheme,
          colors: scheme === 'custom' ? state.colors : COLOR_PRESETS[scheme],
        })),

      setColor: (key, hex) =>
        set((state) => ({
          scheme: 'custom',
          colors: { ...state.colors, [key]: hex },
        })),

      setTrendIndicatorSize: (size) => set({ trendIndicatorSize: size }),

      selectCustomScheme: () =>
        set({
          scheme: 'custom',
          colors: {
            favorable: CUSTOM_SCHEME_RESET_COLOR,
            unfavorable: CUSTOM_SCHEME_RESET_COLOR,
            neutral: CUSTOM_SCHEME_RESET_COLOR,
          },
        }),

      restoreDefaults: () =>
        set({
          scheme: DEFAULT_INSIGHTS_PREFERENCES.scheme,
          colors: DEFAULT_INSIGHTS_PREFERENCES.colors,
          trendIndicatorSize: DEFAULT_INSIGHTS_PREFERENCES.trendIndicatorSize,
        }),
    }),
    {
      name: 'insights-display-preferences',
      onRehydrateStorage: () => (state) => {
        if (state) applyColorsToCssVars(state.colors);
      },
    }
  )
);

// Keep --insights-favorable/-unfavorable/-neutral (the source Tailwind's
// insightsFavorable/insightsUnfavorable/insightsNeutral classes read from)
// in sync with the store: once for the initial/default state, again once
// persisted state finishes rehydrating, and on every change after that.
applyColorsToCssVars(useInsightsPreferencesStore.getState().colors);
useInsightsPreferencesStore.subscribe((state, prevState) => {
  if (state.colors !== prevState.colors) {
    applyColorsToCssVars(state.colors);
  }
});
