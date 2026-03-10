import { Heart, User } from "lucide-react-native";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { mockUsers } from "../../data/mockData";
import { SectionTitle } from "../components/SectionTitle";
import { styles } from "../styles";
import type { Role, SharedScreenProps } from "../types";

export function ProfileScreen({ shared }: SharedScreenProps) {
  const { role, setRole, colors, theme, toggleTheme } = shared;
  const roleText = role === "guest" ? "Guest" : role === "admin" ? "Admin Vault" : "Collector";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

        <View style={[styles.profileCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <User color={colors.primary} size={26} />
          <Text style={[styles.profileName, { color: colors.text }]}>{roleText}</Text>
          <Text style={{ color: colors.muted }}>Role: {role}</Text>
        </View>

        <View style={[styles.actionGroup, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Pressable style={styles.actionRow} onPress={toggleTheme}>
            <Text style={{ color: colors.text }}>{theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}</Text>
          </Pressable>
          <Pressable style={styles.actionRow} onPress={() => Alert.alert("Wishlist", "Wishlist screen is available in this native build.")}>
            <Heart color={colors.accent} size={16} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>Wishlist</Text>
          </Pressable>
        </View>

        <SectionTitle title="Quick Role Switch" subtitle="For prototype testing" colors={colors} />
        {mockUsers.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => setRole(user.role as Role)}
            style={[styles.roleBtn, { backgroundColor: role === user.role ? colors.primary : colors.panel, borderColor: colors.border }]}
          >
            <Text style={{ color: role === user.role ? "#111" : colors.text, textTransform: "capitalize", fontWeight: "700" }}>{user.role}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
