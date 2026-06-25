import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Layers, BarChart2, Eye, Activity, FileUp, History, Settings } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function DashboardLayout() {
  const location = useLocation();
  const fetchDashboardStudents = useStore((state) => state.fetchDashboardStudents);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchDashboardStudents();
  }, [fetchDashboardStudents]);

  const tabItems = user?.role === "admin"
    ? [
        { label: "Admin Console", path: "/dashboard", icon: <Settings size={14} /> },
        { label: "Class Heatmap", path: "/dashboard/heatmap", icon: <Layers size={14} /> },
        { label: "Analytics & Trends", path: "/dashboard/analytics", icon: <BarChart2 size={14} /> },
        { label: "Live Log", path: "/dashboard/live-log", icon: <Activity size={14} /> },
        { label: "Deaf & Sign Language", path: "/dashboard/sign-language", icon: <Eye size={14} /> },
        { label: "Content Ingestion", path: "/dashboard/content", icon: <FileUp size={14} /> },
        { label: "Saved Lessons", path: "/dashboard/saved", icon: <History size={14} /> },
      ]
    : [
        { label: "Class Heatmap", path: "/dashboard", icon: <Layers size={14} /> },
        { label: "Analytics & Trends", path: "/dashboard/analytics", icon: <BarChart2 size={14} /> },
        { label: "Live Log", path: "/dashboard/live-log", icon: <Activity size={14} /> },
        { label: "Deaf & Sign Language", path: "/dashboard/sign-language", icon: <Eye size={14} /> },
        { label: "Content Ingestion", path: "/dashboard/content", icon: <FileUp size={14} /> },
        { label: "Saved Lessons", path: "/dashboard/saved", icon: <History size={14} /> },
      ];

  const getActiveTab = () => {
    if (location.pathname === "/dashboard/heatmap") return "/dashboard/heatmap";
    if (location.pathname === "/dashboard/analytics") return "/dashboard/analytics";
    if (location.pathname === "/dashboard/live-log") return "/dashboard/live-log";
    if (location.pathname === "/dashboard/sign-language") return "/dashboard/sign-language";
    if (location.pathname === "/dashboard/content") return "/dashboard/content";
    if (location.pathname === "/dashboard/saved") return "/dashboard/saved";
    if (location.pathname === "/dashboard/admin") return "/dashboard";
    // StudentDetail lives under /dashboard/student/:id — keep heatmap tab active
    if (location.pathname.startsWith("/dashboard/student")) {
      return user?.role === "admin" ? "/dashboard/heatmap" : "/dashboard";
    }
    return "/dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <div className="w-full max-w-7xl mx-auto pt-28 pb-20 px-6 md:px-16 flex flex-col">
      {/* Title */}
      <div className="text-left mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
            {user?.role === "admin" ? "Admin Command Panel" : "Teacher Command Panel"}
          </h1>
          <p className="text-text-dim text-xs md:text-sm mt-1">
            {user?.role === "admin"
              ? "Manage district settings, curriculum alignment, SSO configurations, and federal compliance audits."
              : "Monitor real-time cognitive struggle alerts, adaptive lesson redirects, and modality distributions."}
          </p>
        </div>
        
        {/* Connection status */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 rounded-full w-fit uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-mint shadow-[0_0_6px_var(--mint)] animate-pulse-dot" />
          Live Connection Active
        </div>
      </div>

      {/* Tabs list */}
      <div className="w-full border-b border-white/10 flex flex-wrap gap-2.5 mb-8 relative z-20">
        {tabItems.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center gap-2 py-3.5 px-4 font-mono text-xs uppercase tracking-wider relative transition-all border-b-2 cursor-pointer ${
              activeTab === tab.path
                ? "border-accent-pink text-text-primary font-bold"
                : "border-transparent text-text-faint hover:text-text-dim"
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Nested Route render */}
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  );
}
