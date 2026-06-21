# NeuroPath

**The AI tutoring platform that figures out how each student actually learns — and teaches in that language.**

NeuroPath watches how a student interacts with a concept (hover, scroll, pause, re-read) and silently builds a cognitive profile. Every lesson then reshapes itself into the format that student's brain actually understands — visual diagrams, narrative stories, hands-on simulations, or 3D sign language. No self-report surveys — a short behavioral calibration infers how you learn.

---

## ✨ Features

- **Cognitive Fingerprinting** — Behavior-based learning profile built in the first session via silent calibration tasks (speed, accuracy, effort) — no self-report surveys.
- **4 Adaptive Modalities** — Visual diagrams, narrative stories, kinesthetic simulations, and native sign language (ASL/BSL/ISL).
- **Struggle Detection & Micro-Intervention** — Re-read, long pause, wrong-then-right triggers an instant modality switch — in under 1 second, inline.
- **3D Sign Language Avatar** — Three.js-powered signing avatar renders explanations inline. First-class format, not an accessibility afterthought.
- **Teacher Command Panel** — Live classroom heatmap, modality distribution, intervention history, per-student deep dive with radar chart.
- **Role-Based Auth** — Student, Teacher, Parent, and Admin portals with purpose-built dashboards.
- **Parent Portal** — Plain-language weekly digest of progress, struggles, and at-home support tips.
- **Privacy by Design** — Behavioral telemetry stays internal. FERPA/COPPA/GDPR-K aligned.

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| 3D Avatar | Three.js + React Three Fiber |
| Charts | Recharts |
| State | Zustand |
| Routing | React Router v7 |
| Persistence | LocalStorage (Firebase-ready) |
| AI Agent | Google Gemini 2.5 Flash via `/api/gemini` proxy |

---

## 🔑 Gemini API Setup (required for AI agent)

**Recommended (production):** Server-side proxy — key never exposed in the browser.

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Copy `.env.example` to `.env`
3. Set `GEMINI_API_KEY=your_key_here` and `VITE_USE_GEMINI_PROXY=true`
4. On Vercel, add `GEMINI_API_KEY` as an environment variable (not `VITE_` prefixed)
5. Restart the dev server

**Local dev shortcut:** Set `VITE_GEMINI_API_KEY` for direct browser calls (omit proxy flag).

The `/api/gemini` serverless route handles all agent calls when the proxy is enabled. Without a key, struggle interventions use rule-based fallback.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗺 Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in (any email + password for demo) |
| `/signup` | Create account — role selector flow |
| `/onboarding` | Cognitive fingerprinting session |
| `/lesson/:id` | Adaptive lesson player |
| `/demo` | Dual-student simulation demo |
| `/dashboard` | Teacher command panel |
| `/dashboard/analytics` | Charts & trends |
| `/dashboard/live-log` | Real-time intervention feed |
| `/dashboard/sign-language` | Deaf/HoH student tracker |
| `/dashboard/student/:id` | Per-student detail view |
| `/parent` | Parent weekly digest portal |

---

## 👥 User Roles

- **Student** → Onboarding → Adaptive lessons → Profile
- **Teacher** → Live classroom dashboard → Interventions → Student profiles
- **Parent** → Weekly digest → At-home tips
- **Admin** → District rollout console

---

Built for every learner. © 2026 NeuroPath
