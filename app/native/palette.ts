import type { AppColors } from "./types";

export const palette: Record<"dark" | "light", AppColors> = {
  dark: {
    bg: "#0a0a0b",
    panel: "#17181b",
    panelSoft: "#111215",
    text: "#f4f4f5",
    muted: "#a1a1aa",
    border: "#26272b",
    primary: "#f59e0b",
    accent: "#f97316",
  },
  light: {
    bg: "#f8fafc",
    panel: "#ffffff",
    panelSoft: "#f1f5f9",
    text: "#111827",
    muted: "#6b7280",
    border: "#e2e8f0",
    primary: "#d97706",
    accent: "#ea580c",
  },
};
