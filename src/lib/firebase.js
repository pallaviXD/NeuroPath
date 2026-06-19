// Firebase integration layer with LocalStorage fallback
import { mockStudents } from "../data/mockClassData";

// Retrieve configuration from environment variables if present
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// For this high-fidelity prototype, we'll initialize the LocalStorage store if it's empty
const STORAGE_KEY_PROFILE = "neuropath_student_profile";
const STORAGE_KEY_STUDENTS = "neuropath_students_db";
const STORAGE_KEY_LOGS = "neuropath_intervention_logs";

if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(mockStudents));
}

export const dbService = {
  isRealFirebase: isFirebaseConfigured,

  // Student Profile Storage
  saveStudentProfile: async (profile) => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    
    // Also sync back to our mock class db if we are Student A/B or current user
    const currentStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || mockStudents;
    const userIndex = currentStudents.findIndex(s => s.id === "current_user");
    
    const studentRecord = {
      id: "current_user",
      name: "Current Student (You)",
      profile: {
        primary: profile.primary,
        confidence: profile.confidence,
        breakdown: profile.breakdown
      },
      deafOrHoh: profile.deafOrHoh || false,
      sessions: profile.sessions || [],
      struggleHistory: profile.struggleHistory || [],
      checkpoints: profile.checkpoints || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    if (userIndex > -1) {
      currentStudents[userIndex] = studentRecord;
    } else {
      currentStudents.push(studentRecord);
    }
    
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(currentStudents));
    return studentRecord;
  },

  getStudentProfile: () => {
    const data = localStorage.getItem(STORAGE_KEY_PROFILE);
    return data ? JSON.parse(data) : null;
  },

  // Save session telemetry
  saveSession: async (session) => {
    const profile = dbService.getStudentProfile() || {
      primary: "visual",
      confidence: 50,
      breakdown: { visual: 50, narrative: 50, kinesthetic: 50, sign: 50 },
      sessions: []
    };
    
    if (!profile.sessions) profile.sessions = [];
    profile.sessions.push(session);
    
    await dbService.saveStudentProfile(profile);
    return session;
  },

  // Retrieve all students (for Teacher Dashboard)
  getStudents: () => {
    const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return data ? JSON.parse(data) : mockStudents;
  },

  // Update a single student record in the dashboard DB
  updateStudent: (student) => {
    const currentStudents = dbService.getStudents();
    const index = currentStudents.findIndex(s => s.id === student.id);
    if (index > -1) {
      currentStudents[index] = student;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(currentStudents));
    }
  },

  // Track live interventions
  logIntervention: (logEntry) => {
    const existingLogsStr = localStorage.getItem(STORAGE_KEY_LOGS);
    const logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    const newLog = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      ...logEntry,
      time: "now"
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 50))); // Keep last 50 logs
    return newLog;
  },

  getInterventionLogs: () => {
    const data = localStorage.getItem(STORAGE_KEY_LOGS);
    return data ? JSON.parse(data) : [];
  }
};
