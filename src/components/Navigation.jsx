import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, User, ChevronDown } from "lucide-react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import AccessibilityToggle from "./accessibility/AccessibilityToggle";


export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const studentProfile = useStore((state) => state.studentProfile);
  const { user, logout } = useAuthStore();

  const navItems = user?.role === "teacher" || user?.role === "admin"
    ? [
        { label: "Home", path: "/" },
        { label: "Dashboard", path: "/dashboard" },
        { label: "Lessons", path: "/lessons" },
        { label: "PDF Upload", path: "/dashboard/content" },
      ]
    : user?.role === "parent"
    ? [
        { label: "Home", path: "/" },
        { label: "My Portal", path: "/parent" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Lessons", path: "/lessons" },
        { label: "PDF Lesson", path: "/instant" },
        { label: "My Progress", path: "/student-dashboard" },
      ];

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "teacher" || user.role === "admin") return "/dashboard";
    if (user.role === "parent") return "/parent";
    return "/student-dashboard";
  };

  const getCTALabel = () => {
    if (user) {
      if (user.role === "teacher" || user.role === "admin") return "Teacher Dashboard";
      if (user.role === "parent") return "My Portal";
      return studentProfile.primary ? "My Lessons" : "Get Profile";
    }
    return "Get Started";
  };

  const getCTAPath = () => {
    if (user) {
      if (user.role === "teacher" || user.role === "admin") return "/dashboard";
      if (user.role === "parent") return "/parent";
      return studentProfile.primary ? "/lessons" : "/onboarding";
    }
    return "/signup";
  };

  const roleColors = {
    student: "text-accent-pinkLight", teacher: "text-accent-violetLight",
    parent: "text-accent-mint", admin: "text-accent-amber",
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 md:px-16 bg-dark-bg/60 backdrop-blur-[20px] border-b border-white/8"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight select-none group">
          <motion.div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center relative shadow-[0_0_20px_rgba(255,29,126,0.4)]"
            whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
            <div className="w-[11px] h-[11px] rounded-full bg-dark-bg" />
            <div className="absolute w-[7px] h-[7px] rounded-full bg-accent-mint top-1 right-1 animate-pulse-dot" />
          </motion.div>
          <span className="text-text-primary group-hover:text-accent-pinkLight transition-colors">NeuroPath</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`text-[14px] font-medium transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:bg-accent-pink after:transition-all ${
                location.pathname === item.path || location.pathname.startsWith(item.path + "/")
                  ? "text-text-primary after:w-full" : "text-text-dim hover:text-text-primary after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <AccessibilityToggle />
          {user ? (
            <div className="relative">
              <motion.button onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className={`font-mono text-[11px] font-semibold ${roleColors[user.role] || "text-text-dim"}`}>
                  {user.name?.split(" ")[0]}
                </span>
                <ChevronDown size={12} className={`text-text-faint transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 glass-panel rounded-2xl border border-white/10 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 mb-1 border-b border-white/8">
                      <div className="font-semibold text-sm text-text-primary">{user.name}</div>
                      <div className={`font-mono text-[10px] capitalize mt-0.5 ${roleColors[user.role]}`}>{user.role}</div>
                    </div>
                    <button onClick={() => { navigate(getDashboardPath()); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-dim hover:text-text-primary hover:bg-white/[0.04] transition-all text-left">
                      <User size={14} /> {user.role === "parent" ? "My Portal" : user.role === "student" ? "My Lessons" : "My Dashboard"}
                    </button>
                    <button onClick={() => { logout(); navigate("/"); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-accent-pink hover:bg-accent-pink/10 transition-all text-left">
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2.5 rounded-full border border-white/10 text-text-dim hover:text-text-primary hover:border-white/20 bg-transparent text-[13.5px] font-semibold transition-all">
              Sign in
            </Link>
          )}

          <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link to={getCTAPath()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-[13.5px] shadow-[0_4px_18px_rgba(255,29,126,0.4)] hover:shadow-[0_8px_28px_rgba(255,29,126,0.55)] flex items-center gap-1.5 transition-all"
            >
              {getCTALabel()} <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-text-dim hover:text-text-primary hover:bg-white/5 rounded-full transition-colors">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="fixed top-[65px] left-0 right-0 z-40 bg-dark-bg/95 border-b border-white/10 flex flex-col p-6 gap-4 backdrop-blur-xl lg:hidden"
          >
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={`text-base font-medium py-1 transition-colors ${location.pathname === item.path ? "text-accent-pink" : "text-text-dim hover:text-text-primary"}`}>
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-white/10">
              {user ? (
                <button onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}
                  className="flex items-center gap-2 text-accent-pink text-sm font-semibold">
                  <LogOut size={14} /> Sign out ({user.name})
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="text-center py-3 rounded-full border border-white/10 text-text-dim text-sm font-semibold">Sign in</Link>
              )}
              <Link to={getCTAPath()} onClick={() => setMobileOpen(false)}
                className="text-center py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-sm">
                {getCTALabel()}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
