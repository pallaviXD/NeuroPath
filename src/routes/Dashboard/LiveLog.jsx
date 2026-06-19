import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Activity } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function LiveLog() {
  const { dashboardLogs, addLiveLog, dashboardStudents } = useStore();
  
  // Filtering states
  const [filterModality, setFilterModality] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated WebSocket feed dispatcher using JS interval (4-12s)
  useEffect(() => {
    const concepts = ["unbalanced force", "inertia vectors", "Calvin cycle steps", "sunlight reactant", "constant acceleration"];
    const types = ["re-reading", "idle-timer", "wrong-answer"];
    const modalities = ["visual", "narrative", "kinesthetic", "sign"];

    const runInterval = () => {
      const delay = Math.random() * 8000 + 4000; // 4s to 12s
      
      return setTimeout(() => {
        // Randomly select student
        const randStudent = dashboardStudents[Math.floor(Math.random() * dashboardStudents.length)];
        const randConcept = concepts[Math.floor(Math.random() * concepts.length)];
        const randType = types[Math.floor(Math.random() * types.length)];
        const randModality = modalities[Math.floor(Math.random() * modalities.length)];

        const newLog = {
          id: "log_" + Date.now(),
          studentId: randStudent.id,
          studentName: randStudent.name,
          modality: randModality,
          concept: randConcept,
          type: randType,
          time: "now"
        };

        addLiveLog(newLog);
        
        // Loop recursively
        runInterval();
      }, delay);
    };

    const timer = runInterval();
    return () => clearTimeout(timer);
  }, [dashboardStudents]);

  // Filtering logic
  const filteredLogs = dashboardLogs.filter(log => {
    const matchModality = filterModality === "all" || log.modality === filterModality;
    const matchType = filterType === "all" || log.type === filterType;
    const matchSearch = log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        log.concept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchModality && matchType && matchSearch;
  });

  const getModalityColor = (modality) => {
    switch (modality) {
      case "visual": return "bg-accent-pink";
      case "narrative": return "bg-accent-amber";
      case "kinesthetic": return "bg-accent-violet";
      case "sign": return "bg-accent-mint";
      default: return "bg-white/20";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filtering Ribbon */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="w-full md:w-auto relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint"><Search size={16} /></span>
          <input
            type="text"
            placeholder="Search student or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-bg/60 border border-white/5 rounded-full text-xs text-text-primary focus:border-accent-pink focus:outline-none transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-xs font-mono text-text-faint">
            <SlidersHorizontal size={14} /> Filters:
          </div>

          <select
            value={filterModality}
            onChange={(e) => setFilterModality(e.target.value)}
            className="bg-dark-bg border border-white/5 rounded-full px-3 py-1.5 text-[11px] text-text-dim focus:outline-none focus:border-accent-pink"
          >
            <option value="all">All Modalities</option>
            <option value="visual">Visual</option>
            <option value="narrative">Narrative</option>
            <option value="kinesthetic">Kinesthetic</option>
            <option value="sign">Sign Language</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-dark-bg border border-white/5 rounded-full px-3 py-1.5 text-[11px] text-text-dim focus:outline-none focus:border-accent-pink"
          >
            <option value="all">All Struggle Types</option>
            <option value="re-reading">Re-reading</option>
            <option value="idle-timer">Idle timer</option>
            <option value="wrong-answer">Incorrect answer</option>
          </select>
        </div>

      </div>

      {/* Logs Feed Container */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 text-left">
        <h4 className="font-display font-bold text-base text-text-primary mb-5 flex items-center justify-between">
          Live intervention log
          <span className="font-mono text-[10px] text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 uppercase">
            <Activity size={10} className="animate-pulse" /> Live connection active
          </span>
        </h4>

        <div className="space-y-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between py-3 border-b border-white/5 text-xs hover:bg-white/[0.01] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 truncate mr-4">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getModalityColor(log.modality)}`} />
                  <span className="font-semibold text-text-primary w-[110px] flex-shrink-0 truncate">{log.studentName}</span>
                  <span className="text-text-dim truncate">
                    Resolved struggle: <strong className="text-text-primary">"{log.concept}"</strong> via {log.modality} adapter
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] text-text-faint flex-shrink-0">
                  <span className="capitalize">{log.type.replace("-", " ")}</span>
                  <span>·</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-text-faint font-mono text-xs">
              No matching live log events found.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
