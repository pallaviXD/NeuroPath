import { useState } from "react";
import { useStore } from "../../store/useStore";
import SigningAvatar from "../../components/SigningAvatar";
import { Hand, PlayCircle, Eye, Info } from "lucide-react";

export default function SignLanguageView() {
  const students = useStore((state) => state.dashboardStudents);
  const [selectedSequence, setSelectedSequence] = useState("gravity");

  // Filter deaf or sign-preferred students
  const signStudents = students.filter(s => s.profile.primary === "sign" || s.deafOrHoh);

  // Sequences list for teacher preview
  const sequences = {
    gravity: [
      { gloss: "EARTH", duration: 800 },
      { gloss: "PULL", duration: 700 },
      { gloss: "OBJECT", duration: 700 },
      { gloss: "DOWN", duration: 600 }
    ],
    inertia: [
      { gloss: "OBJECT", duration: 800 },
      { gloss: "STAY", duration: 600 },
      { gloss: "SAME", duration: 800 },
      { gloss: "UNTIL", duration: 500 },
      { gloss: "PUSH", duration: 900 },
      { gloss: "CHANGES", duration: 700 }
    ],
    photosynthesis: [
      { gloss: "SUNLIGHT", duration: 900 },
      { gloss: "ABSORB", duration: 700 },
      { gloss: "WATER", duration: 500 },
      { gloss: "GAS", duration: 600 },
      { gloss: "MAKE", duration: 800 },
      { gloss: "SUGAR", duration: 600 }
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] text-text-faint uppercase block mb-1">Deaf / Sign Learners</span>
            <span className="font-display font-bold text-2xl text-text-primary">{signStudents.length}</span>
          </div>
          <Hand className="text-accent-mint" size={24} />
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] text-text-faint uppercase block mb-1">Signed Interventions</span>
            <span className="font-display font-bold text-2xl text-accent-pinkLight">12</span>
          </div>
          <PlayCircle className="text-accent-pink" size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sign-preferred Students List */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/5 text-left">
          <h4 className="font-display font-bold text-sm text-text-primary mb-4">Deaf &amp; Sign-Preferred Students</h4>
          
          <div className="space-y-3">
            {signStudents.map((s) => (
              <div 
                key={s.id}
                className="p-3.5 bg-white/[0.02] border border-white/5 hover:border-accent-mint/30 rounded-xl flex items-center justify-between hover:bg-white/[0.04] transition-all"
              >
                <div>
                  <div className="text-xs font-semibold text-text-primary">{s.name}</div>
                  <div className="font-mono text-[9.5px] text-text-faint mt-1 uppercase">
                    Confidence: {s.profile.confidence}% · {s.deafOrHoh ? "Deaf" : "Sign-preferred"}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-2.5 py-0.5 rounded-full uppercase">
                  ACTIVE
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 3D Gloss Sequencer previewer */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/5 text-left flex flex-col justify-between min-h-[360px]">
          <div>
            <h4 className="font-display font-bold text-sm text-text-primary mb-1">Signed Translation previewer</h4>
            <p className="text-[11.5px] text-text-faint mb-5">
              Select generated lesson gloss translation lists to preview the corresponding 3D avatar gestures.
            </p>

            {/* Sequence toggle selectors */}
            <div className="flex gap-2.5 mb-5">
              {Object.keys(sequences).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedSequence(name)}
                  className={`font-mono text-[11.5px] px-3.5 py-1.5 rounded-full border cursor-pointer capitalize transition-all ${
                    selectedSequence === name
                      ? "bg-accent-mint/15 border-accent-mint text-accent-mint shadow-[0_0_12px_rgba(21,207,160,0.15)]"
                      : "bg-transparent border-white/5 text-text-dim hover:text-text-primary hover:border-white/10"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* R3F Embedded Canvas */}
            <div className="bg-dark-bg/60 p-4 border border-white/5 rounded-xl">
              <SigningAvatar glossSequence={sequences[selectedSequence]} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[10.5px] font-mono text-text-faint flex items-center gap-1">
            <Info size={12} />
            These sequences match real-time gloss inputs translated for sign learners.
          </div>
        </div>

      </div>

    </div>
  );
}
