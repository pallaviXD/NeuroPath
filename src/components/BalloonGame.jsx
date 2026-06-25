import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Clock, TrendingUp } from "lucide-react";

const BALLOON_COLORS = ["#FF1D7E","#7B2FF7","#15CFA0","#FFB347","#FF5C9A","#A472FF"];

export default function BalloonGame({ onComplete }) {
  const [phase, setPhase]           = useState("ready"); // ready | playing | done
  const [timeLeft, setTimeLeft]     = useState(45);
  const [score, setScore]           = useState(0);
  const [missed, setMissed]         = useState(0);
  const [totalSpawned, setTotal]    = useState(0);
  const [balloons, setBalloons]     = useState([]);
  const [popEffects, setPopEffects] = useState([]);
  const [reactionTimes, setReaction]= useState([]);
  const containerRef = useRef(null);
  const idRef        = useRef(0);
  const spawnedRef   = useRef(0);
  const lastPopRef   = useRef(null);

  // Difficulty ramp: as time decreases, more balloons + faster fall
  const getDifficulty = (t) => {
    if (t > 35) return { count: 1, speed: 3.5, rate: 1400 };
    if (t > 25) return { count: 1, speed: 2.8, rate: 1100 };
    if (t > 15) return { count: 2, speed: 2.2, rate: 900 };
    if (t > 8)  return { count: 2, speed: 1.8, rate: 700 };
    return { count: 3, speed: 1.4, rate: 500 }; // frenzy
  };

  useEffect(() => {
    if (phase !== "playing") return;
    let spawnTimer;

    const tick = () => {
      setTimeLeft(t => {
        if (t <= 0) { setPhase("done"); return 0; }
        const diff = getDifficulty(t);
        // Spawn balloons
        if (containerRef.current) {
          const W = containerRef.current.clientWidth - 80;
          for (let i = 0; i < diff.count; i++) {
            const id = idRef.current++;
            const balloon = {
              id, x: 30 + Math.random() * W,
              color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
              size: 50 + Math.random() * 25,
              speed: diff.speed,
              spawnTime: Date.now(),
            };
            setBalloons(prev => [...prev, balloon]);
            spawnedRef.current++;
            setTotal(spawnedRef.current);
            // Auto-remove if not popped
            setTimeout(() => {
              setBalloons(prev => {
                const found = prev.find(b => b.id === id);
                if (found) setMissed(m => m + 1);
                return prev.filter(b => b.id !== id);
              });
            }, diff.speed * 1000 + 500);
          }
        }
        return t - 1;
      });
      spawnTimer = setTimeout(tick, getDifficulty(timeLeft).rate);
    };

    spawnTimer = setTimeout(tick, 600);
    return () => clearTimeout(spawnTimer);
  }, [phase]);

  const pop = (balloon) => {
    if (phase !== "playing") return;
    const rt = lastPopRef.current ? Date.now() - lastPopRef.current : null;
    lastPopRef.current = Date.now();
    if (rt) setReaction(prev => [...prev, rt]);

    setScore(s => s + 1);
    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    // Pop effect
    const effect = { id: Date.now(), x: balloon.x, color: balloon.color };
    setPopEffects(prev => [...prev, effect]);
    setTimeout(() => setPopEffects(prev => prev.filter(e => e.id !== effect.id)), 500);
  };

  const submit = () => {
    const accuracy = spawnedRef.current > 0 ? score / spawnedRef.current : 0;
    const avgRT = reactionTimes.length > 0 ? reactionTimes.reduce((a,b)=>a+b,0)/reactionTimes.length : 1000;
    // Capacity level: based on accuracy + reaction time
    let capacityLevel = "medium";
    if (accuracy > 0.75 && avgRT < 600) capacityLevel = "high";
    else if (accuracy < 0.35 || avgRT > 1200) capacityLevel = "low";

    onComplete({
      modality: "kinesthetic",
      timeMs: 45000,
      accuracy,
      score,
      totalSpawned: spawnedRef.current,
      missed,
      avgReactionTimeMs: Math.round(avgRT),
      capacityLevel, // "low" | "medium" | "high"
    });
  };

  // Accuracy color
  const acc = spawnedRef.current > 0 ? Math.round((score / spawnedRef.current) * 100) : 0;
  const accColor = acc >= 70 ? "#15CFA0" : acc >= 40 ? "#FFB347" : "#FF1D7E";

  return (
    <div className="w-full select-none">
      {/* ── READY ── */}
      {phase === "ready" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 py-4">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] text-accent-violet bg-accent-violet/10 border border-accent-violet/25 px-4 py-1.5 rounded-full uppercase">
            <Zap size={10} /> Kinesthetic Reflex Challenge
          </div>
          <h2 className="font-display font-black text-3xl text-text-primary">Pop the balloons!</h2>
          <p className="text-text-dim text-sm max-w-sm mx-auto">
            45 seconds. Tap every balloon before it falls. The game speeds up — your reaction time and accuracy tells us how your brain processes fast stimuli.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {[
              { icon: Clock, label: "45 seconds", sub: "Time limit" },
              { icon: Target, label: "Tap fast", sub: "Before they fall" },
              { icon: TrendingUp, label: "Gets harder", sub: "Ramps up at 15s" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="glass-panel rounded-2xl p-3 border border-white/8 text-center">
                  <Icon size={18} className="text-accent-pink mx-auto mb-1.5" />
                  <div className="font-display font-bold text-sm text-text-primary">{c.label}</div>
                  <div className="font-mono text-[9px] text-text-faint">{c.sub}</div>
                </div>
              );
            })}
          </div>

          <motion.button onClick={() => setPhase("playing")}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            className="w-full max-w-sm mx-auto py-5 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(255,29,126,0.45)]"
            style={{ background: "linear-gradient(135deg, #FF1D7E, #7B2FF7)", display: "flex" }}>
            <Zap size={22} /> Start Challenge
          </motion.button>
        </motion.div>
      )}

      {/* ── PLAYING ── */}
      {phase === "playing" && (
        <div className="w-full">
          {/* HUD */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <motion.div animate={{ color: timeLeft <= 10 ? ["#FF1D7E","#FFB347","#FF1D7E"] : "#F5F2FA" }}
                transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                className="font-display font-black text-2xl">
                {timeLeft}s
              </motion.div>
              {timeLeft <= 10 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: [1,1.2,1] }} transition={{ duration: 0.5, repeat: Infinity }}
                  className="font-mono text-[9px] text-accent-pink uppercase font-bold">FRENZY!</motion.span>
              )}
            </div>
            <div className="flex items-center gap-4 font-mono text-sm">
              <span className="text-accent-mint font-bold">✓ {score}</span>
              <span className="text-accent-pink/60">✗ {missed}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-accent-pink to-accent-violet rounded-full"
              animate={{ width: `${(timeLeft / 45) * 100}%` }} transition={{ duration: 0.9, ease: "linear" }} />
          </div>

          {/* Game field */}
          <div ref={containerRef}
            className="relative w-full rounded-3xl border border-white/10 overflow-hidden cursor-crosshair"
            style={{ height: "380px", background: "radial-gradient(ellipse at 50% 0%, rgba(123,47,247,0.08) 0%, #08060B 70%)" }}>

            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Balloons */}
            <AnimatePresence>
              {balloons.map(b => (
                <motion.div key={b.id}
                  className="absolute rounded-full flex items-center justify-center cursor-pointer"
                  style={{ width: b.size, height: b.size * 1.2, left: b.x - b.size/2, backgroundColor: b.color, boxShadow: `0 0 20px ${b.color}60, 0 0 40px ${b.color}30` }}
                  initial={{ y: -80, opacity: 0, scale: 0.5 }}
                  animate={{ y: 460, opacity: [0, 1, 1, 0.7], scale: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: b.speed, ease: "linear", opacity: { times: [0, 0.1, 0.8, 1] } }}
                  onPointerDown={() => pop(b)}>
                  {/* Shine */}
                  <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/30" />
                  {/* String */}
                  <div className="absolute -bottom-4 left-1/2 w-px h-4 bg-white/20" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pop effects */}
            {popEffects.map(e => (
              <motion.div key={e.id} className="absolute pointer-events-none"
                style={{ left: e.x - 30, top: 60, width: 60, height: 60 }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}>
                {[...Array(8)].map((_, i) => (
                  <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: e.color, top: "50%", left: "50%" }}
                    animate={{ x: Math.cos(i * 45 * Math.PI / 180) * 30, y: Math.sin(i * 45 * Math.PI / 180) * 30, opacity: 0 }}
                    transition={{ duration: 0.4 }} />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {phase === "done" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="text-6xl">
            {acc >= 70 ? "🎯" : acc >= 40 ? "👍" : "💪"}
          </motion.div>

          <h2 className="font-display font-black text-3xl text-text-primary">
            {acc >= 70 ? "Great reflexes!" : acc >= 40 ? "Good effort!" : "Nice try!"}
          </h2>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="glass-panel rounded-2xl p-4 border border-white/8">
              <div className="font-mono text-[9px] text-text-faint uppercase mb-1">Popped</div>
              <div className="font-display font-black text-3xl text-accent-mint">{score}</div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/8">
              <div className="font-mono text-[9px] text-text-faint uppercase mb-1">Accuracy</div>
              <div className="font-display font-black text-3xl" style={{ color: accColor }}>{acc}%</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-white/8 max-w-xs mx-auto text-left">
            <div className="font-mono text-[9px] text-text-faint uppercase mb-2">What this tells us</div>
            <p className="text-text-dim text-xs leading-relaxed">
              {acc >= 70
                ? "High kinesthetic processing speed. You engage well with fast, interactive content. Simulations will work great for you."
                : acc >= 40
                ? "Moderate kinesthetic engagement. You work best with a mix of interactive and visual content."
                : "You prefer slower-paced, thoughtful formats. Story-based and visual explanations will work best for you."}
            </p>
          </div>

          <motion.button onClick={submit}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            className="w-full max-w-sm mx-auto py-4 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(21,207,160,0.4)]"
            style={{ background: "linear-gradient(135deg, #15CFA0, #7B2FF7)", display: "flex" }}>
            Continue to Story Challenge →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
