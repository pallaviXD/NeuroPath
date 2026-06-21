import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export default function BalloonGame({ onComplete }) {
  const [gameState, setGameState] = useState("demo"); // demo, playing, finished
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [trialsUsed, setTrialsUsed] = useState(0);

  const containerRef = useRef(null);
  const balloonIdRef = useRef(0);

  // Demo cursor animation state
  const [demoPos, setDemoPos] = useState({ x: 150, y: 150 });
  const [demoClicked, setDemoClicked] = useState(false);

  useEffect(() => {
    if (gameState === "demo") {
      const demoInterval = setInterval(() => {
        setDemoPos({ x: 50 + Math.random() * 200, y: 50 + Math.random() * 100 });
        setTimeout(() => setDemoClicked(true), 1000);
        setTimeout(() => setDemoClicked(false), 1200);
      }, 2000);
      return () => clearInterval(demoInterval);
    }

    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState("finished");
            setTrialsUsed(prev => prev + 1);
            return 0;
          }

          if (containerRef.current) {
            const width = containerRef.current.clientWidth - 60;
            let count = 1;
            if (t > 57) count = 1; // 1 balloon for warmup
            else if (t > 10) count = Math.floor(Math.random() * 2) + 1; // 1-2 balloons
            else count = 2; // 2 balloons during frenzy

            for (let i = 0; i < count; i++) {
              setTimeout(() => {
                const newBalloon = {
                  id: balloonIdRef.current++,
                  x: Math.random() * width,
                  color: ["#7B2FF7", "#15CFA0", "#F72F8B", "#FFB020"][Math.floor(Math.random() * 4)]
                };
                setBalloons(prev => [...prev, newBalloon]);
                setTotalSpawned(prev => prev + 1);

                setTimeout(() => {
                  setBalloons(prev => prev.filter(b => b.id !== newBalloon.id));
                }, 4000);
              }, Math.random() * (t <= 10 ? 400 : 900)); // Faster alternate sequence in last 10s
            }
          }

          return t - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [gameState]);

  const handlePop = (id) => {
    if (gameState !== "playing") return;
    setScore(s => s + 1);
    setBalloons(prev => prev.filter(b => b.id !== id));
  };

  const handleStart = () => {
    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    setTotalSpawned(0);
    setBalloons([]);
  };

  const handleSubmit = () => {
    onComplete({
      modality: "kinesthetic",
      timeMs: 60000,
      accuracy: totalSpawned > 0 ? score / totalSpawned : 0
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {gameState === "demo" && (
        <div className="mb-6 text-center">
          <h2 className="font-display font-bold text-2xl mb-2 text-text-primary">Balloon Pop Demo</h2>
          <p className="text-text-dim text-sm mb-4">Watch the bot pop the balloons. You'll have 60 seconds to pop as many as you can!</p>
          <div className="relative w-full max-w-md h-64 border border-white/20 rounded-xl bg-dark-bg overflow-hidden mx-auto">
            {/* Demo Balloon */}
            <motion.div 
              className="absolute w-12 h-14 rounded-[50%] bg-accent-pink shadow-[0_0_15px_var(--pink)]"
              animate={{ x: demoPos.x, y: demoPos.y }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Demo Cursor */}
            <motion.div 
              className="absolute z-10 text-white"
              animate={{ x: demoPos.x + 10, y: demoPos.y + 10, scale: demoClicked ? 0.8 : 1 }}
              transition={{ duration: 0.8 }}
            >
              <MousePointer2 size={24} className={demoClicked ? "text-accent-mint" : "text-white"} />
            </motion.div>
          </div>
          <button onClick={handleStart} className="mt-6 w-full py-4 rounded-xl bg-accent-violet text-white font-bold hover:bg-accent-violetLight transition-colors cursor-pointer">
            Start First Trial
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-4 px-4 font-mono">
            <span className="text-accent-pink text-lg font-bold">Time: {timeLeft}s</span>
            <span className="text-accent-mint text-lg font-bold">Score: {score}</span>
          </div>
          <div ref={containerRef} className="relative w-full h-[400px] border border-white/20 rounded-xl bg-dark-bg overflow-hidden cursor-crosshair">
            <AnimatePresence>
              {balloons.map(b => (
                <motion.div
                  key={b.id}
                  initial={{ y: -100, x: b.x, scale: 1 }}
                  animate={{ y: 450, x: b.x + (Math.random() * 60 - 30) }}
                  exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ duration: 4.0 + Math.random() * 2.0, ease: "linear" }}
                  onPointerDown={() => handlePop(b.id)}
                  className="absolute w-20 h-24 rounded-[50%]"
                  style={{ backgroundColor: b.color, boxShadow: `0 0 20px ${b.color}80` }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="text-center w-full">
          <h2 className="font-display font-bold text-3xl mb-4 text-text-primary">Time's Up!</h2>
          <p className="text-xl mb-2 text-text-dim">You popped <strong className="text-accent-mint">{score}</strong> balloons.</p>
          <p className="text-sm text-text-faint mb-8">Accuracy: {Math.round((score / totalSpawned) * 100) || 0}%</p>
          
          <div className="flex gap-4">
            {trialsUsed < 2 ? (
              <button onClick={handleStart} className="flex-1 py-4 rounded-xl border border-accent-amber/50 text-accent-amber hover:bg-accent-amber/10 transition-colors font-bold cursor-pointer">
                Retry (1 attempt left)
              </button>
            ) : (
              <div className="flex-1 py-4 rounded-xl border border-white/10 text-text-faint bg-white/5 font-bold cursor-not-allowed">
                No Retries Left
              </div>
            )}
            <button onClick={handleSubmit} className="flex-1 py-4 rounded-xl bg-accent-violet text-white font-bold hover:bg-accent-violetLight transition-colors cursor-pointer">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
