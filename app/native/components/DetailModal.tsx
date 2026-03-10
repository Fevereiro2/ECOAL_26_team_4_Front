import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";
import type { AppColors, Lighter } from "../types";

type DetailModalProps = {
  item: Lighter | null;
  onClose: () => void;
  colors: AppColors;
};

export function DetailModal({ item, onClose, colors }: DetailModalProps) {
  if (!item) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}> 
          <Image source={{ uri: item.image }} style={styles.modalImage} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>{item.name}</Text>
          <Text style={{ color: colors.primary }}>{item.brand} • {item.year}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{item.country} • {item.mechanism}</Text>
          <Text style={{ color: colors.text, marginTop: 12, lineHeight: 20 }}>{item.description}</Text>
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: colors.muted }}>Durability: {item.criteria.durability}/10</Text>
            <Text style={{ color: colors.muted }}>Value: {item.criteria.value}/10</Text>
            <Text style={{ color: colors.muted }}>Rarity: {item.criteria.rarity}/10</Text>
            <Text style={{ color: colors.muted }}>Autonomy: {item.criteria.autonomy}/10</Text>
          </View>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.primary, marginTop: 16 }]}>
            <Text style={styles.actionBtnText}>Close</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
