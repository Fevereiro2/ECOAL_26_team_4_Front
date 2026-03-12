import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../styles";
export function CompareModal({ item, onClose, colors, lighters }) {
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
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4 }}>
            Head to head
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Comparison</Text>
          <Text style={{ color: colors.muted, marginBottom: 14 }}>{item.name} vs {candidate.name}</Text>
          {rows.map((row) => (<View key={row.key} style={styles.compareRow}>
              <Text style={{ color: colors.muted, width: 90, fontSize: 12, fontWeight: "700" }}>{row.key}</Text>
              <Text style={{ color: colors.primary, width: 30, textAlign: "center", fontWeight: "900" }}>{row.a}</Text>
              <View style={[styles.compareBar, { backgroundColor: colors.border, marginHorizontal: 8 }]}>
                <View style={[styles.compareFill, { width: `${(row.a / 10) * 100}%`, backgroundColor: colors.primary }]}/>
              </View>
              <Text style={{ color: colors.accent, width: 30, textAlign: "center", fontWeight: "900" }}>{row.b}</Text>
            </View>))}
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.actionBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>);
}
