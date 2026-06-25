import { create } from "zustand";
import { isFirebaseConfigured, firebaseSignIn, firebaseSignUp, firebaseSignOut } from "../lib/firebase";

const STORAGE_KEY = "neuropath_auth";

const getStored = () => {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; }
  catch { return null; }
};

function nameFromEmail(email) {
  return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export const useAuthStore = create((set, get) => ({
  user: getStored(),
  isLoading: false,
  error: null,

  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      let user;
      if (isFirebaseConfigured) {
        // Real Firebase auth
        user = await firebaseSignIn(email, password);
        // role from Firestore — override if user explicitly picked one on login screen
        if (role && role !== "student") user.role = role;
      } else {
        // LocalStorage demo fallback
        await new Promise(r => setTimeout(r, 700));
        user = { id: "user_" + Date.now(), email, role, name: nameFromEmail(email), avatar: null };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (err) {
      const msg = err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err.code === "auth/invalid-email"
        ? "Invalid email address."
        : err.message || "Sign in failed.";
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      let user;
      if (isFirebaseConfigured) {
        user = await firebaseSignUp(name, email, password, role);
      } else {
        await new Promise(r => setTimeout(r, 900));
        user = { id: "user_" + Date.now(), email, role, name, avatar: null };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "That email is already registered. Try signing in."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : err.message || "Sign up failed.";
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    if (isFirebaseConfigured) await firebaseSignOut().catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
