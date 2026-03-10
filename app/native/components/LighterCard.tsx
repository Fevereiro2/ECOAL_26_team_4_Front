import { Eye, EyeOff, Plus } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { styles } from "../styles";
import type { AppColors, Lighter } from "../types";

type LighterCardProps = {
  lighter: Lighter;
  colors: AppColors;
  onView: (lighter: Lighter) => void;
  onCompare: (lighter: Lighter) => void;
};

export function LighterCard({ lighter, onView, onCompare, colors }: LighterCardProps) {
  const isPrivate = lighter.visibility === "private";

  return (
    <Pressable onPress={() => onView(lighter)} style={[styles.card, { backgroundColor: colors.panel, borderColor: colors.border }]}>
      <Image source={{ uri: lighter.image }} style={styles.cardImage} />
      <View style={[styles.badge, { backgroundColor: isPrivate ? "#27272a" : "#14532d" }]}>
        {isPrivate ? <EyeOff size={12} color="#e4e4e7" /> : <Eye size={12} color="#bbf7d0" />}
        <Text style={styles.badgeText}>{isPrivate ? "Private" : "Public"}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {lighter.name}
        </Text>
        <Text style={{ color: colors.primary, fontSize: 12 }}>
          {lighter.brand} • {lighter.year}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }} numberOfLines={2}>
          {lighter.description}
        </Text>

        <View style={styles.rowBetween}>
          <Pressable onPress={() => onView(lighter)} style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.actionBtnText}>Details</Text>
          </Pressable>
          <Pressable onPress={() => onCompare(lighter)} style={[styles.iconBtn, { borderColor: colors.border }]}>
            <Plus size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
