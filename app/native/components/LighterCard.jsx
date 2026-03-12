import { Eye, EyeOff, Plus } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { getShadow } from "../brand";
import { styles } from "../styles";
import { GradientButton } from "./GradientButton";
export function LighterCard({ lighter, onView, onCompare, colors, theme = "dark" }) {
    const isPrivate = lighter.visibility === "private";
    return (<Pressable onPress={() => onView(lighter)} style={[styles.card, getShadow(theme, "card"), { backgroundColor: colors.panel, borderColor: colors.border }]}>
      <View>
        <Image source={{ uri: lighter.image }} style={styles.cardImage}/>
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(10,7,5,0.16)" }}/>
      </View>
      <View style={[styles.badge, { backgroundColor: isPrivate ? colors.elevated : colors.panelSoft, borderWidth: 1, borderColor: colors.border }]}>
        {isPrivate ? <EyeOff size={12} color={colors.text}/> : <Eye size={12} color={colors.accent}/>}
        <Text style={styles.badgeText}>{isPrivate ? "Private" : "Public"}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={[styles.eyebrow, { color: colors.accent, marginBottom: 0 }]}> 
            {lighter.country}
          </Text>
          <Text style={[styles.metaText, { color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }]}>
            {lighter.mechanism}
          </Text>
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {lighter.name}
        </Text>
        <Text style={[styles.metaText, { color: colors.primary, marginTop: 4 }]}>
          {lighter.brand} • {lighter.year}
        </Text>
        <Text style={[styles.bodyText, { color: colors.muted, marginTop: 8 }]} numberOfLines={2}>
          {lighter.description}
        </Text>

        <View style={styles.rowBetween}>
          <GradientButton title="View details" onPress={() => onView(lighter)} colors={colors} theme={theme} style={{ flex: 1, marginRight: onCompare ? 10 : 0 }}/>
          {onCompare ? (<Pressable onPress={() => onCompare(lighter)} style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.panelSoft }]}>
            <Plus size={16} color={colors.accent}/>
          </Pressable>) : null}
        </View>
      </View>
    </Pressable>);
}
