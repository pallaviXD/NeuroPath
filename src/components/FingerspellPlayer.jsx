import React, { useState, useEffect } from "react";

export default function FingerspellPlayer({ word, playing = true }) {
  const [index, setIndex] = useState(0);

  // Clean the word: only letters
  const letters = (word || "").toUpperCase().replace(/[^A-Z]/g, "").split("");

  useEffect(() => {
    // Reset when word changes
    setIndex(0);
  }, [word]);

  useEffect(() => {
    if (!playing || letters.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        // Stop at the last letter, or loop? Let's loop with a pause.
        // Actually, let's just cycle through.
        if (prev >= letters.length - 1) {
          // Add a slight pause by holding the last letter, then looping
          return 0;
        }
        return prev + 1;
      });
    }, 700); // 700ms per letter

    return () => clearInterval(interval);
  }, [letters.length, playing]);

  if (letters.length === 0) {
    return null; // or a fallback
  }

  const currentLetter = letters[index];
  const charCode = currentLetter.charCodeAt(0) - 65; // A=0
  const cols = 6;
  const rows = 5;
  const col = charCode % cols;
  const row = Math.floor(charCode / cols);

  // Calculate percentage positions for CSS sprite
  const bgPosX = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const bgPosY = rows > 1 ? (row / (rows - 1)) * 100 : 0;

  const ALAMY_URL = "/asl-alamy.jpg";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Glow */}
        <div 
          className="absolute inset-0 opacity-20 blur-2xl transition-all duration-300"
          style={{ background: "#15CFA0" }}
        />
        <div
          className="w-[110px] h-[140px] relative z-10 transition-transform duration-200 shadow-xl overflow-hidden bg-black"
          style={{
            backgroundImage: `url(${ALAMY_URL})`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            border: "2px solid rgba(21, 207, 160, 0.4)"
          }}
        />
      </div>
      
      {/* Word track showing spelling progress */}
      <div className="mt-3 flex gap-1">
        {letters.map((char, i) => (
          <span 
            key={i} 
            className={`font-mono text-xs uppercase transition-colors duration-200 ${
              i === index 
                ? "text-accent-mint font-bold scale-110" 
                : i < index 
                  ? "text-accent-mint/50" 
                  : "text-text-faint"
            }`}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
