import { useState } from "react";
import { 
  Settings, 
  RefreshCw, 
  FileSpreadsheet, 
  CheckCircle2, 
  Database, 
  Users, 
  ShieldAlert, 
  Download, 
  ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DISTRICT_DATA = [
  { school: "Oakridge Academy", students: 540, deafHoh: 12, visualL: 210, storyL: 180, kinL: 138 },
  { school: "Pinewood Middle", students: 380, deafHoh: 6, visualL: 150, storyL: 120, kinL: 104 },
  { school: "Summit High School", students: 720, deafHoh: 18, visualL: 290, storyL: 240, kinL: 172 },
  { school: "Valley Elementary", students: 290, deafHoh: 8, visualL: 110, storyL: 100, kinL: 72 },
];

const COMPLIANCE_ITEMS = [
  { id: "c1", name: "Section 508 / VPAT Accessibility Audit", type: "Accessibility", status: "Compliant", date: "2026-06-15" },
  { id: "c2", name: "IDEA Part B compliance log", type: "Special Ed", status: "Compliant", date: "2026-06-20" },
  { id: "c3", name: "FERPA student data privacy compliance", type: "Privacy", status: "Certified", date: "2026-06-22" },
];

export default function AdminConsole() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("2026-06-25 08:30 AM");
  const [selectedStandard, setSelectedStandard] = useState("ngss");
  const [syncMessage, setSyncMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncMessage("");
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSync(
        now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setSyncMessage("SSO Roster synchronization completed successfully. 24 student records verified.");
    }, 2000);
  };

  const handleExport = (reportName) => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            alert(`"${reportName}" compiled and saved locally.`);
          }, 400);
          return 100;
        }
        return p + 20;
      });
    }, 200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* District Synced Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider block mb-1">SSO Sync Status</span>
            <span className="font-display font-bold text-xl text-text-primary flex items-center gap-1.5">
              <Database className="text-accent-mint" size={18} /> Active Sync
            </span>
            <span className="text-[10px] text-text-faint font-mono block mt-1">Last synced: {lastSync}</span>
          </div>
          <motion.button
            onClick={handleSync}
            disabled={isSyncing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl border border-white/10 bg-white/5 text-text-primary hover:bg-white/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Force Sync Roster"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin text-accent-pink" : ""} />
          </motion.button>
        </div>

        {/* Total Managed Students */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider block mb-1">Managed Enrolment</span>
            <span className="font-display font-bold text-2xl text-text-primary">1,930 Students</span>
            <span className="text-[10px] text-accent-mint font-mono block mt-1">4 schools active in district</span>
          </div>
          <Users className="text-accent-violetLight" size={24} />
        </div>

        {/* Global Compliance */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider block mb-1">IDEA/VPAT Auditing</span>
            <span className="font-display font-bold text-xl text-text-primary flex items-center gap-1.5">
              <CheckCircle2 className="text-accent-mint" size={18} /> 100% Compliant
            </span>
            <span className="text-[10px] text-accent-pink font-mono block mt-1">Next review in 180 days</span>
          </div>
          <ShieldAlert className="text-accent-pink" size={24} />
        </div>

      </div>

      {/* Sync Log Message Toast (Animated) */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-2xl text-xs text-accent-mint font-mono flex items-center gap-2"
          >
            <CheckCircle2 size={14} />
            {syncMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* District School Enrolment & Modality Distribution */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
          <div>
            <h4 className="font-display font-bold text-base text-text-primary">District-wide Learning Modalities</h4>
            <p className="text-text-faint text-xs mt-1">Overall distribution of visual, story, and hands-on modality usage across schools.</p>
          </div>
          
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="school" stroke="#766F85" fontSize={10} tickLine={false} />
                <YAxis stroke="#766F85" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0F0B14", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px" }}
                  labelStyle={{ fontSize: "11px", fontWeight: "bold", color: "#F5F2FA", marginBottom: "4px" }}
                />
                <Bar dataKey="visualL" name="Visual Learners" fill="#FF1D7E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="storyL" name="Story/Narrative" fill="#FFB347" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kinL" name="Hands-on/Kinesthetic" fill="#7B2FF7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settings & Standards Sync Config */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-display font-bold text-base text-text-primary">Academic Standards</h4>
              <p className="text-text-faint text-xs mt-1">Configure curriculum standard alignment rules for AI lesson generators.</p>
            </div>
            
            <div className="space-y-2">
              {[
                { id: "ngss", name: "NGSS Standards", desc: "Next Generation Science Standards" },
                { id: "ccss", name: "Common Core", desc: "CCSS Math & English Literacy guidelines" },
                { id: "state", name: "State Standards", desc: "Localized custom state learning indices" },
              ].map((std) => (
                <button
                  key={std.id}
                  onClick={() => setSelectedStandard(std.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedStandard === std.id
                      ? "border-accent-pink bg-accent-pink/10 text-text-primary"
                      : "border-white/5 bg-white/[0.01] text-text-dim hover:border-white/10 hover:bg-white/[0.03]"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{std.name}</div>
                    <div className="text-[10px] text-text-faint font-mono mt-0.5">{std.desc}</div>
                  </div>
                  <ChevronRight size={14} className={selectedStandard === std.id ? "text-accent-pink" : "text-text-faint"} />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 font-mono text-[10px] text-text-faint">
            ℹ️ Changing standards dynamically recalibrates ingestion mapping vectors.
          </div>
        </div>

      </div>

      {/* Compliance Log & Export Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-display font-bold text-base text-text-primary">Compliance Logs & Export</h4>
            <p className="text-text-faint text-xs mt-1">Generate federally compliant reports for IDEA Part B audits.</p>
          </div>
          
          <button
            onClick={() => handleExport("District Compliance Bundle")}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(255,29,126,0.3)] hover:shadow-[0_6px_20px_rgba(255,29,126,0.45)] disabled:opacity-50 transition-all cursor-pointer"
          >
            <Download size={14} />
            {isExporting ? `Compiling ${exportProgress}%` : "Export District Compliance PDF"}
          </button>
        </div>

        {/* Progress bar for exporting */}
        {isExporting && (
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-accent-pink rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${exportProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}

        <div className="space-y-2">
          {COMPLIANCE_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3.5 truncate">
                <FileSpreadsheet className="text-accent-violetLight shrink-0" size={16} />
                <div className="truncate">
                  <span className="font-semibold text-xs text-text-primary block sm:inline">{item.name}</span>
                  <span className="font-mono text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-faint sm:ml-2 uppercase">{item.type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
                <span className="text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold">
                  {item.status}
                </span>
                <span className="text-text-faint hidden sm:inline">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
