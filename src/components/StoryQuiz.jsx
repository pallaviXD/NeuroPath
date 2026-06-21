import { useState } from "react";

export default function StoryQuiz({ onComplete }) {
  const [reading, setReading] = useState(true);
  const [startTime] = useState(Date.now());
  const [readTimeMs, setReadTimeMs] = useState(0);

  const story = (
    <div className="space-y-4">
      <p>
        Detective Vance arrived at the gallery at midnight. The famous Star Diamond was missing. The glass case was shattered, and muddy boot prints led straight from the exhibit to a broken window. The alarm wires had been snipped clean. The museum curator, Mr. Hodges, was shivering in the corner, claiming he saw a tall man in a dark coat smash the glass and run out into the stormy night.
      </p>
      <p>
        Vance inspected the scene closely. It had been pouring rain for hours, yet the muddy boot prints on the carpet were perfectly dry. Furthermore, the shattered glass from the window lay entirely outside on the wet pavement. Vance turned to Hodges, noticing a faint grease stain on the man's left cuff. "You can stop shivering, Mr. Hodges," Vance said calmly.
      </p>
    </div>
  );

  const handleFinishReading = () => {
    setReadTimeMs(Date.now() - startTime);
    setReading(false);
  };

  const handleAnswer = (answer) => {
    const isCorrect = answer === "The window glass was found outside";
    onComplete({
      modality: "narrative",
      timeMs: readTimeMs,
      accuracy: isCorrect ? 1 : 0
    });
  };

  if (reading) {
    return (
      <div className="w-full max-w-xl mx-auto text-center">
        <h2 className="font-display font-bold text-2xl mb-4 text-text-primary">Read the Story</h2>
        <div className="p-6 rounded-2xl border border-white/10 bg-dark-card/40 mb-6 text-left leading-relaxed text-text-dim">
          {story}
        </div>
        <button onClick={handleFinishReading} className="w-full py-4 rounded-xl bg-accent-violet/20 text-accent-violet border border-accent-violet/30 hover:bg-accent-violet/30 transition-all font-bold cursor-pointer">
          I'm Finished Reading
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto text-center">
      <h2 className="font-display font-bold text-2xl mb-4 text-text-primary">Analytical Check</h2>
      <p className="mb-6 text-text-dim text-lg">What was the primary clue that proved the break-in was staged from the inside?</p>
      <div className="space-y-3">
        {[
          "The thief wore a dark coat", 
          "The window glass was found outside", 
          "The alarm wires were snipped clean", 
          "Mr. Hodges was shivering"
        ].map((opt) => (
          <button key={opt} onClick={() => handleAnswer(opt)} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent-mint/50 transition-all text-lg cursor-pointer">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
