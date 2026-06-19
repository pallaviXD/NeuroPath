// Mock class data for 24 students
export const mockStudents = [
  {
    id: "s1",
    name: "Priya Patel",
    profile: {
      primary: "sign",
      confidence: 94,
      breakdown: { visual: 45, narrative: 30, kinesthetic: 55, sign: 94 }
    },
    deafOrHoh: true,
    sessions: [
      { lessonId: "newtons-first-law", date: "2026-06-18", duration: 240, score: 100, interventions: 1 },
      { lessonId: "photosynthesis", date: "2026-06-19", duration: 310, score: 90, interventions: 2 }
    ],
    struggleHistory: [
      { timestamp: "10:42 AM", concept: "unbalanced force", type: "re-reading", modalityOffered: "sign", resolved: true },
      { timestamp: "11:15 AM", concept: "chloroplast flow", type: "wrong-answer", modalityOffered: "sign", resolved: true }
    ],
    // 12 checkpoints matching heatmap grid cells: 0=no struggle, 1=mild confusion, 2=intervention fired
    checkpoints: [0, 1, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0]
  },
  {
    id: "s2",
    name: "Diego Rodriguez",
    profile: {
      primary: "visual",
      confidence: 82,
      breakdown: { visual: 82, narrative: 34, kinesthetic: 51, sign: 22 }
    },
    deafOrHoh: false,
    sessions: [
      { lessonId: "newtons-first-law", date: "2026-06-18", duration: 180, score: 100, interventions: 1 }
    ],
    struggleHistory: [
      { timestamp: "10:44 AM", concept: "force vectors", type: "idle-timer", modalityOffered: "visual", resolved: true }
    ],
    checkpoints: [0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s3",
    name: "Wei Li",
    profile: {
      primary: "narrative",
      confidence: 76,
      breakdown: { visual: 40, narrative: 76, kinesthetic: 38, sign: 10 }
    },
    deafOrHoh: false,
    sessions: [
      { lessonId: "newtons-first-law", date: "2026-06-17", duration: 210, score: 95, interventions: 1 },
      { lessonId: "photosynthesis", date: "2026-06-19", duration: 290, score: 100, interventions: 1 }
    ],
    struggleHistory: [
      { timestamp: "10:48 AM", concept: "inertia", type: "re-reading", modalityOffered: "narrative", resolved: true }
    ],
    checkpoints: [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0]
  },
  {
    id: "s4",
    name: "Amara Kante",
    profile: {
      primary: "kinesthetic",
      confidence: 88,
      breakdown: { visual: 50, narrative: 45, kinesthetic: 88, sign: 15 }
    },
    deafOrHoh: false,
    sessions: [
      { lessonId: "newtons-first-law", date: "2026-06-18", duration: 200, score: 100, interventions: 2 }
    ],
    struggleHistory: [
      { timestamp: "10:50 AM", concept: "acceleration limits", type: "wrong-answer", modalityOffered: "kinesthetic", resolved: true }
    ],
    checkpoints: [0, 2, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0]
  },
  {
    id: "s5",
    name: "Sam O'Neill",
    profile: {
      primary: "sign",
      confidence: 80,
      breakdown: { visual: 35, narrative: 25, kinesthetic: 45, sign: 80 }
    },
    deafOrHoh: true,
    sessions: [
      { lessonId: "newtons-first-law", date: "2026-06-19", duration: 270, score: 90, interventions: 1 }
    ],
    struggleHistory: [
      { timestamp: "10:53 AM", concept: "constant velocity", type: "re-reading", modalityOffered: "sign", resolved: true }
    ],
    checkpoints: [0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0]
  },
  {
    id: "s6",
    name: "Chloe Jenkins",
    profile: {
      primary: "visual",
      confidence: 79,
      breakdown: { visual: 79, narrative: 52, kinesthetic: 60, sign: 18 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s7",
    name: "Aarav Sharma",
    profile: {
      primary: "kinesthetic",
      confidence: 85,
      breakdown: { visual: 55, narrative: 35, kinesthetic: 85, sign: 20 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s8",
    name: "Elena Rostova",
    profile: {
      primary: "narrative",
      confidence: 81,
      breakdown: { visual: 48, narrative: 81, kinesthetic: 50, sign: 30 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s9",
    name: "Mateo Silva",
    profile: {
      primary: "visual",
      confidence: 70,
      breakdown: { visual: 70, narrative: 60, kinesthetic: 40, sign: 12 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0]
  },
  {
    id: "s10",
    name: "Fatima Al-Sayed",
    profile: {
      primary: "narrative",
      confidence: 90,
      breakdown: { visual: 30, narrative: 90, kinesthetic: 45, sign: 25 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s11",
    name: "Marcus Aurelius",
    profile: {
      primary: "visual",
      confidence: 75,
      breakdown: { visual: 75, narrative: 40, kinesthetic: 68, sign: 10 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0]
  },
  {
    id: "s12",
    name: "Yuki Tanaka",
    profile: {
      primary: "kinesthetic",
      confidence: 92,
      breakdown: { visual: 60, narrative: 30, kinesthetic: 92, sign: 40 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
  },
  {
    id: "s13",
    name: "Sarah Jenkins",
    profile: {
      primary: "visual",
      confidence: 84,
      breakdown: { visual: 84, narrative: 42, kinesthetic: 55, sign: 15 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s14",
    name: "Lukas Weber",
    profile: {
      primary: "narrative",
      confidence: 78,
      breakdown: { visual: 50, narrative: 78, kinesthetic: 42, sign: 18 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s15",
    name: "Aisha Diallo",
    profile: {
      primary: "sign",
      confidence: 86,
      breakdown: { visual: 40, narrative: 50, kinesthetic: 35, sign: 86 }
    },
    deafOrHoh: true,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0]
  },
  {
    id: "s16",
    name: "Oliver Smith",
    profile: {
      primary: "visual",
      confidence: 65,
      breakdown: { visual: 65, narrative: 62, kinesthetic: 58, sign: 25 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
  },
  {
    id: "s17",
    name: "Sofia Rossi",
    profile: {
      primary: "kinesthetic",
      confidence: 77,
      breakdown: { visual: 68, narrative: 50, kinesthetic: 77, sign: 32 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s18",
    name: "Liam O'Connor",
    profile: {
      primary: "narrative",
      confidence: 85,
      breakdown: { visual: 45, narrative: 85, kinesthetic: 35, sign: 12 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0]
  },
  {
    id: "s19",
    name: "Zahra Ahmadi",
    profile: {
      primary: "sign",
      confidence: 89,
      breakdown: { visual: 32, narrative: 48, kinesthetic: 40, sign: 89 }
    },
    deafOrHoh: true,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0]
  },
  {
    id: "s20",
    name: "Noah Dubois",
    profile: {
      primary: "visual",
      confidence: 88,
      breakdown: { visual: 88, narrative: 40, kinesthetic: 62, sign: 20 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
  },
  {
    id: "s21",
    name: "Carlos Gomez",
    profile: {
      primary: "kinesthetic",
      confidence: 80,
      breakdown: { visual: 58, narrative: 42, kinesthetic: 80, sign: 15 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s22",
    name: "Mia Sorensen",
    profile: {
      primary: "narrative",
      confidence: 72,
      breakdown: { visual: 60, narrative: 72, kinesthetic: 50, sign: 28 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  {
    id: "s23",
    name: "Daniel Kim",
    profile: {
      primary: "visual",
      confidence: 91,
      breakdown: { visual: 91, narrative: 35, kinesthetic: 70, sign: 10 }
    },
    deafOrHoh: false,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]
  },
  {
    id: "s24",
    name: "Fatoumata Barry",
    profile: {
      primary: "sign",
      confidence: 93,
      breakdown: { visual: 38, narrative: 40, kinesthetic: 45, sign: 93 }
    },
    deafOrHoh: true,
    sessions: [],
    struggleHistory: [],
    checkpoints: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]
  }
];

// Seed initial intervention logs
export const initialLogs = [
  { id: "l1", studentId: "s1", studentName: "Priya Patel", modality: "sign", concept: "unbalanced force", type: "re-reading", time: "2m" },
  { id: "l2", studentId: "s2", studentName: "Diego Rodriguez", modality: "visual", concept: "force vectors", type: "idle-timer", time: "12s" },
  { id: "l3", studentId: "s3", studentName: "Wei Li", modality: "narrative", concept: "inertia", type: "re-reading", time: "38s" },
  { id: "l4", studentId: "s4", studentName: "Amara Kante", modality: "kinesthetic", concept: "acceleration limits", type: "wrong-answer", time: "1m" },
  { id: "l5", studentId: "s5", studentName: "Sam O'Neill", modality: "sign", concept: "constant velocity", type: "re-reading", time: "2m" }
];
