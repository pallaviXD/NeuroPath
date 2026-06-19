import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Loader, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function GridLines() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent"
          style={{ left: `${(i + 1) * 12.5}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </div>
  );
}

const ROLE_OPTIONS = [
  { id: "student", icon: "🎓", label: "Student", desc: "Adaptive lessons that learn how you learn", color: "pink" },
  { id: "teacher", icon: "🏫", label: "Teacher", desc: "Real-time classroom insights & interventions", color: "violet" },
  { id: "parent", icon: "🏠", label: "Parent / Guardian", desc: "Weekly progress digests for your child", color: "mint" },
  { id: "admin", icon: "⚙️", label: "Administrator", desc: "District-wide rollout and compliance tools", color: "amber" },
];

const colorMap = {
  pink: { active: "border-accent-pink bg-accent-pink/10", icon: "text-accent-pinkLight", ring: "ring-accent-pink/30" },
  violet: { active: "border-accent-violet bg-accent-violet/10", icon: "text-accent-violetLight", ring: "ring-accent-violet/30" },
  mint: { active: "border-accent-mint bg-accent-mint/10", icon: "text-accent-mint", ring: "ring-accent-mint/30" },
  amber: { active: "border-accent-amber bg-accent-amber/10", icon: "text-accent-amber", ring: "ring-accent-amber/30" },
};

export default function Signup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1); // 1=role, 2=details
  const [role, setRole] = useState(params.get("role") || "student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => { clearError(); }, []);

  const handleNext = () => {
    setLocalErr("");
    if (!role) { setLocalErr("Please choose your role."); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    if (!name.trim()) { setLocalErr("Name is required."); return; }
    if (!email.trim()) { setLocalErr("Email is required."); return; }
    if (password.length < 6) { setLocalErr("Password must be at least 6 characters."); return; }
    try {
      const user = await signup(name.trim(), email.trim(), password, role);
      if (user.role === "teacher" || user.role === "admin") navigate("/dashboard");
      else if (user.role === "parent") navigate("/parent");
      else navigate("/onboarding");
    } catch {
      setLocalErr("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <GridLines />
      <motion.div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,47,247,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="fixed bottom-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,29,126,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 4 }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10">

        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg mb-8 justify-center">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center shadow-[0_0_20px_rgba(255,29,126,0.5)]">
            <div className="w-3 h-3 rounded-full bg-dark-bg" />
          </div>
          NeuroPath
        </Link>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-6 px-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= s ? "border-accent-pink bg-accent-pink text-white" : "border-white/20 text-text-faint"}`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wider ${step >= s ? "text-text-primary" : "text-text-faint"}`}>
                {s === 1 ? "Choose role" : "Your details"}
              </span>
              {s < 2 && <div className={`flex-1 h-px transition-all ${step > s ? "bg-accent-pink" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-violet/40 to-transparent" />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
                <h1 className="font-display font-black text-3xl text-text-primary mb-1">Join NeuroPath.</h1>
                <p className="text-text-faint text-sm mb-7">Pick your role to get the right experience.</p>

                <div className="space-y-3 mb-6">
                  {ROLE_OPTIONS.map((r) => {
                    const c = colorMap[r.color];
                    return (
                      <motion.button key={r.id} type="button" whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setRole(r.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${role === r.id ? `${c.active} ring-2 ${c.ring}` : "border-white/8 bg-white/[0.02] hover:border-white/20"}`}
                      >
                        <span className="text-2xl">{r.icon}</span>
                        <div className="flex-1">
                          <div className={`font-display font-bold text-sm ${role === r.id ? c.icon : "text-text-primary"}`}>{r.label}</div>
                          <div className="font-mono text-[10.5px] text-text-faint mt-0.5">{r.desc}</div>
                        </div>
                        {role === r.id && <CheckCircle2 size={18} className={c.icon} />}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button onClick={handleNext} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-base shadow-[0_6px_24px_rgba(255,29,126,0.4)] flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="text-text-faint hover:text-text-primary transition-colors font-mono text-xs">← Back</button>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                    <span>{ROLE_OPTIONS.find(r => r.id === role)?.icon}</span>
                    <span className="font-mono text-[11px] text-text-dim capitalize">{role}</span>
                  </div>
                </div>

                <h1 className="font-display font-black text-3xl text-text-primary mb-1">Create account.</h1>
                <p className="text-text-faint text-sm mb-7">Almost there — fill in your details.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Full name", type: "text", val: name, set: setName, ph: "Alex Johnson" },
                    { label: "Email", type: "email", val: email, set: setEmail, ph: "you@school.edu" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider mb-2 block">{f.label}</label>
                      <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                        className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-faint focus:border-accent-pink focus:bg-white/[0.05] focus:outline-none transition-all" />
                    </div>
                  ))}
                  <div>
                    <label className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider mb-2 block">Password</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                        className="w-full px-4 py-3.5 pr-12 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-faint focus:border-accent-pink focus:bg-white/[0.05] focus:outline-none transition-all" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-primary transition-colors">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(localErr || error) && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 bg-accent-pink/10 border border-accent-pink/30 rounded-xl text-sm text-accent-pinkLight">
                        <AlertCircle size={14} /> {localErr || error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="submit" disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -1 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-base shadow-[0_6px_24px_rgba(255,29,126,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                    {isLoading ? <><Loader size={16} className="animate-spin" /> Creating account...</> : <><Sparkles size={16} /> Create account <ArrowRight size={16} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <span className="text-text-faint text-sm">Already have an account? </span>
            <Link to="/login" className="text-accent-pinkLight font-bold hover:text-accent-pink transition-colors text-sm">Sign in →</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
