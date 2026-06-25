import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue, useInView
} from "framer-motion";
import {
  ArrowRight, Sparkles, Brain, Zap, Hand, BarChart2, Shield,
  ChevronDown, Upload, Eye, BookOpen, Play, RotateCcw, Check,
  AlertTriangle, Users, Star
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

/* ══════════════════════════════════════════════════════════
   BACKGROUND ELEMENTS
══════════════════════════════════════════════════════════ */

/* Floating elliptical shape (from shape-landing-hero) — NeuroPath colors */
function ElegantShape({ className="", delay=0, width=400, height=100, rotate=0, gradient="from-accent-pink/[0.15]" }) {
  return (
    <motion.div
      initial={{ opacity:0, y:-150, rotate: rotate-15 }}
      animate={{ opacity:1, y:0, rotate }}
      transition={{ duration:2.4, delay, ease:[0.23,0.86,0.39,0.96], opacity:{ duration:1.2 } }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y:[0,18,0] }}
        transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.12] shadow-[0_8px_32px_0_rgba(255,255,255,0.06)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]`} />
      </motion.div>
    </motion.div>
  );
}

/* Floating tiny particles */
function Particles() {
  const pts = useRef(
    Array.from({ length: 45 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.6,
      dur: Math.random() * 22 + 12,
      delay: Math.random() * 14,
      color: ["#FF1D7E","#7B2FF7","#15CFA0","#FFB347"][i % 4],
      op: Math.random() * 0.35 + 0.06,
    }))
  ).current;
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size, backgroundColor:p.color, opacity:p.op }}
          animate={{ y:[0,-130,0], x:[0,(p.id%2===0?1:-1)*35,0], scale:[1,1.7,1], opacity:[p.op,p.op*2.2,p.op] }}
          transition={{ duration:p.dur, delay:p.delay, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
    </div>
  );
}

function MouseGlow() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x,{stiffness:50,damping:15}), sy = useSpring(y,{stiffness:50,damping:15});
  useEffect(() => {
    const h = e => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  return (
    <motion.div className="fixed pointer-events-none z-[2] hidden lg:block"
      style={{ left:sx, top:sy, translateX:"-50%", translateY:"-50%" }}>
      <div className="w-[750px] h-[750px] rounded-full"
        style={{ background:"radial-gradient(circle, rgba(255,29,126,0.06) 0%, rgba(123,47,247,0.04) 35%, transparent 65%)" }} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SMALL REUSABLE ATOMS
══════════════════════════════════════════════════════════ */

function Pill({ children, color="pink" }) {
  const c = {
    pink: "text-accent-pinkLight bg-accent-pink/10 border-accent-pink/30",
    mint: "text-accent-mint bg-accent-mint/10 border-accent-mint/30",
    violet: "text-accent-violetLight bg-accent-violet/10 border-accent-violet/30",
    amber: "text-accent-amber bg-accent-amber/10 border-accent-amber/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.14em] border px-3 py-1 rounded-full uppercase ${c[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${color==="pink"?"bg-accent-pink":color==="mint"?"bg-accent-mint":color==="violet"?"bg-accent-violetLight":"bg-accent-amber"}`} />
      {children}
    </span>
  );
}

function Count({ n, suffix="" }) {
  const [v, setV] = useState(0);
  const ref = useRef();
  const inView = useInView(ref,{once:true,margin:"-60px"});
  useEffect(() => {
    if (!inView) return;
    const end = parseInt(n); if (!end) return;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now-t0)/2000,1);
      setV(Math.floor((1-(1-p)**3)*end));
      if (p < 1) requestAnimationFrame(tick); else setV(end);
    };
    requestAnimationFrame(tick);
  }, [inView,n]);
  return <span ref={ref} className="font-display font-black text-4xl md:text-5xl text-text-primary tabular-nums">{inView?v:0}{suffix}</span>;
}

const TYPEWORDS = ["differently.","visually.","through stories.","hands-on.","in sign.","uniquely."];
function Typer() {
  const [wi,setWi] = useState(0);
  const [s,setS] = useState("");
  const [del,setDel] = useState(false);
  useEffect(() => {
    const w = TYPEWORDS[wi];
    if (!del && s.length < w.length) { const t=setTimeout(()=>setS(w.slice(0,s.length+1)),65); return ()=>clearTimeout(t); }
    if (!del && s.length===w.length) { const t=setTimeout(()=>setDel(true),1900); return ()=>clearTimeout(t); }
    if (del && s.length>0) { const t=setTimeout(()=>setS(s.slice(0,-1)),38); return ()=>clearTimeout(t); }
    if (del && s.length===0) { setDel(false); setWi((wi+1)%TYPEWORDS.length); }
  },[s,del,wi]);
  return <span className="gradient-text-shift">{s}<span className="opacity-60 animate-pulse">|</span></span>;
}

/* ══════════════════════════════════════════════════════════
   LIVE FINGERPRINT WIDGET
══════════════════════════════════════════════════════════ */
function FingerprintCard() {
  const [v,setV] = useState({visual:0,narrative:0,kinesthetic:0,sign:0});
  const [done,setDone] = useState(false);
  const ref = useRef(); const inView = useInView(ref,{once:true,margin:"-60px"});
  useEffect(() => {
    if(!inView) return;
    const tgt={visual:82,narrative:34,kinesthetic:51,sign:22};
    const t0=performance.now();
    const tick=now=>{
      const p=Math.min((now-t0)/3000,1),e=1-(1-p)**2;
      setV({visual:Math.round(tgt.visual*e),narrative:Math.round(tgt.narrative*e),kinesthetic:Math.round(tgt.kinesthetic*e),sign:Math.round(tgt.sign*e)});
      if(p<1) requestAnimationFrame(tick); else setDone(true);
    };
    setTimeout(()=>requestAnimationFrame(tick),600);
  },[inView]);

  const rows=[
    {k:"visual",label:"Visual",icon:"📊",color:"#FF1D7E"},
    {k:"narrative",label:"Story",icon:"📖",color:"#FFB347"},
    {k:"kinesthetic",label:"Simulation",icon:"🧪",color:"#7B2FF7"},
    {k:"sign",label:"Sign Lang.",icon:"🤟",color:"#15CFA0"},
  ];

  return (
    <div ref={ref} className="relative w-full">
      {/* Glow ring */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-accent-pink/30 via-accent-violet/10 to-accent-mint/20 opacity-60 blur-sm pointer-events-none" />
      <div className="relative glass-panel rounded-3xl p-6 border border-white/10 shadow-[0_30px_80px_-15px_rgba(255,29,126,0.3)]">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-pink/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div className="w-2.5 h-2.5 rounded-full bg-accent-mint"
                animate={{opacity:[1,0.3,1],scale:[1,0.8,1]}} transition={{duration:1.5,repeat:Infinity}} />
              <span className="font-mono text-[10px] text-accent-mint uppercase tracking-[0.15em] font-bold">Cognitive Scan · Live</span>
            </div>
            <p className="font-display font-bold text-base text-text-primary">Ready to analyse your learning style?</p>
            <p className="font-mono text-[9.5px] text-text-faint mt-0.5">Upload any PDF · Auto-adapted to visual, story, hands-on, or sign</p>
          </div>
          <div className="font-mono text-xs text-text-faint bg-white/5 px-2.5 py-1 rounded-lg">00:32</div>
        </div>

        {/* Modality bars */}
        <div className="space-y-4 mb-5">
          {rows.map((r,i) => (
            <motion.div key={r.k} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.1*i}}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{r.icon}</span>
                  <span className="font-mono text-[11px] text-text-dim">{r.label}</span>
                  {r.k==="visual" && v.visual>60 && done && (
                    <motion.span initial={{scale:0}} animate={{scale:1}}
                      className="font-mono text-[8px] text-accent-pink bg-accent-pink/10 border border-accent-pink/20 px-1.5 py-0.5 rounded-full uppercase">
                      dominant
                    </motion.span>
                  )}
                </div>
                <span className="font-mono text-[12px] font-bold" style={{color:r.color}}>{v[r.k]}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div className="h-full rounded-full relative"
                  style={{backgroundColor:r.color, boxShadow:`0 0 14px ${r.color}70`}}
                  animate={{width:`${v[r.k]}%`}} transition={{duration:0.4,ease:"easeOut"}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {done && (
            <motion.div initial={{opacity:0,y:10,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
              className="relative overflow-hidden rounded-2xl border border-accent-pink/30 bg-gradient-to-r from-accent-pink/10 to-accent-violet/5 p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-pink/5 to-transparent" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-1">Profile locked in 32 seconds</div>
                  <div className="font-display font-black text-xl text-accent-pinkLight">Visual Learner</div>
                  <div className="font-mono text-[10px] text-text-dim mt-0.5">82% confidence · 0 questions asked</div>
                </div>
                <motion.div animate={{rotate:[0,360]}} transition={{duration:3,repeat:Infinity,ease:"linear"}}
                  className="w-12 h-12 rounded-full border-2 border-accent-pink/40 border-t-accent-pink flex items-center justify-center">
                  <Check size={18} className="text-accent-pink" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STRUGGLE → INTERVENTION LIVE DEMO
══════════════════════════════════════════════════════════ */
function StruggleDemoCard() {
  const [step,setStep] = useState(0); // 0=reading 1=struggling 2=detected 3=switching 4=resolved
  const ref = useRef(); const inView = useInView(ref,{once:true,margin:"-60px"});

  useEffect(() => {
    if(!inView) return;
    const timings=[0,1800,3000,4200,5800];
    const timers=timings.map((t,i)=>setTimeout(()=>setStep(i),t));
    return ()=>timers.forEach(clearTimeout);
  },[inView]);

  const replay=()=>{ setStep(0); setTimeout(()=>setStep(1),1800); setTimeout(()=>setStep(2),3000); setTimeout(()=>setStep(3),4200); setTimeout(()=>setStep(4),5800); };

  return (
    <div ref={ref} className="relative w-full">
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-accent-violet/20 via-transparent to-accent-mint/15 opacity-50 blur-sm pointer-events-none" />
      <div className="relative glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_30px_80px_-15px_rgba(123,47,247,0.25)]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${step>=2?"bg-accent-amber animate-pulse":"bg-accent-mint"}`} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
              {step===0?"Student reading..."
               :step===1?"⚠ Re-reading detected (×3)"
               :step===2?"🔴 Struggle confirmed"
               :step===3?"🧬 Switching modality..."
               :"✅ Resolved · 12s"}
            </span>
          </div>
          <button onClick={replay} className="flex items-center gap-1 font-mono text-[9px] text-text-faint hover:text-text-primary transition-colors cursor-pointer">
            <RotateCcw size={10} /> replay
          </button>
        </div>

        {/* Lesson text */}
        <div className="px-5 py-4">
          <p className="text-text-dim text-sm leading-relaxed">
            An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by{" "}
            <motion.span
              className="inline rounded px-1 py-0.5 border transition-all duration-500"
              animate={{
                backgroundColor: step>=1?"rgba(255,29,126,0.2)":"transparent",
                borderColor: step>=1?"rgba(255,29,126,0.5)":"transparent",
                color: step>=1?"#F5F2FA":"inherit",
              }}>
              an unbalanced force.
            </motion.span>
            {" "}This is Newton's First Law — the Law of Inertia.
          </p>

          {/* Scroll indicator */}
          <AnimatePresence>
            {step===1 && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="mt-3 flex items-center gap-2 font-mono text-[10px] text-accent-amber">
                <AlertTriangle size={11} /> Scrolled back to top 3× in 8 seconds
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pipeline */}
        <div className="px-5 py-3 bg-white/[0.015] border-t border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            {["Signal","Profile","Generate","Deliver"].map((label,i)=>(
              <div key={i} className="flex items-center gap-1.5 flex-1">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold transition-all duration-500 ${step>=i+1?"border-accent-pink bg-accent-pink text-white":"border-white/15 text-text-faint"}`}>{i+1}</div>
                <span className={`font-mono text-[8px] uppercase tracking-wider transition-colors hidden sm:block ${step>=i+1?"text-accent-pinkLight":"text-text-faint"}`}>{label}</span>
                {i<3 && <div className={`flex-1 h-px transition-all duration-500 ${step>=i+2?"bg-accent-pink":"bg-white/10"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Intervention result */}
        <AnimatePresence>
          {step>=3 && (
            <motion.div initial={{opacity:0,y:20,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
              className="mx-4 mb-4 rounded-2xl border border-accent-violet/40 bg-gradient-to-br from-accent-violet/10 to-accent-mint/5 p-4">
              <div className="font-mono text-[9px] text-accent-violetLight uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap size={10} /> AI Intervention · Visual diagram unlocked
              </div>
              <div className="flex items-center justify-center gap-8 py-3 bg-dark-bg/40 rounded-xl border border-white/5">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-1.5 bg-accent-pink rounded" />
                  <span className="font-mono text-[8px] text-accent-pink">10N →</span>
                </div>
                <div className="w-10 h-10 rounded-lg border-2 border-accent-violetLight bg-dark-card flex items-center justify-center font-mono text-[9px] text-text-dim">5kg</div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-1.5 bg-accent-mint rounded" />
                  <span className="font-mono text-[8px] text-accent-mint">← 10N</span>
                </div>
              </div>
              {step===4 && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
                  className="mt-2 font-mono text-[10px] text-accent-mint flex items-center gap-1.5">
                  <Check size={11} /> Student passed checkpoint · 1 attempt after intervention
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PDF UPLOAD FEATURE PREVIEW
══════════════════════════════════════════════════════════ */
function PDFFeatureCard() {
  const [phase,setPhase] = useState(0); // 0=idle 1=uploading 2=extracting 3=done
  const ref = useRef(); const inView = useInView(ref,{once:true,margin:"-60px"});
  useEffect(() => {
    if(!inView) return;
    setTimeout(()=>setPhase(1),400);
    setTimeout(()=>setPhase(2),1400);
    setTimeout(()=>setPhase(3),3200);
  },[inView]);
  const outputs=["📊 Visual Diagram","📖 Story Analogy","🧪 Simulation","🤟 Sign Language","❓ Quiz","⚡ Flashcards","♿ Accessibility View"];
  return (
    <div ref={ref} className="glass-panel rounded-3xl p-6 border border-white/10 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-accent-amber/15 border border-accent-amber/30 flex items-center justify-center">
          <Upload size={16} className="text-accent-amber" />
        </div>
        <div>
          <div className="font-display font-bold text-sm text-text-primary">PDF → Adaptive Lesson</div>
          <div className="font-mono text-[9px] text-text-faint">Gemini powered · instant</div>
        </div>
      </div>

      {/* File drop zone */}
      <div className={`rounded-2xl border-2 border-dashed p-4 text-center mb-4 transition-all duration-500 ${phase>=1?"border-accent-amber/50 bg-accent-amber/5":"border-white/10"}`}>
        <motion.div animate={phase===1?{scale:[1,1.05,1]}:{}} transition={{duration:0.5}}>
          <div className="font-mono text-[10px] text-text-faint mb-1">{phase===0?"Drop your PDF here":phase===1?"Uploading photosynthesis.pdf...":phase===2?"Extracting concepts...":"✅ Done"}</div>
          {phase===1 && <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2"><motion.div className="h-full bg-accent-amber rounded-full" initial={{width:0}} animate={{width:"100%"}} transition={{duration:0.9}} /></div>}
          {phase===2 && <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2"><motion.div className="h-full bg-accent-pink rounded-full" initial={{width:0}} animate={{width:"100%"}} transition={{duration:1.6}} /></div>}
        </motion.div>
      </div>

      {/* Generated outputs */}
      <AnimatePresence>
        {phase>=3 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-1.5">
            <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-2">Generated automatically:</div>
            {outputs.map((o,i)=>(
              <motion.div key={o} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[10px] text-text-dim">
                <Check size={10} className="text-accent-mint flex-shrink-0" />
                {o}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TEACHER DASHBOARD PREVIEW
══════════════════════════════════════════════════════════ */
const HEATMAP_ROWS=[
  {name:"Priya Patel",cells:[0,1,0,0,2,0,0,1,0,2,0,0],deafHoh:true},
  {name:"Diego Rodriguez",cells:[0,0,1,0,0,2,0,0,0,0,0,0],deafHoh:false},
  {name:"Wei Li",cells:[1,0,0,0,2,0,1,0,0,0,0,0],deafHoh:false},
  {name:"Amara Kante",cells:[0,2,0,1,0,0,2,0,0,1,0,0],deafHoh:false},
  {name:"Sam O'Neill",cells:[0,0,0,2,0,0,1,0,0,0,0,0],deafHoh:true},
  {name:"Chloe Jenkins",cells:[0,1,0,0,0,0,0,0,0,0,0,0],deafHoh:false},
];
function DashboardPreview() {
  const [hoveredCell,setHoveredCell] = useState(null);
  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-[0_30px_80px_-15px_rgba(123,47,247,0.2)]">
      <div className="px-5 py-3.5 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 rounded-full bg-accent-mint"
            animate={{opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}} />
          <span className="font-mono text-[10px] text-accent-mint uppercase tracking-wider">Live · 24 students · Newton's Laws</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-text-faint">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent-pink inline-block" />Intervention</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-accent-amber inline-block" />Hesitation</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {HEATMAP_ROWS.map((row,ri)=>(
          <div key={row.name} className="flex items-center gap-3 py-1.5 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
            <div className="w-[120px] flex items-center gap-1.5 flex-shrink-0">
              <span className="font-medium text-[11px] text-text-dim truncate">{row.name}</span>
              {row.deafHoh && <span className="font-mono text-[7px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-1 rounded uppercase">HoH</span>}
            </div>
            <div className="flex-1 grid grid-cols-12 gap-1">
              {row.cells.map((v,ci)=>(
                <motion.div key={ci}
                  className={`h-5 rounded cursor-pointer transition-all ${v===2?"bg-accent-pink shadow-[0_0_6px_rgba(255,29,126,0.6)]":v===1?"bg-accent-amber shadow-[0_0_5px_rgba(255,179,71,0.5)]":"bg-white/[0.06]"}`}
                  whileHover={{scale:1.25,zIndex:10}}
                  onHoverStart={()=>v>0&&setHoveredCell({row:ri,col:ci,val:v,name:row.name})}
                  onHoverEnd={()=>setHoveredCell(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {hoveredCell && (
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="mx-4 mb-4 p-3 rounded-xl bg-dark-bg border border-accent-pink/30 font-mono text-[10px]">
            <span className="text-text-primary font-bold">{hoveredCell.name}</span>
            <span className="text-text-faint ml-2">checkpoint {hoveredCell.col+1} · {hoveredCell.val===2?"Intervention fired":"Hesitation detected"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Brain, color:"pink", badge:"Zero quizzes",
    title:"Cognitive Fingerprinting",
    body:"Watches hover time, scroll speed, re-reads, and pauses. Builds your learning profile in under 2 minutes — without ever asking.",
    detail:"Visual · Narrative · Kinesthetic · Sign",
    glow:"rgba(255,29,126,0.12)",
  },
  {
    icon: Zap, color:"violet", badge:"<1s response",
    title:"Live Struggle Detection",
    body:"Re-read the same sentence? Long pause before answering? Wrong-then-right self-correction? Caught instantly. Format switched. No popup.",
    detail:"3 signal types · inline delivery",
    glow:"rgba(123,47,247,0.12)",
  },
  {
    icon: Hand, color:"mint", badge:"5 sign variants",
    title:"Native Sign Language",
    body:"3D avatar signs the full syllabus word-by-word. ASL, BSL, ISL, SgSL, Auslan. Not a sidebar caption — the actual lesson format.",
    detail:"No reading required · full study path",
    glow:"rgba(21,207,160,0.12)",
  },
  {
    icon: Upload, color:"amber", badge:"Gemini AI",
    title:"PDF → Lesson in Seconds",
    body:"Upload any PDF, notes, or textbook. Gemini extracts key concepts and generates visual, story, simulation, and signed versions automatically.",
    detail:"7 output formats per upload",
    glow:"rgba(255,179,71,0.12)",
  },
  {
    icon: BarChart2, color:"violet", badge:"Real-time",
    title:"Teacher Command Panel",
    body:"Live classroom heatmap. See who's stuck, where they stuck, which format fixed it — during class, not the next morning.",
    detail:"24-student live feed · intervention log",
    glow:"rgba(123,47,247,0.12)",
  },
  {
    icon: Shield, color:"mint", badge:"Privacy first",
    title:"No Labels. No Diagnosis.",
    body:"Behavioral telemetry stays internal. Students are never labeled clinically. FERPA · COPPA · GDPR-K aligned from the first line of code.",
    detail:"Compliant by design · not as an afterthought",
    glow:"rgba(21,207,160,0.12)",
  },
];

const COLOR={
  pink:{ icon:"text-accent-pink bg-accent-pink/10 border-accent-pink/20", badge:"text-accent-pinkLight border-accent-pink/25 bg-accent-pink/8", hover:"hover:border-accent-pink/40 group-hover:shadow-[0_0_50px_-10px_rgba(255,29,126,0.35)]" },
  violet:{ icon:"text-accent-violetLight bg-accent-violet/10 border-accent-violet/20", badge:"text-accent-violetLight border-accent-violet/25 bg-accent-violet/8", hover:"hover:border-accent-violet/40 group-hover:shadow-[0_0_50px_-10px_rgba(123,47,247,0.35)]" },
  mint:{ icon:"text-accent-mint bg-accent-mint/10 border-accent-mint/20", badge:"text-accent-mint border-accent-mint/25 bg-accent-mint/8", hover:"hover:border-accent-mint/40 group-hover:shadow-[0_0_50px_-10px_rgba(21,207,160,0.35)]" },
  amber:{ icon:"text-accent-amber bg-accent-amber/10 border-accent-amber/20", badge:"text-accent-amber border-accent-amber/25 bg-accent-amber/8", hover:"hover:border-accent-amber/40 group-hover:shadow-[0_0_50px_-10px_rgba(255,179,71,0.35)]" },
};

const ROLES=[
  {id:"student",emoji:"🎓",label:"Student",sub:"You learn",body:"Every lesson reshapes itself around how your brain actually works. Zero labels. Zero quizzes. Just content that lands.",color:"pink",cta:"Start Learning →",path:"/onboarding"},
  {id:"teacher",emoji:"🏫",label:"Teacher",sub:"You teach",body:"See which student is struggling, on which concept, and what format just fixed it — live, mid-lesson.",color:"violet",cta:"Open Dashboard →",path:"/dashboard"},
  {id:"parent",emoji:"🏠",label:"Parent",sub:"You support",body:"Plain-language weekly digest. What they learned, where they got stuck, how to help at home — no raw data.",color:"mint",cta:"View Portal →",path:"/parent"},
  {id:"admin",emoji:"⚙️",label:"Admin",sub:"You deploy",body:"SSO roster sync, curriculum standards, compliance exports. Designed for district-scale rollout from day one.",color:"amber",cta:"Admin Console →",path:"/dashboard"},
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const containerRef = useRef();
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress,[0,0.25],[0,-60]);
  const heroOp = useTransform(scrollYProgress,[0,0.22],[1,0]);
  const [pipeStep,setPipeStep] = useState(0);

  useEffect(()=>{
    const t = setInterval(()=>setPipeStep(p=>(p+1)%5),1700);
    return ()=>clearInterval(t);
  },[]);

  const goStart=()=> navigate(user? (user.role==="teacher"||user.role==="admin"?"/dashboard":user.role==="parent"?"/parent":"/onboarding") : "/signup");

  return (
    <div ref={containerRef} className="w-full bg-dark-bg overflow-x-hidden">
      <Particles />
      <MouseGlow />

      {/* ═══════════════ HERO ═══════════════ */}
      <motion.section style={{y:heroY,opacity:heroOp}}
        className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 md:px-16 z-10">

      {/* Big background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Soft gradient tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/[0.04] via-transparent to-accent-violet/[0.05]" />

          {/* Floating elliptical shapes — the signature background */}
          <ElegantShape delay={0.2} width={650} height={150} rotate={12}
            gradient="from-accent-pink/[0.18]"
            className="left-[-8%] top-[18%]" />

          <ElegantShape delay={0.4} width={520} height={130} rotate={-15}
            gradient="from-accent-violet/[0.16]"
            className="right-[-4%] top-[68%]" />

          <ElegantShape delay={0.3} width={320} height={85} rotate={-8}
            gradient="from-accent-mint/[0.14]"
            className="left-[8%] bottom-[8%]" />

          <ElegantShape delay={0.55} width={220} height={65} rotate={22}
            gradient="from-accent-amber/[0.12]"
            className="right-[18%] top-[8%]" />

          <ElegantShape delay={0.65} width={160} height={48} rotate={-28}
            gradient="from-accent-pink/[0.10]"
            className="left-[22%] top-[4%]" />

          <ElegantShape delay={0.45} width={280} height={75} rotate={18}
            gradient="from-accent-violetLight/[0.12]"
            className="right-[5%] top-[35%]" />

          {/* Horizontal scan line */}
          <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-pink/30 to-transparent"
            animate={{top:["5%","93%","5%"]}} transition={{duration:9,repeat:Infinity,ease:"linear"}} />
        </div>

        <div className="relative z-10 w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — copy */}
            <div>
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
                <Pill color="pink">AI-Native Adaptive Learning · Gemini Powered</Pill>
              </motion.div>

              <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.1}}
                className="font-display font-black text-5xl md:text-7xl lg:text-[78px] leading-[1.02] tracking-[-0.025em] mt-6 mb-5">
                Every student<br />learns <Typer />
              </motion.h1>

              <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.25}}
                className="text-text-dim text-lg md:text-xl leading-relaxed mb-8 max-w-[520px]">
                NeuroPath watches how you interact with a concept and builds your cognitive profile silently. Then every lesson becomes the format your brain actually understands — diagram, story, simulation, or sign language. Without being asked once.
              </motion.p>

              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.35}}
                className="flex flex-wrap gap-4 mb-10">
                <motion.button onClick={goStart} whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.97}}
                  className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-black text-base shadow-[0_8px_40px_rgba(255,29,126,0.45)] overflow-hidden flex items-center gap-2">
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles size={17} /> {user?"Continue Learning":"Start for free"}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>

                <motion.button onClick={()=>navigate("/demo")} whileHover={{scale:1.02,borderColor:"rgba(255,29,126,0.4)"}} whileTap={{scale:0.97}}
                  className="px-8 py-4 rounded-full border border-white/12 text-text-dim hover:text-text-primary bg-white/[0.03] backdrop-blur font-semibold text-base transition-all flex items-center gap-2">
                  <Play size={15} /> Watch demo
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
                className="flex flex-wrap items-center gap-6">
                {[{n:"300",s:"M+",label:"learners with differences"},
                  {n:"70",s:"M+",label:"Deaf / HoH students"},
                  {n:"0",s:"",label:"self-report quizzes"}].map((st,i)=>(
                  <div key={i} className="flex flex-col">
                    <Count n={st.n} suffix={st.s} />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-faint mt-1">{st.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — live fingerprint */}
            <motion.div initial={{opacity:0,scale:0.88,y:40}} animate={{opacity:1,scale:1,y:0}}
              transition={{duration:1,delay:0.4,ease:[0.16,1,0.3,1]}}>
              <FingerprintCard />
            </motion.div>
          </div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-text-faint"
          animate={{y:[0,8,0]}} transition={{duration:2.5,repeat:Infinity}}>
          <span className="font-mono text-[9px] uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown size={14} />
        </motion.div>

        {/* Fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark-bg to-transparent pointer-events-none" />
      </motion.section>

      {/* ═══════════════ STRUGGLE DEMO + PDF ═══════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} viewport={{once:true,margin:"-80px"}}
            className="text-center mb-16">
            <Pill color="violet">See it in action</Pill>
            <h2 className="font-display font-black text-4xl md:text-[62px] leading-[1.05] mt-4 mb-4">
              It doesn't repeat louder.<br /><span className="gradient-text-shift">It switches language.</span>
            </h2>
            <p className="text-text-dim text-lg max-w-2xl mx-auto">
              Watch the system catch confusion in real time and switch the content format — inline, without interrupting the student. Then see a full PDF become 7 learning formats in under 4 seconds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <motion.div initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} transition={{duration:0.7}} viewport={{once:true}}>
              <div className="mb-4">
                <Pill color="pink">Struggle detection</Pill>
                <h3 className="font-display font-bold text-2xl mt-3 mb-2">Live confusion → format switch</h3>
                <p className="text-text-dim text-sm">Same student. Same lesson. Re-read detected. Profile queried. New format delivered in under a second.</p>
              </div>
              <StruggleDemoCard />
            </motion.div>

            <motion.div initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} transition={{duration:0.7,delay:0.15}} viewport={{once:true}}>
              <div className="mb-4">
                <Pill color="amber">PDF ingestion</Pill>
                <h3 className="font-display font-bold text-2xl mt-3 mb-2">Upload once. Learn in every format.</h3>
                <p className="text-text-dim text-sm">Any PDF, notes, or textbook chapter. Gemini extracts concepts and generates 7 learning formats — including full sign language study.</p>
              </div>
              <PDFFeatureCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES GRID ═══════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
          style={{background:"radial-gradient(circle, rgba(123,47,247,0.05) 0%, transparent 65%)"}} />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} viewport={{once:true,margin:"-80px"}}
            className="text-center mb-16">
            <Pill color="pink">Six systems. One goal.</Pill>
            <h2 className="font-display font-black text-4xl md:text-[62px] leading-[1.05] mt-4 mb-4">
              Built different.<br /><span className="gradient-text-shift">From the first line.</span>
            </h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">Every feature connects to every other. Cognitive profiling feeds struggle detection. Struggle detection drives format generation. Format generation feeds the accessibility pipeline.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f,i)=>{
              const Icon=f.icon, c=COLOR[f.color];
              return (
                <motion.div key={f.title}
                  initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}}
                  transition={{duration:0.5,delay:(i%3)*0.08}} viewport={{once:true,margin:"-40px"}}
                  whileHover={{y:-6,scale:1.01}}
                  className={`glass-panel rounded-3xl p-7 border border-white/8 ${c.hover} transition-all duration-300 group relative overflow-hidden`}>

                  {/* Hover orb */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{background:`radial-gradient(circle, ${f.glow} 0%, transparent 70%)`}} />

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div whileHover={{rotate:[0,-8,8,0]}} transition={{duration:0.4}}
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${c.icon}`}>
                      <Icon size={22} />
                    </motion.div>
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.14em] border px-2.5 py-1 rounded-full ${c.badge}`}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-text-primary mb-2.5">{f.title}</h3>
                  <p className="text-text-dim text-[13.5px] leading-relaxed mb-4">{f.body}</p>

                  {/* Detail footer */}
                  <div className="pt-3 border-t border-white/6 font-mono text-[10px] text-text-faint flex items-center gap-1.5">
                    <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{backgroundColor: f.color==="pink"?"#FF1D7E":f.color==="violet"?"#A472FF":f.color==="mint"?"#15CFA0":"#FFB347"}}
                      animate={{opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}} />
                    {f.detail}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TEACHER DASHBOARD ═══════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{opacity:0,x:-40}} whileInView={{opacity:1,x:0}} transition={{duration:0.8}} viewport={{once:true,margin:"-80px"}}>
              <Pill color="violet">Teacher command panel</Pill>
              <h2 className="font-display font-black text-4xl md:text-5xl mt-4 mb-4 leading-tight">
                Real-time visibility into<br /><span className="gradient-text-shift">every student's mind.</span>
              </h2>
              <p className="text-text-dim text-base md:text-lg leading-relaxed mb-6">
                The heatmap shows exactly where confusion fired across every student — not after class, during it. Pink = intervention. Amber = hesitation. Click any student for their cognitive profile, session history, and full signed delivery log.
              </p>
              <ul className="space-y-3 mb-8">
                {["Cognitive profile per student — visual, narrative, kinesthetic, sign",
                  "Live intervention log with modality-switch rationale from Gemini",
                  "Deaf & HoH tracker — signed sessions, translation latency, coverage",
                  "Export for IEP / 504 documentation"].map((item,i)=>(
                  <motion.li key={i} initial={{opacity:0,x:-15}} whileInView={{opacity:1,x:0}} transition={{delay:i*0.08}} viewport={{once:true}}
                    className="flex items-start gap-3 font-mono text-[11.5px] text-text-dim">
                    <Check size={14} className="text-accent-mint flex-shrink-0 mt-0.5" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <motion.button onClick={()=>navigate(user&&(user.role==="teacher"||user.role==="admin")?"/dashboard":"/signup?role=teacher")}
                  whileHover={{scale:1.03,y:-2}} whileTap={{scale:0.97}}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-accent-violet to-[#5a1fd4] text-white font-bold text-sm shadow-[0_6px_28px_rgba(123,47,247,0.45)] flex items-center gap-2">
                  <BarChart2 size={15} /> Open Teacher Dashboard
                </motion.button>
                <motion.button onClick={()=>navigate("/demo")} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                  className="px-7 py-3.5 rounded-full border border-white/12 text-text-dim hover:text-text-primary bg-white/[0.03] font-semibold text-sm flex items-center gap-2 transition-all">
                  <Play size={14} /> Watch full demo
                </motion.button>
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,x:40,scale:0.92}} whileInView={{opacity:1,x:0,scale:1}}
              transition={{duration:0.8}} viewport={{once:true,margin:"-80px"}}>
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ROLES ═══════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} viewport={{once:true,margin:"-80px"}}
            className="text-center mb-16">
            <Pill color="mint">One platform · four doors</Pill>
            <h2 className="font-display font-black text-4xl md:text-[62px] leading-[1.05] mt-4 mb-4">
              Who is NeuroPath for?
            </h2>
            <p className="text-text-dim text-lg max-w-xl mx-auto">Everyone who touches education gets a purpose-built experience — not the same interface stripped down.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((r,i)=>{
              const c=COLOR[r.color];
              return (
                <motion.div key={r.id}
                  initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
                  transition={{duration:0.6,delay:i*0.1}} viewport={{once:true,margin:"-50px"}}
                  whileHover={{y:-8}}
                  className={`glass-panel rounded-3xl p-6 border border-white/8 ${c.hover} transition-all duration-300 group flex flex-col cursor-pointer relative overflow-hidden`}
                  onClick={()=>navigate(r.path)}>

                  <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none"
                    style={{background:`radial-gradient(circle, ${r.color==="pink"?"rgba(255,29,126,0.2)":r.color==="violet"?"rgba(123,47,247,0.2)":r.color==="mint"?"rgba(21,207,160,0.2)":"rgba(255,179,71,0.2)"} 0%, transparent 70%)`}} />

                  <div className="text-4xl mb-4">{r.emoji}</div>
                  <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-1">{r.sub}</div>
                  <h3 className="font-display font-black text-2xl text-text-primary mb-2">{r.label}</h3>
                  <p className="text-text-dim text-sm leading-relaxed flex-1 mb-5 group-hover:text-text-primary/70 transition-colors">{r.body}</p>

                  <button onClick={e=>{e.stopPropagation();navigate(r.path);}}
                    className={`font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${c.icon.split(" ")[0]} group-hover:gap-2.5`}>
                    {r.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative z-10 py-28 px-6 md:px-16 mb-10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:50,scale:0.97}} whileInView={{opacity:1,y:0,scale:1}}
            transition={{duration:0.9}} viewport={{once:true}}
            className="relative glass-panel rounded-[44px] py-20 px-8 md:px-20 text-center overflow-hidden border border-white/10">

            {/* Animated border */}
            <motion.div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-pink to-transparent"
              animate={{opacity:[0.3,1,0.3]}} transition={{duration:3,repeat:Infinity}} />
            <motion.div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-violet to-transparent"
              animate={{opacity:[0.3,1,0.3]}} transition={{duration:3,repeat:Infinity,delay:1.5}} />

            <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
              style={{background:"radial-gradient(circle, rgba(255,29,126,0.12) 0%, transparent 65%)"}} />
            <div className="absolute -bottom-60 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
              style={{background:"radial-gradient(circle, rgba(123,47,247,0.1) 0%, transparent 65%)"}} />

            <div className="relative z-10">
              <motion.div animate={{rotate:[0,360]}} transition={{duration:18,repeat:Infinity,ease:"linear"}}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-pink to-accent-violet flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,29,126,0.5)]">
                <Brain size={26} className="text-white" />
              </motion.div>

              <h2 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-tight mb-5">
                It doesn't repeat itself louder.<br />
                <span className="gradient-text-shift">It switches language.</span>
              </h2>
              <p className="text-text-dim text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Whether your brain thinks in diagrams, stories, hands-on experiments, or sign language — NeuroPath finds it in under 2 minutes and teaches in it from the first lesson. No labels. No quizzes. No guessing.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-5">
                <motion.button onClick={goStart} whileHover={{scale:1.05,y:-3}} whileTap={{scale:0.97}}
                  className="group relative px-12 py-5 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-black text-lg shadow-[0_12px_50px_rgba(255,29,126,0.5)] overflow-hidden flex items-center gap-3">
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles size={20} />
                    {user?"Continue Learning":"Start for free — no card needed"}
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
                <motion.button onClick={()=>navigate("/login")} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                  className="px-12 py-5 rounded-full border border-white/12 text-text-dim hover:text-text-primary bg-white/[0.03] font-bold text-lg transition-all">
                  Sign in
                </motion.button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] text-text-faint">
                {[{i:Users,t:"Free to start"},{i:Shield,t:"FERPA · COPPA · GDPR-K"},{i:Hand,t:"5 sign language variants"},{i:Star,t:"WCAG 2.2 AA"}].map(({i:Icon,t})=>(
                  <div key={t} className="flex items-center gap-1.5"><Icon size={11} />{t}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative z-10 border-t border-white/8 py-10 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-base group">
            <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center shadow-[0_0_16px_rgba(255,29,126,0.4)] group-hover:shadow-[0_0_24px_rgba(255,29,126,0.6)] transition-all">
              <div className="w-2.5 h-2.5 rounded-full bg-dark-bg" />
            </div>
            <span className="group-hover:text-accent-pinkLight transition-colors">NeuroPath</span>
          </Link>
          <div className="flex flex-wrap gap-5 font-mono text-[11px] text-text-faint">
            {[{l:"Onboarding",p:"/onboarding"},{l:"Live Demo",p:"/demo"},{l:"Dashboard",p:"/dashboard"},{l:"Sign in",p:"/login"},{l:"Sign up",p:"/signup"}].map(({l,p})=>(
              <Link key={p} to={p} className="hover:text-text-primary transition-colors">{l}</Link>
            ))}
          </div>
          <div className="font-mono text-[10px] text-text-faint">© 2026 NeuroPath · Every learner.</div>
        </div>
      </footer>
    </div>
  );
}
