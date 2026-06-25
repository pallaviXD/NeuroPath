import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import AmbientBackground from "./components/AmbientBackground";
import CursorGlow from "./components/CursorGlow";
import Landing from "./routes/Landing";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Onboarding from "./routes/Onboarding";
import Lessons from "./routes/Lessons";
import Lesson from "./routes/Lesson";
import InstantLesson from "./routes/InstantLesson";
import StudentDashboard from "./routes/StudentDashboard";
import Demo from "./routes/Demo";
import ParentPortal from "./routes/ParentPortal";
import DashboardLayout from "./routes/Dashboard/DashboardLayout";
import Heatmap from "./routes/Dashboard/Heatmap";
import Analytics from "./routes/Dashboard/Analytics";
import LiveLog from "./routes/Dashboard/LiveLog";
import SignLanguageView from "./routes/Dashboard/SignLanguageView";
import StudentDetail from "./routes/Dashboard/StudentDetail";
import ContentManager from "./routes/Dashboard/ContentManager";
import SavedLessons from "./routes/Dashboard/SavedLessons";
import AdminConsole from "./routes/Dashboard/AdminConsole";
import { useAuthStore } from "./store/useAuthStore";

// Pages that manage their own full-screen layout (no shared nav)
const STANDALONE_PATHS = ["/login", "/signup", "/parent"];

function DashboardIndex() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === "admin") {
    return <AdminConsole />;
  }
  return <Heatmap />;
}

function AppShell() {
  return (
    <>
      <AmbientBackground />
      <CursorGlow />
      <Navigation />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/instant" element={<InstantLesson />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndex />} />
            <Route path="heatmap" element={<Heatmap />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="live-log" element={<LiveLog />} />
            <Route path="sign-language" element={<SignLanguageView />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="saved" element={<SavedLessons />} />
            <Route path="student/:id" element={<StudentDetail />} />
            <Route path="admin" element={<AdminConsole />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

import { useEffect } from "react";
import { useAccessibilityStore } from "./store/useAccessibilityStore";

export default function App() {
  const fontSize = useAccessibilityStore((state) => state.fontSize);
  const mode = useAccessibilityStore((state) => state.mode);

  useEffect(() => {
    // Remove existing font size classes from root HTML element
    document.documentElement.classList.remove("font-size-normal", "font-size-large", "font-size-larger");
    // Add the new selected class
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    // Remove existing mode classes from root HTML element
    document.documentElement.classList.remove("mode-standard", "mode-captions", "mode-sign", "mode-high-contrast");
    // Convert camelCase to kebab-case
    const modeClass = mode === "highContrast" ? "mode-high-contrast" : `mode-${mode}`;
    // Add the new selected mode class
    document.documentElement.classList.add(modeClass);
  }, [mode]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone full-screen pages — no shared nav/bg */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/parent" element={<ParentPortal />} />
        {/* Everything else uses the shared shell */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}
