import { Eye, EyeOff, Plus } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../styles";
export function LighterCard({ lighter, onView, onCompare, colors }) {
    const isPrivate = lighter.visibility === "private";
    return (<Pressable onPress={() => onView(lighter)} style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }]}>
      <View>
        <Image source={{ uri: lighter.image }} style={styles.cardImage}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,7,5,0.24)" }}/>
      </View>
      <View style={[styles.badge, { backgroundColor: isPrivate ? "#2b211b" : "#413321", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }]}>
        {isPrivate ? <EyeOff size={12} color="#f7efe2"/> : <Eye size={12} color={colors.accent}/>}
        <Text style={styles.badgeText}>{isPrivate ? "Private" : "Public"}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" }}>
            {lighter.country}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 }}>
            {lighter.mechanism}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {lighter.name}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "800", marginTop: 3 }}>
          {lighter.brand} • {lighter.year}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 18 }} numberOfLines={2}>
          {lighter.description}
        </Text>

        <View style={styles.rowBetween}>
          <Pressable onPress={() => onView(lighter)} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.actionBtnText}>Details</Text>
          </Pressable>
          <Pressable onPress={() => onCompare(lighter)} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.panelSoft }]}>
            <Plus size={16} color={colors.accent}/>
          </Pressable>
        </View>
      </View>
    </Pressable>);
}
