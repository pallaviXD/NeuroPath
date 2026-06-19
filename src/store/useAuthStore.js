import { create } from "zustand";

// Simulated auth store — localStorage backed, no real backend
const STORAGE_KEY = "neuropath_auth";

const getStoredAuth = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredAuth(),
  isLoading: false,
  error: null,

  // roles: "student" | "teacher" | "parent" | "admin"
  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 900)); // simulate API

    const user = {
      id: "user_" + Date.now(),
      email,
      role,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user, isLoading: false });
    return user;
  },

  signup: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 1100));

    const user = {
      id: "user_" + Date.now(),
      email,
      role,
      name,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ user, isLoading: false });
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
