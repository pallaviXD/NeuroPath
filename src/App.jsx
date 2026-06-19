import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import AmbientBackground from "./components/AmbientBackground";
import CursorGlow from "./components/CursorGlow";
import Landing from "./routes/Landing";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Onboarding from "./routes/Onboarding";
import Lesson from "./routes/Lesson";
import Demo from "./routes/Demo";
import ParentPortal from "./routes/ParentPortal";
import DashboardLayout from "./routes/Dashboard/DashboardLayout";
import Heatmap from "./routes/Dashboard/Heatmap";
import Analytics from "./routes/Dashboard/Analytics";
import LiveLog from "./routes/Dashboard/LiveLog";
import SignLanguageView from "./routes/Dashboard/SignLanguageView";
import StudentDetail from "./routes/Dashboard/StudentDetail";

// Pages that manage their own full-screen layout (no shared nav)
const STANDALONE_PATHS = ["/login", "/signup", "/parent"];

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
          <Route path="/lesson/:lessonId" element={<Lesson />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Heatmap />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="live-log" element={<LiveLog />} />
            <Route path="sign-language" element={<SignLanguageView />} />
            <Route path="student/:id" element={<StudentDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
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
