import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, Eye, BookOpen, Hand, BarChart2, Shield, ChevronDown, Play, Users, Star, Globe, GraduationCap, LayoutDashboard, Home, Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { HeroGeometric } from "../components/ui/shape-landing-hero";
import ModalityCompare from "../components/ModalityCompare";
// ─── Floating particle field ───────────────────────────────────────────────
function ParticleField() {
  const particles = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      color: i % 3 === 0 ? "#FF1D7E" : i % 3 === 1 ? "#7B2FF7" : "#15CFA0",
      opacity: Math.random() * 0.5 + 0.1,
    }))
  ).current;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            filter: `blur(${p.size > 2 ? 1 : 0}px)`,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, Math.random() * 60 - 30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Magnetic cursor orb ──────────────────────────────────────────────────
function MagneticOrb() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 18 });
  const springY = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[1] hidden md:block"
      style={{ left: springX, top: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <div className="w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,29,126,0.08) 0%, rgba(123,47,247,0.04) 40%, transparent 70%)" }}
      />
    </motion.div>
  );
}

// ─── Animated stat counter ────────────────────────────────────────────────
function StatCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    const end = parseInt(value); if (!end) return;
    const start = performance.now();
    const dur = 1800;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * end));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(end);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <span ref={ref} className="font-display font-black text-4xl md:text-5xl text-text-primary">
      {inView ? count : 0}{suffix}
    </span>
  );
}

// ─── Glowing text badge ───────────────────────────────────────────────────
function Badge({ children, color = "pink" }) {
  const colors = {
    pink: "text-accent-pinkLight bg-accent-pink/10 border-accent-pink/30",
    mint: "text-accent-mint bg-accent-mint/10 border-accent-mint/30",
    violet: "text-accent-violetLight bg-accent-violet/10 border-accent-violet/30",
    amber: "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-[0.12em] border px-3 py-1 rounded-full uppercase ${colors[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color === "pink" ? "bg-accent-pink" : color === "mint" ? "bg-accent-mint" : color === "violet" ? "bg-accent-violetLight" : "bg-accent-amber"} shadow-[0_0_6px_currentColor] animate-pulse-dot`} />
      {children}
    </span>
  );
}

// ─── Floating feature card (draggable) ───────────────────────────────────
function FloatingCard({ children, className = "", initialX = 0, initialY = 0, delay = 0 }) {
  return (
    <motion.div
      className={`absolute glass-panel rounded-2xl p-4 border border-white/10 backdrop-blur-xl cursor-grab active:cursor-grabbing ${className}`}
      initial={{ opacity: 0, y: initialY, x: initialX, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      drag
      dragConstraints={{ top: -80, bottom: 80, left: -80, right: 80 }}
      dragElastic={0.3}
      whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0 30px 60px rgba(255,29,126,0.3)" }}
      whileHover={{ scale: 1.03, borderColor: "rgba(255,29,126,0.4)" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Modality card (for hero scene) ──────────────────────────────────────
const modalityCards = [
  { icon: "📊", label: "Visual Diagram", color: "#FF1D7E", desc: "Color-coded force vectors" },
  { icon: "📖", label: "Story Mode", color: "#FFB347", desc: "Newton meets an asteroid" },
  { icon: "🧪", label: "Simulation", color: "#7B2FF7", desc: "Push/pull sandbox" },
  { icon: "🤟", label: "Sign Language", color: "#15CFA0", desc: "3D avatar inline" },
];

// ─── Live fingerprint widget ──────────────────────────────────────────────
function FingerprintWidget() {
  const [bars, setBars] = useState({ visual: 0, narrative: 0, kinesthetic: 0, sign: 0 });
  const [done, setDone] = useState(false);
  useEffect(() => {
    const target = { visual: 82, narrative: 34, kinesthetic: 51, sign: 22 };
    const start = performance.now();
    const dur = 3000;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      setBars({
        visual: Math.round(target.visual * ease),
        narrative: Math.round(target.narrative * ease),
        kinesthetic: Math.round(target.kinesthetic * ease),
        sign: Math.round(target.sign * ease),
      });
      if (p < 1) requestAnimationFrame(tick);
      else setDone(true);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 800);
    return () => clearTimeout(t);
  }, []);

  const barDefs = [
    { key: "visual", label: "Visual", color: "#FF1D7E" },
    { key: "narrative", label: "Narrative", color: "#FFB347" },
    { key: "kinesthetic", label: "Kinesthetic", color: "#7B2FF7" },
    { key: "sign", label: "Sign Language", color: "#15CFA0" },
  ];

  return (
    <div className="space-y-3">
      {barDefs.map((b) => (
        <div key={b.key}>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-text-dim">{b.label}</span>
            <span className="font-bold" style={{ color: b.color }}>{bars[b.key]}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: b.color }}
              initial={{ width: 0 }}
              animate={{ width: `${bars[b.key]}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[10px] text-text-faint uppercase">Profile locked</span>
            <span className="font-display font-bold text-sm text-accent-pinkLight">Visual · 82%</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Landing component ───────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const [pipeStep, setPipeStep] = useState(0);
  const [hoveredRole, setHoveredRole] = useState(null);

  // Pipeline cycle
  useEffect(() => {
    const t = setInterval(() => setPipeStep((p) => (p + 1) % 5), 1600);
    return () => clearInterval(t);
  }, []);

  // Role-based navigation after login
  const goToDashboard = () => {
    if (!user) { navigate("/login"); return; }
    if (user.role === "teacher" || user.role === "admin") navigate("/dashboard");
    else if (user.role === "parent") navigate("/parent");
    else navigate("/onboarding");
  };

  const roles = [
    { id: "student", icon: GraduationCap, label: "Student", desc: "Adaptive lessons built around how you learn", color: "pink", cta: "Start Learning", path: user ? "/onboarding" : "/signup?role=student" },
    { id: "teacher", icon: LayoutDashboard, label: "Teacher", desc: "Real-time dashboard for your whole classroom", color: "violet", cta: "Open Dashboard", path: user ? "/dashboard" : "/signup?role=teacher" },
    { id: "parent", icon: Home, label: "Parent", desc: "Weekly digest of your child's progress", color: "mint", cta: "View Portal", path: user ? "/parent" : "/signup?role=parent" },
    { id: "admin", icon: Settings, label: "Admin", desc: "District-wide rollout and compliance console", color: "amber", cta: "Admin Console", path: user ? "/dashboard" : "/signup?role=admin" },
  ];

  const pipeSteps = [
    { icon: "👁️", title: "Confusion Signal", sub: "re-read · pause · wrong answer" },
    { icon: "🧬", title: "Profile Queried", sub: "visual / narrative / sign / kinesthetic" },
    { icon: "✍️", title: "Content Generated", sub: "LLM transforms explanation" },
    { icon: "🌐", title: "Gloss Translated", sub: "text → sign tokens for Deaf students" },
    { icon: "✨", title: "Delivered Inline", sub: "no redirect, lesson continues" },
  ];

  const features = [
    { icon: Brain, title: "Cognitive Fingerprinting", desc: "Silent 2-minute calibration infers your learning style from speed, accuracy, and effort — no self-report surveys.", color: "pink", stat: "2 min" },
    { icon: Zap, title: "Instant Struggle Detection", desc: "Re-read, long pause, wrong-then-right — the system catches confusion before you even know you're lost.", color: "violet", stat: "<1s response" },
    { icon: Hand, title: "Native Sign Language", desc: "3D signing avatar with SgSL gloss sequencing (Unmute-style). First-class delivery format — not captions.", color: "mint", stat: "SgSL" },
    { icon: BarChart2, title: "Teacher Command Panel", desc: "Live classroom heatmap, modality distribution, intervention history, and per-student deep dive.", color: "amber", stat: "24 students" },
    { icon: Globe, title: "Language-Agnostic Engine", desc: "Adaptive logic works regardless of first language. One curriculum, infinite delivery formats.", color: "pink", stat: "Any language" },
    { icon: Shield, title: "Privacy by Design", desc: "Behavioral telemetry stays internal. No clinical diagnosis — only learning-format preferences. FERPA/COPPA/GDPR-K aligned.", color: "mint", stat: "Private" },
  ];

  return (
    <div ref={containerRef} className="w-full min-h-screen flex flex-col bg-dark-bg overflow-x-hidden">
      <ParticleField />
      <MagneticOrb />

      {/* ════════════════ HERO ════════════════ */}
      <HeroGeometric 
        badge="AI-Native Adaptive Learning" 
        title1="The tutor that" 
        title2="learns how you learn." 
        description="NeuroPath watches how you interact with a concept — hover, scroll, pause, re-read — and silently builds your cognitive profile. Then every lesson reshapes itself into the format your brain actually understands."
      />

      {/* ════════════════ WHO IS THIS FOR ════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <Badge color="violet">Who it's for</Badge>
            <h2 className="font-display font-black text-4xl md:text-6xl mt-4 mb-4 leading-tight">
              One platform.<br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50">Four different doors.</span>
            </h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">
              Every role gets a purpose-built experience — not a stripped-down version of the same thing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((role, i) => {
              const colorMap = {
                pink: { hoverBorder: "hover:border-accent-pink/50", iconBg: "bg-accent-pink/10 border-accent-pink/30", iconText: "text-accent-pink", orb: "bg-accent-pink/20", glow: "hover:shadow-[0_0_40px_-10px_rgba(255,29,126,0.3)]" },
                violet: { hoverBorder: "hover:border-accent-violet/50", iconBg: "bg-accent-violet/10 border-accent-violet/30", iconText: "text-accent-violetLight", orb: "bg-accent-violet/20", glow: "hover:shadow-[0_0_40px_-10px_rgba(123,47,247,0.3)]" },
                mint: { hoverBorder: "hover:border-accent-mint/50", iconBg: "bg-accent-mint/10 border-accent-mint/30", iconText: "text-accent-mint", orb: "bg-accent-mint/20", glow: "hover:shadow-[0_0_40px_-10px_rgba(21,207,160,0.3)]" },
                amber: { hoverBorder: "hover:border-accent-amber/50", iconBg: "bg-accent-amber/10 border-accent-amber/30", iconText: "text-accent-amber", orb: "bg-accent-amber/20", glow: "hover:shadow-[0_0_40px_-10px_rgba(255,179,71,0.3)]" },
              };
              const c = colorMap[role.color];
              const IconComponent = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4 }}
                  onHoverStart={() => setHoveredRole(role.id)}
                  onHoverEnd={() => setHoveredRole(null)}
                  className={`bg-dark-card/30 backdrop-blur-md rounded-2xl p-6 border border-white/5 ${c.hoverBorder} ${c.glow} transition-all duration-300 flex flex-col relative overflow-hidden group cursor-pointer shadow-lg`}
                  onClick={() => navigate(role.path)}
                >
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${c.orb} blur-3xl transition-all duration-500 ${hoveredRole === role.id ? "opacity-60 scale-110" : "opacity-0 scale-90"}`} />
                  
                  {/* Subtle noise/glitter texture overlay on hover */}
                  <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500`} />

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 border ${c.iconBg} ${c.iconText} relative z-10 transition-colors shadow-[0_0_15px_currentColor] group-hover:shadow-[0_0_25px_currentColor]`}>
                    <IconComponent size={20} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2 relative z-10">{role.label}</h3>
                  <p className="text-white/40 text-sm leading-relaxed flex-1 mb-8 relative z-10 font-light group-hover:text-white/60 transition-colors">{role.desc}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 rounded-lg border border-white/10 ${c.hoverBorder} bg-white/5 hover:bg-white/10 text-white/80 hover:${c.iconText} font-medium text-sm flex items-center justify-center gap-2 relative z-10 transition-all`}
                    onClick={(e) => { e.stopPropagation(); navigate(role.path); }}
                  >
                    {role.cta} <ArrowRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ A/B MODALITY PROOF ════════════════ */}
      <section className="relative z-10 py-20 px-6 md:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-60px" }}
          >
            <ModalityCompare />
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FEATURE GRID ════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(123,47,247,0.06) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <Badge color="pink">Core systems</Badge>
            <h2 className="font-display font-black text-4xl md:text-6xl mt-4 mb-4">Built different.<br /><span className="gradient-text-shift">From the ground up.</span></h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">Six interlocking systems that make every lesson feel like it was written for exactly one person.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              const colorMap = {
                pink: { icon: "text-accent-pink bg-accent-pink/10", border: "hover:border-accent-pink/40", stat: "text-accent-pinkLight" },
                violet: { icon: "text-accent-violetLight bg-accent-violet/10", border: "hover:border-accent-violet/40", stat: "text-accent-violetLight" },
                mint: { icon: "text-accent-mint bg-accent-mint/10", border: "hover:border-accent-mint/40", stat: "text-accent-mint" },
                amber: { icon: "text-accent-amber bg-accent-amber/10", border: "hover:border-accent-amber/40", stat: "text-accent-amber" },
              };
              const c = colorMap[f.color];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`glass-panel rounded-2xl p-6 border border-white/8 ${c.border} transition-all duration-300 group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${f.color === "pink" ? "rgba(255,29,126,0.15)" : f.color === "violet" ? "rgba(123,47,247,0.15)" : f.color === "mint" ? "rgba(21,207,160,0.15)" : "rgba(255,179,71,0.15)"} 0%, transparent 70%)` }}
                  />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${c.stat} border-current/30 bg-current/5`} style={{ color: "inherit" }}>
                      <span className={c.stat}>{f.stat}</span>
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-text-primary mb-2">{f.title}</h3>
                  <p className="text-text-dim text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ PIPELINE ════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <Badge color="mint">How it works</Badge>
            <h2 className="font-display font-black text-4xl md:text-6xl mt-4 mb-4">
              Confusion detected.<br /><span className="gradient-text-shift">Language switched.</span>
            </h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">
              In under a second. No popup. No redirect. The lesson just becomes different — in the format your brain needs right now.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="relative glass-panel rounded-3xl p-8 md:p-14 border border-white/8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-accent-pink/5 pointer-events-none" />
            
            {/* Step cards */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              {pipeSteps.map((step, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: pipeStep === i ? 1.08 : 0.94, opacity: pipeStep === i ? 1 : 0.35 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center text-center flex-1 relative"
                >
                  <motion.div
                    animate={{ boxShadow: pipeStep === i ? "0 0 30px rgba(255,29,126,0.5)" : "none" }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-3 border-2 transition-all ${pipeStep === i ? "border-accent-pink bg-dark-card2" : "border-white/10 bg-dark-card"}`}
                  >
                    {step.icon}
                  </motion.div>
                  <div className="font-display font-bold text-[13px] text-text-primary mb-1">{step.title}</div>
                  <div className="font-mono text-[10.5px] text-text-faint max-w-[120px] leading-snug">{step.sub}</div>
                  {i < pipeSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-8 h-[2px] bg-white/10">
                      <motion.div className="h-full bg-gradient-to-r from-accent-pink to-accent-violet"
                        animate={{ scaleX: pipeStep > i ? 1 : 0 }} style={{ transformOrigin: "left" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress track */}
            <div className="mt-10 w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-accent-pink via-accent-violet to-accent-mint rounded-full"
                animate={{ width: `${((pipeStep + 1) / 5) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 font-mono text-[10px] text-text-faint text-center">
              Step {pipeStep + 1} of 5 — {pipeSteps[pipeStep].title}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ DASHBOARD PREVIEW ════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-80px" }}
            >
              <Badge color="violet">Teacher Command Panel</Badge>
              <h2 className="font-display font-black text-4xl md:text-5xl mt-4 mb-4 leading-tight">
                Real-time visibility into <span className="gradient-text-shift">every student's mind.</span>
              </h2>
              <p className="text-text-dim text-base md:text-lg leading-relaxed mb-8">
                The heatmap shows exactly where confusion fired across 24 students. Not after the class — during it. Pink cells = intervention triggered. Amber = hesitation. Click any student to inspect their cognitive profile, session history, and signed delivery log.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  onClick={() => navigate(user && (user.role === "teacher" || user.role === "admin") ? "/dashboard" : "/signup?role=teacher")}
                  whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-violet to-[#5a1fd4] text-white font-bold text-sm shadow-[0_6px_24px_rgba(123,47,247,0.4)] flex items-center gap-2"
                >
                  <BarChart2 size={15} /> Open Teacher Dashboard
                </motion.button>
                <motion.button
                  onClick={() => navigate("/demo")}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="px-7 py-3.5 rounded-full border border-white/15 text-text-dim hover:text-text-primary bg-white/[0.03] font-semibold text-sm flex items-center gap-2"
                >
                  <Play size={14} /> Watch the demo
                </motion.button>
              </div>
            </motion.div>

            {/* Dashboard preview mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.9 }} whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-80px" }}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
            >
              {/* Mock header */}
              <div className="p-4 border-b border-white/8 flex items-center justify-between bg-dark-bg/40">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-mint animate-pulse-dot" />
                  <span className="font-mono text-[11px] text-accent-mint uppercase tracking-wider">Live connection active</span>
                </div>
                <span className="font-mono text-[10px] text-text-faint">Newton's Laws · 24 students</span>
              </div>
              {/* Mock heatmap */}
              <div className="p-5">
                {["Priya Patel", "Diego Rodriguez", "Wei Li", "Amara Kante", "Sam O'Neill", "Chloe Jenkins"].map((name, si) => (
                  <div key={name} className="flex items-center gap-3 py-1.5 hover:bg-white/[0.02] px-2 rounded-lg group cursor-pointer">
                    <div className="w-[110px] text-[11px] text-text-dim font-medium group-hover:text-text-primary transition-colors truncate">{name}</div>
                    <div className="flex-1 grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }, (_, ci) => {
                        const val = [[0,1,0,0,2,0,0,1,0,2,0,0],[0,0,1,0,0,2,0,0,0,0,0,0],[1,0,0,0,2,0,1,0,0,0,0,0],[0,2,0,1,0,0,2,0,0,1,0,0],[0,0,0,2,0,0,1,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0]][si][ci];
                        return (
                          <motion.div key={ci} className={`h-4 rounded-sm ${val === 2 ? "bg-accent-pink" : val === 1 ? "bg-accent-amber" : "bg-white/[0.05]"}`}
                            whileHover={{ scale: 1.3 }} />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-text-faint">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/[0.05] inline-block" />No struggle</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent-amber inline-block" />Hesitation</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent-pink inline-block" />Intervention</span>
                  </div>
                  <span>Click any student →</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA FINAL ════════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }} viewport={{ once: true }}
            className="relative glass-panel rounded-[40px] p-12 md:p-20 text-center overflow-hidden border border-white/10"
          >
            <div className="absolute inset-0 pointer-events-none">
              <motion.div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-pink to-transparent"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,29,126,0.15) 0%, transparent 70%)" }} />
              <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
                style={{ background: "radial-gradient(circle, rgba(123,47,247,0.12) 0%, transparent 70%)" }} />
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-pink to-accent-violet flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,29,126,0.5)]"
              >
                <Sparkles size={24} className="text-white" />
              </motion.div>

              <h2 className="font-display font-black text-4xl md:text-6xl leading-tight mb-4">
                It doesn't repeat<br />itself louder.<br /><span className="gradient-text-shift">It switches language.</span>
              </h2>
              <p className="text-text-dim text-lg max-w-lg mx-auto mb-10">
                Whether your brain thinks in diagrams, stories, hands-on interactions, or sign — NeuroPath finds it on its own, and teaches in it from day one.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  onClick={() => navigate(user ? "/onboarding" : "/signup")}
                  whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}
                  className="px-10 py-5 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-black text-lg shadow-[0_10px_40px_rgba(255,29,126,0.5)] flex items-center gap-2 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={18} />
                    {user ? "Continue Learning" : "Start for free"}
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                  </span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-[#FF5C9A] to-accent-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-10 py-5 rounded-full border border-white/15 text-text-dim hover:text-text-primary bg-white/[0.03] font-bold text-lg transition-all flex items-center gap-2"
                >
                  Sign in <ArrowRight size={16} />
                </motion.button>
              </div>

              {/* Social proof */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-text-faint font-mono text-[11px]">
                <div className="flex items-center gap-1.5"><Users size={12} /><span>Free to start</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5"><Shield size={12} /><span>FERPA / COPPA compliant</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5"><Star size={12} /><span>WCAG 2.2 AA</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-1.5"><Globe size={12} /><span>5 sign language variants</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-display font-bold text-base">
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center shadow-[0_0_16px_rgba(255,29,126,0.4)]">
              <div className="w-2.5 h-2.5 rounded-full bg-dark-bg" />
            </div>
            NeuroPath
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-[11px] text-text-faint">
            <Link to="/onboarding" className="hover:text-text-primary transition-colors">Onboarding</Link>
            <Link to="/demo" className="hover:text-text-primary transition-colors">Live Demo</Link>
            <Link to="/dashboard" className="hover:text-text-primary transition-colors">Teacher Dashboard</Link>
            <Link to="/login" className="hover:text-text-primary transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-text-primary transition-colors">Sign Up</Link>
          </div>
          <div className="font-mono text-[10px] text-text-faint">© 2026 NeuroPath · Built for every learner</div>
        </div>
      </footer>
    </div>
  );
}
