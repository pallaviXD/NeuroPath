import React, { useState } from "react";
import { Accessibility } from "lucide-react";
import { useAccessibilityStore, ACCESSIBILITY_MODES } from "../../store/useAccessibilityStore";
import AccessibilityCenter from "./AccessibilityCenter";

export default function AccessibilityToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const mode = useAccessibilityStore((state) => state.mode);

  const getButtonStyles = () => {
    switch (mode) {
      case ACCESSIBILITY_MODES.CAPTIONS:
        return "bg-accent-pink/15 border-accent-pink/40 text-accent-pinkLight hover:bg-accent-pink/25 shadow-[0_0_12px_rgba(255,29,126,0.2)]";
      case ACCESSIBILITY_MODES.SIGN:
        return "bg-accent-mint/15 border-accent-mint/40 text-accent-mint hover:bg-accent-mint/25 shadow-[0_0_12px_rgba(21,207,160,0.2)]";
      case ACCESSIBILITY_MODES.HIGH_CONTRAST:
        return "bg-accent-amber/15 border-accent-amber/40 text-accent-amber hover:bg-accent-amber/25 shadow-[0_0_12px_rgba(255,179,71,0.2)]";
      default:
        return "bg-white/[0.04] border-white/10 text-text-dim hover:text-text-primary hover:border-white/20 hover:bg-white/[0.07]";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2.5 rounded-full border cursor-pointer transition-all flex items-center justify-center ${getButtonStyles()}`}
        title="Open Accessibility Center"
      >
        <Accessibility size={16} />
      </button>

      <AccessibilityCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
