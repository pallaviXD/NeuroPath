// Firebase integration layer — real Firebase when configured, localStorage fallback otherwise
import { mockStudents } from "../data/mockClassData";

// ─── Real Firebase (lazy-loaded only when keys present) ────────────────────
let _auth = null;
let _db = null;
let _firebaseApp = null;

const firebaseConfig = {
  apiKey:            import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env?.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

async function getFirebase() {
  if (!isFirebaseConfigured) return { auth: null, db: null };
  if (_auth && _db) return { auth: _auth, db: _db };
  const { initializeApp, getApps } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const { getFirestore } = await import("firebase/firestore");
  if (!getApps().length) _firebaseApp = initializeApp(firebaseConfig);
  _auth = getAuth(_firebaseApp);
  _db   = getFirestore(_firebaseApp);
  return { auth: _auth, db: _db };
}

// ─── Auth helpers ──────────────────────────────────────────────────────────
export async function firebaseSignUp(name, email, password, role) {
  const { auth, db } = await getFirebase();
  if (!auth) throw new Error("Firebase not configured");
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
  const { doc, setDoc } = await import("firebase/firestore");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name, email, role,
    createdAt: new Date().toISOString(),
    studentProfile: null,
  });
  return { id: cred.user.uid, name, email, role };
}

export async function firebaseSignIn(email, password) {
  const { auth, db } = await getFirebase();
  if (!auth) throw new Error("Firebase not configured");
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const { doc, getDoc } = await import("firebase/firestore");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  const data = snap.exists() ? snap.data() : {};
  return {
    id: cred.user.uid,
    name: cred.user.displayName || data.name || email.split("@")[0],
    email,
    role: data.role || "student",
  };
}

export async function firebaseSignOut() {
  const { auth } = await getFirebase();
  if (!auth) return;
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}

export async function firebaseSaveProfile(userId, profile) {
  const { db } = await getFirebase();
  if (!db) return;
  const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
  await setDoc(doc(db, "users", userId, "profile", "cognitive"), {
    ...profile, updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function firebaseGetProfile(userId) {
  const { db } = await getFirebase();
  if (!db) return null;
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "users", userId, "profile", "cognitive"));
  return snap.exists() ? snap.data() : null;
}

// ─── LocalStorage keys ─────────────────────────────────────────────────────
const STORAGE_KEY_PROFILE  = "neuropath_student_profile";
const STORAGE_KEY_STUDENTS = "neuropath_students_db";
const STORAGE_KEY_LOGS     = "neuropath_intervention_logs";

if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(mockStudents));
}

// ─── dbService (localStorage — always available as fallback) ──────────────
export const dbService = {
  isRealFirebase: isFirebaseConfigured,

  saveStudentProfile: async (profile) => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    const students = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || mockStudents;
    const idx = students.findIndex(s => s.id === "current_user");

    // Dynamic resolution of student name based on logged-in user
    let displayName = "Current Student";
    try {
      const auth = JSON.parse(localStorage.getItem("neuropath_auth"));
      if (auth && auth.name) {
        if (auth.role === "student") {
          displayName = auth.name;
        } else if (auth.role === "parent") {
          const wardsDb = JSON.parse(localStorage.getItem("neuropath_parent_wards") || "{}");
          displayName = auth.email ? (wardsDb[auth.email] || "your child") : "your child";
        } else {
          displayName = `Demo Student (${auth.name})`;
        }
      }
    } catch (e) {}

    const record = {
      id: "current_user", name: displayName,
      profile: { primary: profile.primary, confidence: profile.confidence, breakdown: profile.breakdown },
      deafOrHoh: profile.deafOrHoh || false,
      capacityLevel: profile.capacityLevel || "medium",
      sessions: profile.sessions || [],
      struggleHistory: profile.struggleHistory || [],
      checkpoints: profile.checkpoints || [0,0,0,0,0,0,0,0,0,0,0,0],
    };
    if (idx > -1) students[idx] = record; else students.push(record);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    return record;
  },

  getStudentProfile: () => {
    const d = localStorage.getItem(STORAGE_KEY_PROFILE);
    return d ? JSON.parse(d) : null;
  },

  saveSession: async (session) => {
    const profile = dbService.getStudentProfile() || { sessions: [] };
    if (!profile.sessions) profile.sessions = [];
    profile.sessions.push(session);
    await dbService.saveStudentProfile(profile);
    return session;
  },

  getStudents: () => {
    const d = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const students = d ? JSON.parse(d) : mockStudents;
    try {
      const auth = JSON.parse(localStorage.getItem("neuropath_auth"));
      if (auth) {
        // Read parent ward names
        const wardsDb = JSON.parse(localStorage.getItem("neuropath_parent_wards") || "{}");
        const wardName = auth.email ? (wardsDb[auth.email] || "") : "";

        return students.map(s => {
          if (s.id === "current_user") {
            let name = s.name;
            if (auth.role === "student") {
              const baseName = auth.name || "Current Student";
              name = baseName.includes("(You)") ? baseName : `${baseName} (You)`;
            } else if (auth.role === "parent") {
              name = wardName || "your child";
            } else {
              name = name.replace(" (You)", "");
              if (name === "Current Student") {
                name = `Demo Student (${auth.name || "Teacher"})`;
              }
            }
            return { ...s, name };
          }
          return s;
        });
      }
    } catch (e) {}
    return students;
  },

  updateStudent: (student) => {
    const students = dbService.getStudents();
    const i = students.findIndex(s => s.id === student.id);
    if (i > -1) { students[i] = student; localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students)); }
  },

  logIntervention: (entry) => {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || "[]");
    const newLog = { id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2,9), ...entry, time: "now" };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs.slice(0, 50)));
    return newLog;
  },

  getInterventionLogs: () => {
    const d = localStorage.getItem(STORAGE_KEY_LOGS);
    const logs = d ? JSON.parse(d) : [];
    try {
      const auth = JSON.parse(localStorage.getItem("neuropath_auth"));
      if (auth) {
        // Read parent ward names
        const wardsDb = JSON.parse(localStorage.getItem("neuropath_parent_wards") || "{}");
        const wardName = auth.email ? (wardsDb[auth.email] || "") : "";

        return logs.map(l => {
          if (l.studentId === "current_user") {
            let name = l.studentName;
            if (auth.role === "student") {
              const baseName = auth.name || "Current Student";
              name = baseName.includes("(You)") ? baseName : `${baseName} (You)`;
            } else if (auth.role === "parent") {
              name = wardName || "your child";
            } else {
              name = name.replace(" (You)", "");
              if (name === "Current Student") {
                name = `Demo Student (${auth.name || "Teacher"})`;
              }
            }
            return { ...l, studentName: name };
          }
          return l;
        });
      }
    } catch (e) {}
    return logs;
  },
};
