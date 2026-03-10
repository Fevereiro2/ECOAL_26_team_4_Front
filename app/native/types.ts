import type { Dispatch, SetStateAction } from "react";

export type Role = "guest" | "user" | "admin";

export type Lighter = {
  id: string;
  name: string;
  brand: string;
  year: number;
  country: string;
  mechanism: string;
  period: string;
  image: string;
  description: string;
  visibility: "public" | "private";
  criteria: {
    durability: number;
    value: number;
    rarity: number;
    autonomy: number;
  };
};

export type AppColors = {
  bg: string;
  panel: string;
  panelSoft: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  accent: string;
};

export type SharedAppState = {
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
  colors: AppColors;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export type SharedScreenProps = {
  shared: SharedAppState;
};
