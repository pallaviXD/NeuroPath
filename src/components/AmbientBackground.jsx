import { useReducedMotion } from "framer-motion";

export default function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Noise grid overlay */}
      <div className="noise-grid" />

      {/* Decorative colored glowing background orbs */}
      <div 
        className="fixed rounded-full filter blur-[80px] pointer-events-none z-0 mix-blend-screen"
        style={{
          width: "500px",
          height: "500px",
          background: "var(--pink)",
          top: "-100px",
          left: "-150px",
          opacity: shouldReduceMotion ? 0.15 : 0.45,
          transition: "opacity 0.5s ease",
        }}
      />
      <div 
        className="fixed rounded-full filter blur-[80px] pointer-events-none z-0 mix-blend-screen"
        style={{
          width: "560px",
          height: "560px",
          background: "var(--violet)",
          top: "40%",
          right: "-200px",
          opacity: shouldReduceMotion ? 0.15 : 0.45,
          transition: "opacity 0.5s ease",
        }}
      />
      <div 
        className="fixed rounded-full filter blur-[80px] pointer-events-none z-0 mix-blend-screen"
        style={{
          width: "420px",
          height: "420px",
          background: "var(--mint)",
          bottom: "-100px",
          left: "-180px",
          opacity: shouldReduceMotion ? 0.1 : 0.25,
          transition: "opacity 0.5s ease",
        }}
      />
    </>
  );
}
