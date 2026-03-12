import { Modal, Pressable, Text, View } from "react-native";
import { palette } from "../palette";
import { styles } from "../styles";

export function CompareModal({ item, onClose, colors, lighters }) {
    if (!item) return null;
    const candidate = lighters.find((lighter) => lighter.id !== item.id) ?? item;
    const rows = [
        { key: "Durability", a: item.criteria.durability, b: candidate.criteria.durability },
        { key: "Value", a: item.criteria.value, b: candidate.criteria.value },
        { key: "Rarity", a: item.criteria.rarity, b: candidate.criteria.rarity },
        { key: "Autonomy", a: item.criteria.autonomy, b: candidate.criteria.autonomy },
    ];
    return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparison</Text>
          <Text style={{ color: colors.muted, marginBottom: 12 }}>{item.name} vs {candidate.name}</Text>
          {rows.map((row) => (
            <View key={row.key} style={styles.compareRow}>
              <Text style={{ color: colors.muted, width: 90 }}>{row.key}</Text>
              <Text style={{ color: colors.primary, width: 30, textAlign: "center", fontWeight: "600" }}>{row.a}</Text>
              <View style={[styles.compareBar, { backgroundColor: colors.border }]}>
                <View style={[styles.compareFill, { width: `${(row.a / 10) * 100}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={{ color: colors.accent, width: 30, textAlign: "center", fontWeight: "600" }}>{row.b}</Text>
            </View>
          ))}
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: palette.gradient.top }]}>
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
    );
}
