import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { palette } from "../palette";
import { styles } from "../styles";

export function DetailModal({ item, onClose, colors }) {
    if (!item) return null;

    const criteria = [
        { label: "Durability", value: item.criteria.durability },
        { label: "Value", value: item.criteria.value },
        { label: "Rarity", value: item.criteria.rarity },
        { label: "Autonomy", value: item.criteria.autonomy },
    ];

    return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Image source={{ uri: item.image }} style={styles.modalImage} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 14 }]}>{item.name}</Text>
          <Text style={[styles.cardMeta, { color: colors.accent }]}>{item.period}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{item.mechanism}</Text>
          <Text style={{ color: colors.text, marginTop: 12, lineHeight: 22 }}>{item.description}</Text>

          <View style={{ marginTop: 14, gap: 6 }}>
            {criteria.map((c) => (
              <View key={c.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: colors.muted, width: 90 }}>{c.label}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 99, backgroundColor: colors.border, overflow: "hidden" }}>
                  <View style={{ width: `${(c.value / 10) * 100}%`, height: "100%", borderRadius: 99, backgroundColor: colors.primary }} />
                </View>
                <Text style={{ color: colors.text, width: 30, textAlign: "right", fontSize: 13, fontWeight: "600" }}>{c.value}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: palette.gradient.top, marginTop: 18 }]}>
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>Close</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
    );
}
