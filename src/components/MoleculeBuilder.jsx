import { useState, useEffect } from "react";
import { Sparkles, Play, RefreshCw } from "lucide-react";

export default function MoleculeBuilder({ lessonId, onChangeDepth }) {
  const [isSimulating, setIsSimulating] = useState(false);

  // 1. Newton's First Law simulation state
  const [fLeft, setFLeft] = useState(10);
  const [fRight, setFRight] = useState(10);
  const [velocity, setVelocity] = useState(0);
  const [position, setPosition] = useState(0);

  // 2. Photosynthesis builder state
  const [sunlight, setSunlight] = useState(50);
  const [co2, setCo2] = useState(40);
  const [water, setWater] = useState(50);
  const [rate, setRate] = useState(0);

  // Newton's physics loop
  useEffect(() => {
    if (lessonId !== "newtons-first-law" || !isSimulating) return;

    const interval = setInterval(() => {
      // Net force determines acceleration
      const netForce = fRight - fLeft;
      const acceleration = netForce * 0.1; // simplified mass coefficient
      
      setVelocity((prevVel) => {
        const nextVel = prevVel + acceleration;
        
        // update position based on velocity
        setPosition((prevPos) => {
          let nextPos = prevPos + nextVel * 0.4;
          // Boundary wrapping for demo smoothness
          if (nextPos > 150) nextPos = -150;
          if (nextPos < -150) nextPos = 150;
          return nextPos;
        });

        return nextVel;
      });

    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, fLeft, fRight, lessonId]);

  // Photosynthesis calculation engine
  useEffect(() => {
    if (lessonId !== "photosynthesis") return;

    // Rate is limited by the minimum reactant
    const glucoseRate = Math.min(sunlight, co2, water) * 1.5;
    setRate(Math.round(glucoseRate));

    if (onChangeDepth) {
      // Trigger telemetry updates
      const depth = Math.min(1, (sunlight + co2 + water) / 250);
      onChangeDepth(depth);
    }
  }, [sunlight, co2, water, lessonId]);

  const handleResetNewton = () => {
    setFLeft(10);
    setFRight(10);
    setVelocity(0);
    setPosition(0);
    setIsSimulating(false);
    if (onChangeDepth) onChangeDepth(0.1);
  };

  const handleSliderChange = (type, val) => {
    if (type === "left") {
      setFLeft(val);
    } else {
      setFRight(val);
    }
    
    if (onChangeDepth) {
      // Telemetry: difference in sliders shows interaction depth
      const depth = Math.min(1, Math.abs(fLeft - fRight) / 20 + 0.3);
      onChangeDepth(depth);
    }
  };

  if (lessonId === "newtons-first-law") {
    const netForce = fRight - fLeft;

    return (
      <div className="w-full flex flex-col items-center bg-dark-card border border-white/5 rounded-2xl p-5 text-left">
        <div className="flex justify-between items-center mb-4 w-full">
          <h4 className="font-display font-semibold text-sm text-text-primary">Inertia Physics Sandbox</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1 ${
                isSimulating 
                  ? "bg-accent-pink/15 border-accent-pink/30 text-accent-pink" 
                  : "bg-white/5 border-white/10 text-text-dim hover:text-text-primary"
              }`}
            >
              <Play size={12} />
              {isSimulating ? "Pause" : "Start"}
            </button>
            <button
              onClick={handleResetNewton}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-text-dim hover:text-text-primary text-xs flex items-center"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Viewport Box slider */}
        <div className="w-full h-[100px] bg-dark-bg/40 border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-white/10" />
          
          {/* Draggable box mass representation */}
          <div 
            className="w-12 h-12 rounded-lg border-2 bg-dark-card2 flex flex-col items-center justify-center z-10 transition-transform duration-75 relative shadow-[0_0_12px_rgba(123,47,247,0.15)]"
            style={{ 
              transform: `translateX(${position}px)`,
              borderColor: netForce === 0 ? "rgba(255,255,255,0.15)" : netForce > 0 ? "var(--mint)" : "var(--pink)"
            }}
          >
            <span className="font-mono text-[9px] text-text-dim">M=5kg</span>
            <span className="font-mono text-[8px] text-text-faint">v={velocity.toFixed(1)}</span>
            
            {/* Visual speed arrows */}
            {velocity !== 0 && (
              <div 
                className={`absolute w-4 h-1 top-1/2 -translate-y-1/2 ${velocity > 0 ? "right-[-12px]" : "left-[-12px]"}`}
              >
                <span className={`block w-full h-full rounded ${velocity > 0 ? "bg-accent-mint animate-pulse" : "bg-accent-pink animate-pulse"}`} />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 mt-5 w-full">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-text-dim">F1 (Left Push):</span>
              <span className="text-accent-pink font-semibold">{fLeft} Newtons</span>
            </div>
            <input 
              type="range"
              min="0"
              max="20"
              value={fLeft}
              onChange={(e) => handleSliderChange("left", parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-text-dim">F2 (Right Push):</span>
              <span className="text-accent-mint font-semibold">{fRight} Newtons</span>
            </div>
            <input 
              type="range"
              min="0"
              max="20"
              value={fRight}
              onChange={(e) => handleSliderChange("right", parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-mint"
            />
          </div>
        </div>

        {/* Status readouts */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center w-full font-mono text-[11px]">
          <div className="flex items-center gap-1">
            <span className="text-text-faint">Net Force:</span>
            <span className={`font-bold ${netForce === 0 ? "text-text-dim" : netForce > 0 ? "text-accent-mint" : "text-accent-pink"}`}>
              {netForce} N {netForce > 0 ? "➔" : netForce < 0 ? "⬅" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-text-faint">Acceleration:</span>
            <span className="text-text-primary font-semibold">{(netForce * 0.2).toFixed(2)} m/s²</span>
          </div>
        </div>
      </div>
    );
  }

  if (lessonId === "photosynthesis") {
    return (
      <div className="w-full flex flex-col items-center bg-dark-card border border-white/5 rounded-2xl p-5 text-left">
        <h4 className="font-display font-semibold text-sm text-text-primary mb-4 w-full">Photosynthesis Synthesizer</h4>

        {/* Output Speedometer Rate bar */}
        <div className="w-full p-4 bg-dark-bg/40 border border-white/5 rounded-xl flex flex-col items-center justify-center mb-5">
          <span className="font-mono text-[10px] text-text-faint uppercase mb-1">Glucose Yield Rate</span>
          <div className="font-display font-bold text-3xl text-accent-mint flex items-baseline gap-1 animate-pulse">
            {rate}
            <span className="text-xs font-mono text-text-dim font-normal">mg/min</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent-pink to-accent-mint transition-all duration-300"
              style={{ width: `${Math.min(100, rate / 1.5)}%` }}
            />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 w-full">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-text-dim">Light Intensity:</span>
              <span className="text-accent-amber font-semibold">{sunlight}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={sunlight}
              onChange={(e) => setSunlight(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-amber"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-text-dim">Carbon Dioxide (CO2):</span>
              <span className="text-accent-pinkLight font-semibold">{co2}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={co2}
              onChange={(e) => setCo2(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-pink"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-text-dim">Water Absorption:</span>
              <span className="text-accent-violetLight font-semibold">{water}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={water}
              onChange={(e) => setWater(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-violet"
            />
          </div>
        </div>
      </div>
    );
  }

  // Generic variable simulator — works for any AI-generated lesson
  const [varA, setVarA] = useState(50);
  const [varB, setVarB] = useState(50);
  const output = Math.round((varA * 0.6 + varB * 0.4) * 0.85);

  // Generic fallback for any lesson not explicitly handled
  return (
    <div className="w-full flex flex-col items-center bg-dark-card border border-white/5 rounded-2xl p-5 text-left">
      <h4 className="font-display font-semibold text-sm text-text-primary mb-1 w-full">Interactive Variable Explorer</h4>
      <p className="text-text-faint text-xs font-mono mb-5 w-full">Adjust the inputs and observe how the output metric responds.</p>

      <div className="w-full p-4 bg-dark-bg/40 border border-white/5 rounded-xl flex flex-col items-center justify-center mb-5">
        <span className="font-mono text-[10px] text-text-faint uppercase mb-1">Computed Output</span>
        <div className="font-display font-bold text-3xl text-accent-violet">
          {output}<span className="text-xs font-mono text-text-dim font-normal ml-1">units</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-accent-violet to-accent-mint transition-all duration-300"
            style={{ width: `${output}%` }} />
        </div>
      </div>

      <div className="space-y-4 w-full">
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-text-dim">Input Variable A:</span>
            <span className="text-accent-violetLight font-semibold">{varA}%</span>
          </div>
          <input type="range" min="0" max="100" value={varA}
            onChange={(e) => { setVarA(parseInt(e.target.value)); if(onChangeDepth) onChangeDepth(Math.abs(varA-varB)/100); }}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-violet" />
        </div>
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-text-dim">Input Variable B:</span>
            <span className="text-accent-mint font-semibold">{varB}%</span>
          </div>
          <input type="range" min="0" max="100" value={varB}
            onChange={(e) => { setVarB(parseInt(e.target.value)); if(onChangeDepth) onChangeDepth(Math.abs(varA-varB)/100); }}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-mint" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center w-full font-mono text-[11px]">
        <span className="text-text-faint">Relationship:</span>
        <span className={`font-bold ${varA > varB ? "text-accent-violet" : "text-accent-mint"}`}>
          {varA === varB ? "Balanced" : varA > varB ? "A dominates" : "B dominates"}
        </span>
      </div>
    </div>
  );
}
