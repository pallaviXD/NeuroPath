import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Info, Users, ShieldAlert, Award } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function Heatmap() {
  const navigate = useNavigate();
  const students = useStore((state) => state.dashboardStudents);
  const [tooltip, setTooltip] = useState(null);

  const checkpointLabels = [
    "Introduction", "Inertia theory", "Balanced forces", "Unbalanced forces", 
    "Net force equations", "Constant speed", "Friction inputs", "Quiz check 1",
    "Quiz check 2", "Calvin cycle", "Reactant balancing", "Final quiz"
  ];

  const handleCellHover = (e, student, val, index) => {
    if (val === 0) {
      setTooltip(null);
      return;
    }
    
    // Find matching concept or generate mock telemetry context
    const rect = e.target.getBoundingClientRect();
    const concept = checkpointLabels[index];
    const timestamp = "10:" + (20 + index) + " AM";
    const type = val === 1 ? "Mild hesitation" : "Intervention fired";
    const adapter = student.profile.primary;

    setTooltip({
      studentName: student.name,
      studentId: student.id,
      concept,
      timestamp,
      type,
      adapter,
      x: rect.left + window.scrollX + 15,
      y: rect.top + window.scrollY - 85
    });
  };

  const getCellBg = (val) => {
    if (val === 2) return "bg-accent-pink shadow-[0_0_8px_rgba(255,29,126,0.5)]";
    if (val === 1) return "bg-accent-amber shadow-[0_0_6px_rgba(255,179,71,0.5)]";
    return "bg-white/[0.06]";
  };

  return (
    <div className="space-y-6">
      
      {/* Counters ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider block mb-1">Active Students</span>
            <span className="font-display font-bold text-2xl text-text-primary">24</span>
          </div>
          <Users className="text-accent-violetLight" size={24} />
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider block mb-1">Interventions Today</span>
            <span className="font-display font-bold text-2xl text-accent-pinkLight">42</span>
          </div>
          <ShieldAlert className="text-accent-pink" size={24} />
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider block mb-1">Signed Deliveries</span>
            <span className="font-display font-bold text-2xl text-accent-mint">6</span>
          </div>
          <Award className="text-accent-mint" size={24} />
        </div>
      </div>

      {/* Main Heatmap block */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left relative">
        <h4 className="font-display font-bold text-base text-text-primary mb-4 flex items-center justify-between">
          Class struggle heatmap
          <span className="font-mono text-[11px] text-text-faint font-normal">Newton's Laws · 24 Students</span>
        </h4>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px] space-y-2.5">
            {students.map((student) => (
              <div 
                key={student.id}
                className="flex items-center gap-3 py-1 hover:bg-white/[0.02] px-2 rounded-lg cursor-pointer transition-colors"
                onClick={() => navigate(`/dashboard/student/${student.id}`)}
              >
                {/* Student Name */}
                <div className="w-[140px] text-xs font-semibold text-text-dim truncate hover:text-text-primary transition-colors">
                  {student.name}
                </div>

                {/* 12 Checkpoint cells */}
                <div className="flex-1 grid grid-cols-12 gap-1.5">
                  {student.checkpoints.map((val, idx) => (
                    <div
                      key={idx}
                      className={`h-6 rounded-md cursor-pointer transition-all hover:scale-115 hover:z-20 ${getCellBg(val)}`}
                      onMouseEnter={(e) => handleCellHover(e, student, val, idx)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkpoint Headers descriptor list */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap justify-between gap-4 font-mono text-[10px] text-text-faint uppercase">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-white/[0.06]" /> No struggle
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-accent-amber" /> Hesitation
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-accent-pink" /> Intervention
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Info size={12} />
            Hover cells to trace concept tags. Click student to inspect.
          </div>
        </div>
      </div>

      {/* Floating Tooltip portal */}
      {tooltip && (
        <div 
          className="absolute z-50 p-3 bg-dark-bg/95 border border-accent-pink/40 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-left w-[240px] pointer-events-none transition-all duration-100"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="font-semibold text-xs text-text-primary mb-1">{tooltip.studentName}</div>
          <div className="text-[11px] text-text-dim mb-2">Concept: <strong>{tooltip.concept}</strong></div>
          <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-2">
            <span className={tooltip.type.includes("Intervention") ? "text-accent-pink font-bold" : "text-accent-amber"}>
              {tooltip.type}
            </span>
            <span className="text-text-faint">{tooltip.timestamp}</span>
          </div>
        </div>
      )}

    </div>
  );
}
