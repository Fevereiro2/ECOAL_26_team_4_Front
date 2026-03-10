import type { AppColors } from "./types";

export const palette: Record<"dark" | "light", AppColors> = {
  dark: {
    bg: "#120909",
    panel: "#1f1010",
    panelSoft: "#160c0c",
    text: "#fff1f2",
    muted: "#f5b9bf",
    border: "#3b1b1f",
    primary: "#ef4444",
    accent: "#f97316",
  },
  light: {
    bg: "#fff5f5",
    panel: "#ffffff",
    panelSoft: "#ffe4e6",
    text: "#2b0a0e",
    muted: "#8f3a44",
    border: "#fecdd3",
    primary: "#dc2626",
    accent: "#f43f5e",
  },
};
