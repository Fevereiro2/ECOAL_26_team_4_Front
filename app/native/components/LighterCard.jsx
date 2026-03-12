import { Eye, EyeOff, Plus } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { palette } from "../palette";
import { styles } from "../styles";

export function LighterCard({ lighter, onView, onCompare, colors }) {
    const isPrivate = lighter.visibility === "private";
    return (
    <Pressable onPress={() => onView(lighter)} style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }]}>
      <View style={{ padding: 12, paddingBottom: 0 }}>
        <Image source={{ uri: lighter.image }} style={styles.cardImage} />
      </View>
      <View style={[styles.badge, { backgroundColor: isPrivate ? "rgba(0,0,0,0.55)" : "rgba(35,31,26,0.65)" }]}>
        {isPrivate ? <EyeOff size={12} color="#F5F1E8" /> : <Eye size={12} color="#F3CF67" />}
        <Text style={[styles.badgeText, { color: "#F5F1E8" }]}>{isPrivate ? "Private" : "Public"}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {lighter.name}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.accent }]}>
          {lighter.brand} • {lighter.year}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 20 }} numberOfLines={2}>
          {lighter.description}
        </Text>

        <View style={styles.rowBetween}>
          <Pressable onPress={() => onView(lighter)} style={[styles.actionBtn, { backgroundColor: palette.gradient.top }]}>
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>Details</Text>
          </Pressable>
          <Pressable onPress={() => onCompare(lighter)} style={[styles.iconBtn, { borderColor: colors.border }]}>
            <Plus size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
    );
}
