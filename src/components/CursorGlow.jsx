import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion is preferred, disable high-frequency mouse glow updates
    if (shouldReduceMotion) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        setPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        if (!isVisible) setIsVisible(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [shouldReduceMotion, isVisible]);

  if (shouldReduceMotion) return null;

  return (
    <div
      className="fixed pointer-events-none z-10 w-[520px] h-[520px] rounded-full -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-out hidden md:block"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isVisible ? 1 : 0,
        background: "radial-gradient(circle, rgba(255, 29, 126, 0.12), rgba(123, 47, 247, 0.06) 45%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
