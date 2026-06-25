import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACCESSIBILITY_MODES = {
  STANDARD: "standard",
  CAPTIONS: "captions",
  SIGN: "sign",
  HIGH_CONTRAST: "highContrast",
};

export const FONT_SIZES = {
  NORMAL: "normal",
  LARGE: "large",
  LARGER: "larger",
};

export const useAccessibilityStore = create(
  persist(
    (set) => ({
      mode: ACCESSIBILITY_MODES.STANDARD,
      fontSize: FONT_SIZES.NORMAL,
      reducedMotion: false,
      signLanguage: "ISL",

      setMode: (mode) => set({ mode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSignLanguage: (signLanguage) => set({ signLanguage }),
      reset: () => set({
        mode: ACCESSIBILITY_MODES.STANDARD,
        fontSize: FONT_SIZES.NORMAL,
        reducedMotion: false,
        signLanguage: "ISL",
      }),
    }),
    {
      name: "neuropath-accessibility-settings",
    }
  )
);
