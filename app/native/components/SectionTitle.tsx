import { Text, View } from "react-native";
import { styles } from "../styles";
import type { AppColors } from "../types";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  colors: AppColors;
};

export function SectionTitle({ title, subtitle, colors }: SectionTitleProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}
