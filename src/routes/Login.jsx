import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Sparkles, Brain, AlertCircle, Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

// Animated background grid lines
function GridLines() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent"
          style={{ left: `${(i + 1) * 12.5}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
          style={{ top: `${(i + 1) * 16.6}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}

const ROLE_OPTIONS = [
  { id: "student", icon: "🎓", label: "Student", color: "pink" },
  { id: "teacher", icon: "🏫", label: "Teacher", color: "violet" },
  { id: "parent", icon: "🏠", label: "Parent", color: "mint" },
  { id: "admin", icon: "⚙️", label: "Admin", color: "amber" },
];

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState(params.get("role") || "student");
  const [localErr, setLocalErr] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); clearError(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    if (!email.trim()) { setLocalErr("Email is required."); return; }
    if (!password) { setLocalErr("Password is required."); return; }
    try {
      const user = await login(email.trim(), password, role);
      if (user.role === "teacher" || user.role === "admin") navigate("/dashboard");
      else if (user.role === "parent") navigate("/parent");
      else navigate("/student-dashboard");
    } catch {
      setLocalErr("Invalid credentials. Try any email + password.");
    }
  };

  const colorMap = { pink: "border-accent-pink bg-accent-pink/10 text-accent-pinkLight", violet: "border-accent-violet bg-accent-violet/10 text-accent-violetLight", mint: "border-accent-mint bg-accent-mint/10 text-accent-mint", amber: "border-accent-amber bg-accent-amber/10 text-accent-amber" };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      <GridLines />

      {/* BG orbs */}
      <motion.div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,29,126,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(123,47,247,0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg mb-8 justify-center">
          <motion.div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center shadow-[0_0_20px_rgba(255,29,126,0.5)]"
            animate={{ boxShadow: ["0 0 20px rgba(255,29,126,0.4)", "0 0 35px rgba(255,29,126,0.7)", "0 0 20px rgba(255,29,126,0.4)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}>
            <div className="w-3 h-3 rounded-full bg-dark-bg" />
          </motion.div>
          NeuroPath
        </Link>

        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-pink/40 to-transparent" />

          <h1 className="font-display font-black text-3xl text-text-primary mb-1">Welcome back.</h1>
          <p className="text-text-faint text-sm mb-7">Sign in to your NeuroPath account.</p>

          {/* Role selector */}
          <div className="mb-6">
            <div className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider mb-2.5">Signing in as</div>
            <div className="grid grid-cols-4 gap-2">
              {ROLE_OPTIONS.map((r) => (
                <motion.button key={r.id} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl border-2 text-center transition-all text-xs font-bold flex flex-col items-center gap-1 ${role === r.id ? colorMap[r.color] : "border-white/8 bg-white/[0.02] text-text-faint hover:border-white/20"}`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span>{r.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider mb-2 block">Email</label>
              <input ref={inputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-faint focus:border-accent-pink focus:bg-white/[0.05] focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="font-mono text-[10.5px] text-text-faint uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-faint focus:border-accent-pink focus:bg-white/[0.05] focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-primary transition-colors">
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
              className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-base shadow-[0_6px_24px_rgba(255,29,126,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : <>Sign in <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <span className="text-text-faint text-sm">Don't have an account? </span>
            <Link to="/signup" className="text-accent-pinkLight font-bold hover:text-accent-pink transition-colors text-sm">Create one →</Link>
          </div>

          {/* Quick demo hint */}
          <div className="mt-4 p-3 bg-white/[0.02] border border-white/8 rounded-xl text-center">
            <span className="font-mono text-[10px] text-text-faint">Demo: any email + any password</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
