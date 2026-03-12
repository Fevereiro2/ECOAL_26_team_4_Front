import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";
export function DetailModal({ item, onClose, colors }) {
    if (!item)
        return null;
    return (<Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}> 
          <Image source={{ uri: item.image }} style={styles.modalImage}/>
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", marginTop: 14 }}>
            Club file
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>{item.name}</Text>
          <Text style={{ color: colors.primary, fontWeight: "800" }}>{item.brand} • {item.year}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{item.country} • {item.mechanism}</Text>
          <Text style={{ color: colors.text, marginTop: 12, lineHeight: 20 }}>{item.description}</Text>
          <View style={{ marginTop: 16, gap: 8 }}>
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
    </Modal>);
}
