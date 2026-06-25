# NeuroPath

> **The AI tutoring platform that figures out how each student actually learns — and teaches in that language.**

NeuroPath watches how a student interacts with a concept (hover, scroll, pause, re-read, reaction time) and silently builds a cognitive fingerprint. Every lesson then reshapes itself into the format that student's brain understands — visual diagrams, narrative stories, hands-on simulations, or 3D sign language. Zero quizzes. Zero labels. Zero self-report.

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/pallaviXD/NeuroPath.git
cd NeuroPath

# 2. Install
npm install

# 3. Configure keys (optional — app works without them via fallback)
cp .env.example .env
# Add VITE_GEMINI_API_KEY and VITE_FIREBASE_* keys

# 4. Run
npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Environment Keys

Copy `.env.example` → `.env` and fill in:

| Variable | Purpose | Get it at |
|---|---|---|
| `VITE_GEMINI_API_KEY` | PDF ingestion, story/visual/sign generation, capacity analysis | [aistudio.google.com](https://aistudio.google.com/app/apikey) — free tier |
| `VITE_FIREBASE_API_KEY` + others | Real email/password auth, Firestore profile storage | [console.firebase.google.com](https://console.firebase.google.com) |

**Without any keys:** The app runs fully on localStorage auth + offline AI fallbacks. All features work, just without real Gemini generation.

---

## ✨ Feature Overview

### 🧠 Cognitive Fingerprinting
- 2-step behavioral calibration: **Balloon Game** (kinesthetic reflex) + **Story Quiz** (narrative comprehension)
- Tracks accuracy, reaction time, scroll depth, dwell time — never asks the student directly
- Gemini analyzes scores → assigns `capacityLevel` (Advanced / Standard / Simplified) + teaching recommendation
- Profile stored in Firebase or localStorage, recalibrates over time

### ⚡ Live Struggle Detection
- 3 real-time signals: scroll-back re-reading, 15s idle on assessment, wrong-then-right correction
- Calls Gemini's `resolveStruggle()` → recommends best next modality
- Switches format inline in under 1 second — no popup, no redirect
- Every outcome tracked and shown in teacher dashboard

### 🎓 4 Adaptive Learning Modalities
| Modality | What it does |
|---|---|
| **Visual** | Wikipedia diagram fetch + curated YouTube videos |
| **Narrative** | Full story with characters, Gemini-generated per lesson |
| **Kinesthetic** | Physics sandbox / variable simulators |
| **Sign Language** | 3D avatar (Three.js) signs entire syllabus word-by-word, SVG hand illustrations, fingerspell fallback |

### 📄 Instant PDF → Lesson
- Drop any PDF, TXT, or MD file on `/instant`
- Gemini extracts concepts, generates all 4 modalities **in parallel**
- Result appears inline — no navigation, no "saved somewhere" redirect
- Inline quiz at the bottom
- Works with offline fallback if no API key

### 🏫 Teacher Command Panel (`/dashboard`)
- **Class Heatmap** — 24-student grid, computed from real data. Pink = intervention fired. Amber = hesitation. Click any student → full detail view
- **Analytics** — Modality distribution pie (live), intervention trends, hardest concepts
- **Live Log** — Real-time intervention feed with filters, simulated classroom events via eventBus
- **Sign Language View** — Deaf/HoH student list, 5 preset gloss sequences previewed via SVG sign player
- **Content Ingestion** — Upload PDF → Gemini generates lesson → auto-appears in Saved Lessons
- **Saved Lessons** — All AI-generated lessons with cached modality status, zero API calls to reopen

### 👩‍🎓 Student Dashboard (`/student-dashboard`)
- Cognitive profile with modality breakdown bars
- Capacity level badge from balloon game AI analysis
- Session history with scores
- Quick CTAs to lessons, PDF upload, profile rebuild

### 🏠 Parent Portal (`/parent`)
- Weekly digest: time spent, concepts mastered, struggles resolved
- Plain-language at-home support tips personalized to child's modality
- No raw behavioral telemetry exposed

---

## 🗺 All Routes

| Path | Description | Who |
|---|---|---|
| `/` | Landing page — product pitch + live demos | Everyone |
| `/login` | Sign in with role selector | Everyone |
| `/signup` | 2-step role → details sign up | Everyone |
| `/onboarding` | Cognitive fingerprinting (Balloon Game + Story Quiz + AI analysis) | Students |
| `/lessons` | Curriculum hub — all lessons with profile-adapted cards | Students |
| `/lesson/:id` | Full adaptive lesson player | Students |
| `/instant` | Drop PDF → instant 4-format lesson, inline | Everyone |
| `/student-dashboard` | Student progress, profile, recent sessions | Students |
| `/demo` | Dual-student live simulation (Student A vs Student B) | Everyone |
| `/dashboard` | Teacher command panel (6 tabs) | Teachers / Admins |
| `/dashboard/analytics` | Charts and trends | Teachers |
| `/dashboard/live-log` | Real-time intervention feed | Teachers |
| `/dashboard/sign-language` | Deaf/HoH student tracker + sign previewer | Teachers |
| `/dashboard/content` | PDF upload → AI lesson generation | Teachers |
| `/dashboard/saved` | All AI-generated lessons | Teachers |
| `/dashboard/student/:id` | Per-student detail: radar chart, session history, intervention replay | Teachers |
| `/parent` | Parent weekly digest portal | Parents |

---

## 👥 User Roles

| Role | Login redirects to | Nav shows |
|---|---|---|
| **Student** | `/student-dashboard` | Home, Lessons, PDF Lesson, My Progress |
| **Teacher** | `/dashboard` | Home, Dashboard, Lessons, PDF Upload |
| **Admin** | `/dashboard` | Home, Dashboard, Lessons, PDF Upload |
| **Parent** | `/parent` | Home, My Portal |

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 8 |
| Styling | Tailwind CSS v3 + custom glassmorphism utilities |
| Animation | Framer Motion (particles, spring physics, scroll transforms) |
| 3D Sign Language | Three.js + React Three Fiber (procedural humanoid avatar) |
| Sign SVGs | Custom ASL hand illustrations (15 glosses) + fingerspell sprite |
| Charts | Recharts |
| State | Zustand (student profile, dashboard, accessibility, auth) |
| Routing | React Router v7 |
| AI | Gemini 2.5 Flash (`@google/genai`) |
| Auth | Firebase Authentication (Email/Password) |
| DB | Firebase Firestore + localStorage fallback |
| PDF parsing | pdfjs-dist (client-side, no server needed) |

---

## 🏗 Architecture

```
Student uploads PDF
       ↓
pdfExtractor (client-side, pdfjs-dist)
       ↓
cleanText → generateLessonFoundation (Gemini)
       ↓
Promise.allSettled([
  generateVisualMode,     → WikiImageFetcher + YouTube links
  generateStoryMode,      → narrative with characters
  generateShorterMode,    → concise bullet summary
  generateFullSignStudy,  → word-by-word SgSL gloss → 3D avatar
])
       ↓
Lesson saved to localStorage / Firestore
       ↓
Student opens lesson → chooses format → learns
       ↓
Struggle detected (scroll / idle / wrong answer)
       ↓
resolveStruggle (Gemini) → recommendedModality
       ↓
New format rendered inline → teacher dashboard updated
```

---

## ♿ Accessibility

- **Sign language** is a first-class delivery format, not a sidebar feature
- 3 sign systems: SgSL (primary), ASL SVG illustrations, fingerspell fallback for unknown words
- Accessibility modes: Standard / Captions / Sign / High Contrast
- Font size controls: Normal / Large / Larger
- Reduced motion support via `prefers-reduced-motion`
- WCAG 2.2 AA color contrast on all text
- Deaf/HoH toggle in onboarding locks primary modality to sign with no behavioral proof required

---

## 📋 Firestore Schema

```
users/{uid}
  ├── name, email, role, createdAt
  └── profile/cognitive
        ├── primary, confidence, breakdown
        ├── capacityLevel, difficultyLabel, capacityNote
        ├── deafOrHoh, signRecommended
        └── sessions[], struggleHistory[]
```

---

## 🔐 Privacy

- Behavioral telemetry (re-read counts, reaction times, idle durations) stays internal
- No clinical diagnosis labels — only learning-format preferences
- Parents see plain-language summaries only — no raw telemetry
- FERPA / COPPA / GDPR-K aligned by design

---

## 📦 Scripts

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

© 2026 NeuroPath · Built for every learner · Every format · Every mind
