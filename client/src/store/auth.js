import { create } from "zustand";
import { api } from "../lib/api";

export const useAuth = create((set) => ({
  user: null,
  patient: null,
  loading: true,
  setSession: (token, user) => {
    localStorage.setItem("elara_token", token);
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("elara_token");
    set({ user: null, patient: null });
    window.location.href = "/login";
  },
  hydrate: async () => {
    const token = localStorage.getItem("elara_token");
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, patient: data.patient, loading: false });
    } catch {
      localStorage.removeItem("elara_token");
      set({ loading: false });
    }
  },
}));

export const useUi = create((set) => ({
  commandOpen: false,
  dark: localStorage.getItem("elara_dark") === "1",
  setCommand: (commandOpen) => set({ commandOpen }),
  toggleDark: () =>
    set((s) => {
      const dark = !s.dark;
      localStorage.setItem("elara_dark", dark ? "1" : "0");
      document.documentElement.classList.toggle("dark", dark);
      return { dark };
    }),
}));
