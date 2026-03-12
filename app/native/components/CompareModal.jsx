import { Modal, Text, View } from "react-native";
import { styles } from "../styles";
import { GradientButton } from "./GradientButton";
export function CompareModal({ item, onClose, colors, lighters, theme = "dark" }) {
    if (!item)
        return null;
    const candidate = lighters.find((lighter) => lighter.id !== item.id) ?? item;
    const rows = [
        { key: "Durability", a: item.criteria.durability, b: candidate.criteria.durability },
        { key: "Value", a: item.criteria.value, b: candidate.criteria.value },
        { key: "Rarity", a: item.criteria.rarity, b: candidate.criteria.rarity },
        { key: "Autonomy", a: item.criteria.autonomy, b: candidate.criteria.autonomy },
    ];
    return (<Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
          <Text style={[styles.eyebrow, { color: colors.accent, marginBottom: 4 }]}> 
            Head to head
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparison</Text>
          <Text style={[styles.bodyText, { color: colors.muted, marginBottom: 14 }]}>{item.name} vs {candidate.name}</Text>
          {rows.map((row) => (<View key={row.key} style={styles.compareRow}>
              <Text style={[styles.metaText, { color: colors.muted, width: 90 }]}>{row.key}</Text>
              <Text style={[styles.metaText, { color: colors.primary, width: 30, textAlign: "center" }]}>{row.a}</Text>
              <View style={[styles.compareBar, { backgroundColor: colors.border, marginHorizontal: 8 }]}>
                <View style={[styles.compareFill, { width: `${(row.a / 10) * 100}%`, backgroundColor: colors.primary }]}/>
              </View>
              <Text style={[styles.metaText, { color: colors.accent, width: 30, textAlign: "center" }]}>{row.b}</Text>
            </View>))}
          <GradientButton title="Close" onPress={onClose} colors={colors} theme={theme}/>
        </View>
      </View>
    </Modal>);
}
