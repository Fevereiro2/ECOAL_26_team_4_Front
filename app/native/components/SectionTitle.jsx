import { Text, View } from "react-native";
import { styles } from "../styles";
export function SectionTitle({ title, subtitle, colors }) {
    return (<View style={{ marginBottom: 12 }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
    </View>);
}
