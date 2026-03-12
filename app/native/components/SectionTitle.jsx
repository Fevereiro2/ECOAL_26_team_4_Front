import { Text, View } from "react-native";
import { styles } from "../styles";
export function SectionTitle({ title, subtitle, colors }) {
    return (<View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 4 }}>
        Roadhouse selection
      </Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>);
}
