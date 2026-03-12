import { Image, Modal, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";
import { GradientButton } from "./GradientButton";
export function DetailModal({ item, onClose, colors, theme = "dark" }) {
    if (!item)
        return null;
    return (<Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}> 
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}> 
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]}/>
          <Image source={{ uri: item.image }} style={styles.modalImage}/>
          <Text style={[styles.eyebrow, { color: colors.accent, marginTop: 14 }]}> 
            Collector file
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>{item.name}</Text>
          <Text style={[styles.metaText, { color: colors.primary, marginTop: 6 }]}>{item.brand} • {item.year}</Text>
          <Text style={[styles.metaText, { color: colors.muted, marginTop: 6 }]}>{item.country} • {item.mechanism}</Text>
          <Text style={[styles.bodyText, { color: colors.text, marginTop: 12 }]}>{item.description}</Text>
          <View style={{ marginTop: 16, gap: 8 }}>
            <Text style={[styles.metaText, { color: colors.muted }]}>Durability: {item.criteria.durability}/10</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>Value: {item.criteria.value}/10</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>Rarity: {item.criteria.rarity}/10</Text>
            <Text style={[styles.metaText, { color: colors.muted }]}>Autonomy: {item.criteria.autonomy}/10</Text>
          </View>
          <GradientButton title="Close" onPress={onClose} colors={colors} theme={theme} style={{ marginTop: 16 }}/>
        </ScrollView>
      </View>
    </Modal>);
}
