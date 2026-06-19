import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { ChevronLeft, ShieldCheck, Clock, Award, AlertCircle, HelpCircle } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const students = useStore((state) => state.dashboardStudents);

  const student = useMemo(() => {
    return students.find((s) => s.id === id);
  }, [students, id]);

  const radarData = useMemo(() => {
    if (!student) return [];
    const b = student.profile.breakdown;
    return [
      { subject: "Visual", A: b.visual, fullMark: 100 },
      { subject: "Narrative", A: b.narrative, fullMark: 100 },
      { subject: "Kinesthetic", A: b.kinesthetic, fullMark: 100 },
      { subject: "Sign", A: b.sign, fullMark: 100 }
    ];
  }, [student]);

  if (!student) {
    return (
      <div className="text-center py-12">
        <h4 className="text-sm font-mono text-text-faint uppercase mb-2">Student not found</h4>
        <Link to="/dashboard" className="text-accent-pink hover:underline text-xs font-mono">Back to dashboard</Link>
      </div>
    );
  }

  const getModalityColorClass = (modality) => {
    switch (modality) {
      case "visual": return "text-accent-pink";
      case "narrative": return "text-accent-amber";
      case "kinesthetic": return "text-accent-violetLight";
      case "sign": return "text-accent-mint";
      default: return "text-text-primary";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back to heatmap navigation */}
      <div className="flex justify-start">
        <button 
          onClick={() => navigate("/dashboard")}
          className="text-xs font-mono text-text-faint hover:text-accent-pink transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft size={14} /> Back to Class list
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Student summary profile */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card info */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-accent-violet/10 blur-xl" />
            <span className="font-mono text-[9px] text-text-faint uppercase block mb-1">Student Profile Details</span>
            <h3 className="font-display font-bold text-xl text-text-primary mb-1">{student.name}</h3>
            <span className={`font-mono text-xs font-semibold capitalize ${getModalityColorClass(student.profile.primary)}`}>
              {student.profile.primary} Learner · {student.profile.confidence}% Confidence
            </span>

            <div className="space-y-4 mt-6 pt-5 border-t border-white/5 font-mono text-xs text-text-dim">
              <div className="flex justify-between items-center">
                <span className="text-text-faint">Hearing profile:</span>
                <span>{student.deafOrHoh ? "Deaf / Hard-of-hearing" : "Standard"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-faint">Interventions Logged:</span>
                <span className="font-semibold text-accent-pinkLight">{student.struggleHistory?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Radar chart breakdown */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left h-[260px] flex flex-col justify-between">
            <h4 className="font-display font-semibold text-sm text-text-primary mb-2">Modality Balance Map</h4>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" stroke="#766F85" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.1)" tick={false} />
                  <Radar 
                    name="Confidence" 
                    dataKey="A" 
                    stroke="#FF1D7E" 
                    fill="#FF1D7E" 
                    fillOpacity={0.25} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#08060B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                    itemStyle={{ color: "#F5F2FA", fontSize: "11px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Historical sessions & interventions timeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Active Lesson Progress Sessions */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left">
            <h4 className="font-display font-bold text-sm text-text-primary mb-4">Completed Lesson Sessions</h4>
            
            <div className="space-y-3">
              {student.sessions && student.sessions.length > 0 ? (
                student.sessions.map((s, idx) => (
                  <div key={idx} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="text-text-primary font-bold">{s.lessonId === "newtons-first-law" ? "Newton's First Law" : "Photosynthesis"}</div>
                      <div className="text-[10px] text-text-faint mt-1 flex items-center gap-2">
                        <Clock size={10} /> {Math.round(s.duration / 60)} min session · {s.date}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 font-sans font-semibold text-accent-mint">
                      <Award size={14} />
                      {s.score}%
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-faint font-mono text-xs">
                  No completed lesson sessions logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Intervention Timeline log */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left">
            <h4 className="font-display font-bold text-sm text-text-primary mb-4">Intervention History Timeline</h4>
            
            <div className="space-y-4">
              {student.struggleHistory && student.struggleHistory.length > 0 ? (
                student.struggleHistory.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* timeline line */}
                    {idx < student.struggleHistory.length - 1 && (
                      <div className="absolute left-[15px] top-[30px] bottom-[-20px] w-[1px] bg-white/10" />
                    )}

                    <div className="w-[32px] h-[32px] rounded-full border border-accent-pink/30 bg-accent-pink/5 flex items-center justify-center flex-shrink-0 text-accent-pink">
                      <AlertCircle size={14} />
                    </div>

                    <div className="flex-1 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                        <span className="font-semibold text-text-primary uppercase tracking-wider">Concept: {item.concept}</span>
                        <span className="text-text-faint">{item.timestamp}</span>
                      </div>
                      <p className="text-[12.5px] text-text-dim leading-relaxed">
                        Detected struggle type: <strong className="text-text-primary">{item.type.replace("-", " ")}</strong>. 
                        Redirected pipeline explanation output through <strong className={`capitalize ${getModalityColorClass(item.modalityOffered)}`}>{item.modalityOffered}</strong> adaptive adapter.
                      </p>
                      <div className="mt-2 text-[10.5px] font-mono text-accent-mint flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse-dot" /> Resolved instantly
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-text-faint font-mono text-xs">
                  No struggles or intervention logs detected for this student.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
