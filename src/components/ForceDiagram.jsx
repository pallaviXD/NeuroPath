import { useState } from "react";
import { Sparkles, ArrowRightLeft } from "lucide-react";

export default function ForceDiagram({ lessonId }) {
  const [hoveredElement, setHoveredElement] = useState(null);

  if (lessonId === "newtons-first-law") {
    const details = {
      forceL: "Left Push force (F1 = 10N). This force acts horizontally to the left on the box's boundary.",
      forceR: "Right Push force (F2 = 10N). This force acts horizontally to the right. It perfectly balances the left force.",
      box: "Mass box (M = 5 kg). Since Left Force (10N) and Right Force (10N) cancel out, Net Force is exactly 0 Newtons. The mass remains static."
    };

    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full h-[180px] bg-dark-card border border-white/5 rounded-2xl relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <svg className="w-full h-full max-w-[400px]" viewBox="0 0 200 100">
            {/* Left force arrow */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement("forceL")}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1="50" y1="50" x2="15" y2="50" stroke="#FF1D7E" strokeWidth="2.5" />
              <polygon points="15,50 23,46 23,54" fill="#FF1D7E" />
              <text x="25" y="40" fill="#FF1D7E" fontSize="7" fontFamily="monospace" fontWeight="bold">F1 = 10N</text>
            </g>

            {/* Mass Box */}
            <rect 
              x="80" 
              y="35" 
              width="40" 
              height="30" 
              rx="4" 
              fill="#1C1525" 
              stroke={hoveredElement === "box" ? "#7B2FF7" : "#372d42"} 
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredElement("box")}
              onMouseLeave={() => setHoveredElement(null)}
            />
            <text x="100" y="53" textAnchor="middle" fill="#B8B3C4" fontSize="8" fontWeight="bold" fontFamily="monospace">5 kg</text>

            {/* Right force arrow */}
            <g 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement("forceR")}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <line x1="150" y1="50" x2="185" y2="50" stroke="#15CFA0" strokeWidth="2.5" />
              <polygon points="185,50 177,46 177,54" fill="#15CFA0" />
              <text x="150" y="40" fill="#15CFA0" fontSize="7" fontFamily="monospace" fontWeight="bold">F2 = 10N</text>
            </g>
            
            {/* Dashed balance line */}
            <line x1="100" y1="15" x2="100" y2="85" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Dynamic Detail readout */}
        <div className="w-full mt-4 min-h-[50px] p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
          {hoveredElement ? (
            <p className="text-[12px] text-text-dim leading-relaxed">
              <strong>{hoveredElement === "box" ? "Mass Frame:" : hoveredElement === "forceL" ? "Left vector:" : "Right vector:"}</strong> {details[hoveredElement]}
            </p>
          ) : (
            <p className="text-[12px] text-text-faint font-mono flex items-center gap-1.5 justify-center py-1">
              <Sparkles size={12} className="text-accent-pink" /> Hover over diagram nodes to view vector telemetry.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (lessonId === "photosynthesis") {
    const details = {
      light: "Sunlight (Photon Input): Absorbed by chlorophyll, providing the activation energy required to split water molecules.",
      water: "Water (H2O): Transported from soil. Split in the light reactions, releasing electrons and waste oxygen.",
      co2: "Carbon Dioxide (CO2): Absorbed from atmosphere. Captured in the dark reactions (Calvin cycle) to synthesize carbon sugars.",
      glucose: "Glucose (Sugar output): The chemical energy stored by the plant, serving as food for growth.",
      oxygen: "Oxygen (O2 release): Released into the air through leaf pores as a byproduct of water splitting."
    };

    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full h-[180px] bg-dark-card border border-white/5 rounded-2xl relative flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <svg className="w-full h-full max-w-[400px]" viewBox="0 0 200 100">
            {/* Sunlight node */}
            <g className="cursor-pointer" onMouseEnter={() => setHoveredElement("light")} onMouseLeave={() => setHoveredElement(null)}>
              <circle cx="100" cy="20" r="10" fill="rgba(255, 179, 71, 0.1)" stroke="#FFB347" strokeWidth="1.5" />
              <text x="100" y="23" textAnchor="middle" fill="#FFB347" fontSize="6" fontFamily="sans-serif" fontWeight="bold">SUNLIGHT</text>
              <line x1="100" y1="30" x2="100" y2="45" stroke="#FFB347" strokeWidth="1" strokeDasharray="2 2" />
            </g>

            {/* Chloroplast Center */}
            <ellipse cx="100" cy="55" rx="35" ry="20" fill="#15101D" stroke="#15CFA0" strokeWidth="2" />
            <text x="100" y="58" textAnchor="middle" fill="#15CFA0" fontSize="7" fontWeight="bold">CHLOROPLAST</text>

            {/* Inputs left */}
            <g className="cursor-pointer" onMouseEnter={() => setHoveredElement("water")} onMouseLeave={() => setHoveredElement(null)}>
              <circle cx="35" cy="40" r="8" fill="rgba(123, 47, 247, 0.1)" stroke="#7B2FF7" strokeWidth="1.5" />
              <text x="35" y="42" textAnchor="middle" fill="#A472FF" fontSize="5" fontFamily="sans-serif">H2O</text>
              <path d="M 43,40 Q 55,42 67,50" fill="none" stroke="#7B2FF7" strokeWidth="1" />
            </g>

            <g className="cursor-pointer" onMouseEnter={() => setHoveredElement("co2")} onMouseLeave={() => setHoveredElement(null)}>
              <circle cx="35" cy="70" r="8" fill="rgba(255, 29, 126, 0.1)" stroke="#FF1D7E" strokeWidth="1.5" />
              <text x="35" y="72" textAnchor="middle" fill="#FF5C9A" fontSize="5" fontFamily="sans-serif">CO2</text>
              <path d="M 43,70 Q 55,68 67,60" fill="none" stroke="#FF1D7E" strokeWidth="1" />
            </g>

            {/* Outputs right */}
            <g className="cursor-pointer" onMouseEnter={() => setHoveredElement("glucose")} onMouseLeave={() => setHoveredElement(null)}>
              <circle cx="165" cy="40" r="8" fill="rgba(21, 207, 160, 0.1)" stroke="#15CFA0" strokeWidth="1.5" />
              <text x="165" y="42" textAnchor="middle" fill="#15CFA0" fontSize="5" fontFamily="sans-serif">Sugar</text>
              <path d="M 133,50 Q 148,42 157,40" fill="none" stroke="#15CFA0" strokeWidth="1" />
            </g>

            <g className="cursor-pointer" onMouseEnter={() => setHoveredElement("oxygen")} onMouseLeave={() => setHoveredElement(null)}>
              <circle cx="165" cy="70" r="8" fill="rgba(164, 114, 255, 0.1)" stroke="#A472FF" strokeWidth="1.5" />
              <text x="165" y="72" textAnchor="middle" fill="#A472FF" fontSize="5" fontFamily="sans-serif">O2</text>
              <path d="M 133,60 Q 148,68 157,70" fill="none" stroke="#A472FF" strokeWidth="1" />
            </g>

          </svg>
        </div>

        {/* Dynamic Detail readout */}
        <div className="w-full mt-4 min-h-[50px] p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
          {hoveredElement ? (
            <p className="text-[12px] text-text-dim leading-relaxed">
              <strong>{hoveredElement.toUpperCase()}:</strong> {details[hoveredElement]}
            </p>
          ) : (
            <p className="text-[12px] text-text-faint font-mono flex items-center gap-1.5 justify-center py-1">
              <Sparkles size={12} className="text-accent-pink" /> Hover over inputs and outputs to trace energy conversion.
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
