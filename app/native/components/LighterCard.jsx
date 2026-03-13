import { Eye, EyeOff, Plus } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { getBodyTextStyle, getEyebrowStyle } from "../artDirection";
import { BrandButton, IconCircleButton } from "./BrandButton";
import { styles } from "../styles";
export function LighterCard({ lighter, onView, onCompare, colors, style }) {
    const isPrivate = lighter.visibility === "private";
    return (<Pressable onPress={() => onView(lighter)} style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }, style]}>
      <View>
        <Image source={{ uri: lighter.image }} style={styles.cardImage}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,7,5,0.24)" }}/>
      </View>
      <View style={[styles.badge, { backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.border }]}>
        {isPrivate ? <EyeOff size={12} color="#f7efe2"/> : <Eye size={12} color={colors.accent}/>}
        <Text style={styles.badgeText}>{isPrivate ? "Private" : "Public"}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[getEyebrowStyle(colors), { marginBottom: 0, fontSize: 11, lineHeight: 13 }]}>
            {lighter.country}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>
            {lighter.mechanism}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {lighter.name}
        </Text>
        <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "700", marginTop: 6 }}>
          {lighter.brand} • {lighter.year}
        </Text>
        <Text style={[getBodyTextStyle(colors, true), { fontSize: 14, marginTop: 10, lineHeight: 22 }]} numberOfLines={2}>
          {lighter.description}
        </Text>

        <View style={[styles.rowBetween, { gap: 10 }]}>
          <BrandButton colors={colors} onPress={() => onView(lighter)} style={{ flex: 1 }}>
            Details
          </BrandButton>
          <IconCircleButton colors={colors} onPress={() => onCompare(lighter)}>
            <Plus size={16} color={colors.accent}/>
          </IconCircleButton>
        </View>
      </View>
    </Pressable>);
}
