import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, HelpCircle, ArrowRight, Activity, VolumeX } from "lucide-react";
import { useStore } from "../store/useStore";
import SigningAvatar from "../components/SigningAvatar";

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    studentProfile,
    telemetry,
    incrementHoverTime,
    updateInteractionDepth,
    recordClick,
    setDeafOrHoh,
    clearTelemetry,
    computeCognitiveProfile
  } = useStore();

  const [activeHoverModality, setActiveHoverModality] = useState(null);
  const [secsRemaining, setSecsRemaining] = useState(25);
  const [isCalculated, setIsCalculated] = useState(false);
  const [explicitSignPref, setExplicitSignPref] = useState(studentProfile.deafOrHoh);
  
  // Ref to track scroll depth in Narrative story
  const storyScrollRef = useRef(null);

  // Kinesthetic slider state
  const [gravityMass, setGravityMass] = useState(50);

  // Onboarding gravity sign sequence
  const gravityGloss = [
    { gloss: "EARTH", duration: 800 },
    { gloss: "PULL", duration: 700 },
    { gloss: "OBJECT", duration: 700 },
    { gloss: "DOWN", duration: 600 }
  ];

  // 1. Initialize onboarding page state
  useEffect(() => {
    clearTelemetry();
    setIsCalculated(false);
  }, []);

  // 2. Active timer for telemetry hover incrementation (checks every 100ms)
  useEffect(() => {
    if (isCalculated) return;
    
    const interval = setInterval(() => {
      if (activeHoverModality) {
        // Increment active tile hover time by 0.1s
        incrementHoverTime(activeHoverModality, 0.1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeHoverModality, isCalculated]);

  // 3. Countdown timer
  useEffect(() => {
    if (isCalculated || secsRemaining <= 0) return;

    const timer = setTimeout(() => {
      setSecsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secsRemaining, isCalculated]);

  // 4. Handle Narrative Scroll Depth
  const handleStoryScroll = () => {
    if (!storyScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = storyScrollRef.current;
    const totalScrollable = scrollHeight - clientHeight;
    if (totalScrollable <= 0) return;
    const depthRatio = Math.min(1, scrollTop / totalScrollable);
    updateInteractionDepth("narrative", depthRatio);
  };

  // 5. Handle Kinesthetic slider change
  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setGravityMass(val);
    recordClick("kinesthetic");
    // Slider adjustment tracks interaction depth (range from 0 to 1 based on absolute deviations)
    const normalizedDepth = Math.min(1, Math.abs(val - 50) / 40);
    updateInteractionDepth("kinesthetic", normalizedDepth);
  };

  // 6. Handle Explicit sign preference toggle
  const handleSignToggle = (e) => {
    const checked = e.target.checked;
    setExplicitSignPref(checked);
    setDeafOrHoh(checked);
    recordClick("sign");
    updateInteractionDepth("sign", 1.0);
  };

  // 7. Trigger Cognitive calculation
  const handleCalculate = () => {
    computeCognitiveProfile();
    setIsCalculated(true);
  };

  // 8. Visual hover items
  const [hoveredNode, setHoveredNode] = useState(null);
  const triggerVisualHover = (nodeId) => {
    setHoveredNode(nodeId);
    recordClick("visual");
    updateInteractionDepth("visual", 1.0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-28 pb-20 px-6 md:px-16 flex flex-col items-center">
      {/* Title Header */}
      <div className="text-center max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/35 px-4 py-1.5 rounded-full mb-4 uppercase">
          <Activity size={12} className="text-accent-pink" />
          Onboarding Telemetry Active
        </div>
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight mb-4">
          Cognitive Fingerprinting
        </h1>
        <p className="text-text-dim text-sm md:text-base leading-relaxed">
          Interact naturally with the concept of **Gravity** shown in the four tiles below. 
          Our algorithm maps your gaze (hover times), interaction depth, and toggles in real time to capture your cognitive profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: 2x2 Telemetry Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. VISUAL TILE */}
          <div
            onMouseEnter={() => !isCalculated && setActiveHoverModality("visual")}
            onMouseLeave={() => !isCalculated && setActiveHoverModality(null)}
            className={`glass-card rounded-[22px] p-6 flex flex-col justify-between min-h-[300px] border transition-all duration-300 ${
              activeHoverModality === "visual" && !isCalculated
                ? "border-accent-pink bg-dark-card/60 shadow-glowPink" 
                : "border-white/5 bg-dark-card/30"
            }`}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">📊</span>
                <span className="font-mono text-[10px] text-text-faint uppercase">Modality: Visual</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">Visual Force Vector</h3>
              <p className="text-[13px] text-text-dim leading-relaxed mb-4">
                Hover over the items to explore the force lines.
              </p>
              
              {/* Interactive Vector SVG */}
              <div className="w-full h-[120px] bg-dark-bg/40 border border-white/5 rounded-xl flex items-center justify-center relative p-3">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  {/* Earth center */}
                  <circle cx="50" cy="50" r="18" fill="#15101D" stroke="#7B2FF7" strokeWidth="2" />
                  <text x="50" y="54" textAnchor="middle" fill="#A472FF" fontSize="7" fontWeight="bold" fontFamily="monospace">EARTH</text>
                  
                  {/* Pull vector line */}
                  <line x1="140" y1="50" x2="74" y2="50" stroke="#FF1D7E" strokeWidth="2" strokeDasharray="3 3" />
                  <polygon points="74,50 82,46 82,54" fill="#FF1D7E" />

                  {/* Mass object */}
                  <circle 
                    cx="140" 
                    cy="50" 
                    r="8" 
                    fill="#FF1D7E" 
                    className="cursor-pointer hover:scale-110 transition-transform" 
                    onMouseEnter={() => triggerVisualHover("apple")}
                  />
                  <text x="140" y="40" textAnchor="middle" fill="#FF1D7E" fontSize="6" fontFamily="sans-serif">Mass (Apple)</text>
                </svg>

                {/* Subtitle popup */}
                {hoveredNode === "apple" && (
                  <div className="absolute bottom-2 left-2 right-2 bg-dark-bg/90 border border-accent-pink/30 p-2 rounded text-[11px] text-text-dim text-left">
                    <strong>Gravitational Pull:</strong> Earth's mass bends space-time, creating a pull vector acting directly on the apple's center.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between font-mono text-[10.5px] text-text-faint">
              <span>Time: {Math.round(telemetry.hoverTime.visual || 0)}s</span>
              <span>Focus: {Math.round((telemetry.interactionDepth.visual || 0) * 100)}%</span>
            </div>
          </div>

          {/* 2. NARRATIVE TILE */}
          <div
            onMouseEnter={() => !isCalculated && setActiveHoverModality("narrative")}
            onMouseLeave={() => !isCalculated && setActiveHoverModality(null)}
            className={`glass-card rounded-[22px] p-6 flex flex-col justify-between min-h-[300px] border transition-all duration-300 ${
              activeHoverModality === "narrative" && !isCalculated
                ? "border-accent-amber/50 bg-dark-card/60 shadow-[0_0_24px_rgba(255,179,71,0.25)]" 
                : "border-white/5 bg-dark-card/30"
            }`}
          >
            <div className="text-left flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📖</span>
                  <span className="font-mono text-[10px] text-text-faint uppercase">Modality: Narrative</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-2">The Falling Apple Analogy</h3>
              </div>

              {/* Scrollable text container */}
              <div 
                ref={storyScrollRef}
                onScroll={handleStoryScroll}
                className="w-full h-[120px] overflow-y-auto pr-2 bg-dark-bg/40 border border-white/5 rounded-xl p-3 text-[12.5px] text-text-dim leading-relaxed scrollbar-thin text-left"
              >
                Isaac Newton sat underneath a shady apple tree on a quiet summer afternoon. He was drinking hot tea and thinking about the moon. 
                <br /><br />
                Suddenly, a plump red apple snapped from its branch. It didn't float sideways, and it didn't drift upwards. It fell straight down, landing with a soft thud on the grass.
                <br /><br />
                Newton realized that the same invisible leash that pulled the apple to the soil was also keeping the moon locked in its orbit around Earth. Gravity wasn't just a local push — it was a universal bond connecting all matter in the cosmos.
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between font-mono text-[10.5px] text-text-faint">
              <span>Time: {Math.round(telemetry.hoverTime.narrative || 0)}s</span>
              <span>Read depth: {Math.round((telemetry.interactionDepth.narrative || 0) * 100)}%</span>
            </div>
          </div>

          {/* 3. KINESTHETIC TILE */}
          <div
            onMouseEnter={() => !isCalculated && setActiveHoverModality("kinesthetic")}
            onMouseLeave={() => !isCalculated && setActiveHoverModality(null)}
            className={`glass-card rounded-[22px] p-6 flex flex-col justify-between min-h-[300px] border transition-all duration-300 ${
              activeHoverModality === "kinesthetic" && !isCalculated
                ? "border-accent-violet/50 bg-dark-card/60 shadow-glowViolet" 
                : "border-white/5 bg-dark-card/30"
            }`}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🧪</span>
                <span className="font-mono text-[10px] text-text-faint uppercase">Modality: Kinesthetic</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">Mass pull Simulator</h3>
              <p className="text-[13px] text-text-dim leading-relaxed mb-4">
                Drag the mass slider to see how force changes.
              </p>
              
              {/* Physics simulator mockup */}
              <div className="w-full h-[120px] bg-dark-bg/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[11px] text-text-dim">Object Mass:</span>
                  <span className="font-mono text-[12px] text-accent-violetLight font-bold">{gravityMass} kg</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={gravityMass}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-violet"
                />
                
                <div className="mt-3 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-text-faint">Force Pull Vector:</span>
                  <span className="text-accent-pink font-semibold">{(gravityMass * 9.8).toFixed(1)} Newtons</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between font-mono text-[10.5px] text-text-faint">
              <span>Time: {Math.round(telemetry.hoverTime.kinesthetic || 0)}s</span>
              <span>Interactions: {Math.round((telemetry.interactionDepth.kinesthetic || 0) * 100)}%</span>
            </div>
          </div>

          {/* 4. SIGN LANGUAGE TILE */}
          <div
            onMouseEnter={() => !isCalculated && setActiveHoverModality("sign")}
            onMouseLeave={() => !isCalculated && setActiveHoverModality(null)}
            className={`glass-card rounded-[22px] p-6 flex flex-col justify-between min-h-[300px] border transition-all duration-300 ${
              activeHoverModality === "sign" && !isCalculated
                ? "border-accent-mint/50 bg-dark-card/60 shadow-glowMint" 
                : "border-white/5 bg-dark-card/30"
            }`}
          >
            <div className="text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🤟</span>
                <span className="font-mono text-[10px] text-text-faint uppercase">Modality: Sign Language</span>
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary mb-2">3D Sign Explainer</h3>
              
              <div className="w-full mt-2">
                <SigningAvatar glossSequence={gravityGloss} />
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between font-mono text-[10.5px] text-text-faint">
              <span>Time: {Math.round(telemetry.hoverTime.sign || 0)}s</span>
              <span>Toggles: {Math.round((telemetry.interactionDepth.sign || 0) * 100)}%</span>
            </div>
          </div>

        </div>

        {/* Right Side: Telemetry Metrics & Fingerprint Calculations */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Explicit Sign Preference Override Toggle */}
          <div className="glass-panel rounded-2xl p-6 text-left border border-white/10">
            <h3 className="font-display font-bold text-[15px] mb-3 text-text-primary flex items-center gap-2">
              <VolumeX className="text-accent-pink" size={16} />
              Accessibility Profile
            </h3>
            <p className="text-[12.5px] text-text-dim leading-relaxed mb-4">
              If you are Deaf or hard-of-hearing, toggle below. This will override behavior tracking and lock your primary modality to Sign Language explanations.
            </p>
            <label className="flex items-center gap-3 cursor-pointer group text-sm select-none">
              <input 
                type="checkbox"
                checked={explicitSignPref}
                onChange={handleSignToggle}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-pink focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-text-dim group-hover:text-text-primary transition-colors">
                Prefer sign language explanations
              </span>
            </label>
          </div>

          {/* Telemetry Control Panel */}
          <div className="glass-panel rounded-2xl p-6 text-left border border-white/10 flex-1 flex flex-col justify-between min-h-[260px]">
            <div>
              <h3 className="font-display font-bold text-[15px] mb-2 text-text-primary flex items-center gap-2">
                <Activity className="text-accent-mint" size={16} />
                Telemetry Stats
              </h3>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-faint">Visual Gaze weight:</span>
                  <span className="font-mono text-text-primary font-bold">{Math.round(telemetry.hoverTime.visual)}s</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-faint">Narrative Story scroll:</span>
                  <span className="font-mono text-text-primary font-bold">{Math.round((telemetry.interactionDepth.narrative || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-faint">Kinesthetic Depth:</span>
                  <span className="font-mono text-text-primary font-bold">{Math.round((telemetry.interactionDepth.kinesthetic || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-faint">Sign Interaction:</span>
                  <span className="font-mono text-text-primary font-bold">{Math.round((telemetry.interactionDepth.sign || 0) * 100)}%</span>
                </div>
              </div>

              {/* Ticking analysis notification */}
              {!isCalculated && (
                <div className="mt-6 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                  {secsRemaining > 0 ? (
                    <div className="font-mono text-[12px] text-accent-amber animate-pulse">
                      Analyzing behavior... ({secsRemaining}s left)
                    </div>
                  ) : (
                    <div className="font-mono text-[12px] text-accent-mint font-semibold">
                      Telemetry scan complete. Ready to compute.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6">
              {!isCalculated ? (
                <button
                  onClick={handleCalculate}
                  disabled={secsRemaining > 0 && Object.values(telemetry.hoverTime).reduce((a, b) => a + b, 0) < 5}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-semibold text-sm shadow-[0_6px_24px_rgba(255,29,126,0.2)] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_10px_32px_rgba(255,29,126,0.35)] transition-all flex items-center justify-center gap-1.5"
                >
                  Generate Cognitive Fingerprint
                  <ArrowRight size={14} />
                </button>
              ) : (
                <div className="w-full text-center">
                  <button
                    onClick={() => navigate("/lesson/newtons-first-law")}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-accent-mint to-[#11a680] text-dark-bg font-semibold text-sm shadow-[0_6px_24px_rgba(21,207,160,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    Unlock Adaptive Classroom
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results reveal sheet */}
      <AnimatePresence>
        {isCalculated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mt-10 glass-panel rounded-[28px] p-8 border border-white/10 text-left relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-[300px] h-[300px] rounded-full bg-accent-mint/15 blur-3xl" />
            <h3 className="font-display font-bold text-xl md:text-2xl text-text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="text-accent-mint" size={24} />
              Fingerprint Calculated!
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div>
                <span className="font-mono text-xs text-text-faint uppercase block mb-1">Primary Modality</span>
                <span className="font-display font-bold text-3xl text-accent-mint capitalize">
                  {studentProfile.primary} Learner
                </span>
                <span className="block font-mono text-xs text-text-dim mt-2">
                  Confidence Score: <strong>{studentProfile.confidence}%</strong>
                </span>
              </div>

              {/* Confidence bars chart */}
              <div className="md:col-span-2 space-y-3">
                <span className="font-mono text-xs text-text-faint uppercase block mb-2">Modality Profile Breakdown</span>
                
                {/* Visual */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-text-dim">Visual:</span>
                    <span className="text-text-primary">{studentProfile.breakdown.visual}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-pink" style={{ width: `${studentProfile.breakdown.visual}%` }} />
                  </div>
                </div>

                {/* Narrative */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-text-dim">Narrative:</span>
                    <span className="text-text-primary">{studentProfile.breakdown.narrative}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-amber" style={{ width: `${studentProfile.breakdown.narrative}%` }} />
                  </div>
                </div>

                {/* Kinesthetic */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-text-dim">Kinesthetic:</span>
                    <span className="text-text-primary">{studentProfile.breakdown.kinesthetic}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-violet" style={{ width: `${studentProfile.breakdown.kinesthetic}%` }} />
                  </div>
                </div>

                {/* Sign Language */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-text-dim">Sign Language:</span>
                    <span className="text-text-primary">{studentProfile.breakdown.sign}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-mint" style={{ width: `${studentProfile.breakdown.sign}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
