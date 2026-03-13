import { Image, Modal, ScrollView, Text, View } from "react-native";
import { getBodyTextStyle, getEyebrowStyle, getPanelStyle } from "../artDirection";
import { BrandButton } from "./BrandButton";
import { styles } from "../styles";
export function DetailModal({ item, onClose, colors }) {
    if (!item)
        return null;
    return (<Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView style={[styles.modalCard, getPanelStyle(colors, { radius: 30, padding: 18 }), { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}> 
          <Image source={{ uri: item.image }} style={styles.modalImage}/>
          <Text style={[getEyebrowStyle(colors), { marginTop: 14 }]}>
            Club file
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>{item.name}</Text>
          <Text style={{ color: colors.accent, fontWeight: "800" }}>{item.brand} • {item.year}</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>{item.country} • {item.mechanism}</Text>
          <Text style={[getBodyTextStyle(colors), { marginTop: 12 }]}>{item.description}</Text>
          <View style={{ marginTop: 16, gap: 8 }}>
            <Text style={{ color: colors.muted }}>Durability: {item.criteria.durability}/10</Text>
            <Text style={{ color: colors.muted }}>Value: {item.criteria.value}/10</Text>
            <Text style={{ color: colors.muted }}>Rarity: {item.criteria.rarity}/10</Text>
            <Text style={{ color: colors.muted }}>Autonomy: {item.criteria.autonomy}/10</Text>
          </View>
          <BrandButton colors={colors} onPress={onClose} style={{ marginTop: 16 }}>
            Close
          </BrandButton>
        </ScrollView>
      </View>
    </Modal>);
}
