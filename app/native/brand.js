export const BRAND_GRADIENT = ["#E87947", "#EFAF53", "#F3CF67"];

export const fontFamilies = {
  headingBold: "Syne_700Bold",
  headingSemiBold: "Syne_600SemiBold",
  body: "SpaceGrotesk_400Regular",
  bodyMedium: "SpaceGrotesk_500Medium",
  bodyBold: "SpaceGrotesk_700Bold",
};

export const radii = {
  sm: 14,
  md: 22,
  lg: 30,
  pill: 999,
};

export const shadows = {
  dark: {
    card: {
      shadowColor: "#000000",
      shadowOpacity: 0.24,
      shadowRadius: 30,
      shadowOffset: { width: 0, height: 20 },
      elevation: 10,
    },
    button: {
      shadowColor: "#FFF8DD",
      shadowOpacity: 0.22,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  },
  light: {
    card: {
      shadowColor: "#704627",
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 16 },
      elevation: 8,
    },
    button: {
      shadowColor: "#5F3210",
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 5,
    },
  },
};

export function getShadow(theme, kind = "card") {
  return shadows[theme]?.[kind] ?? shadows.dark[kind];
}
