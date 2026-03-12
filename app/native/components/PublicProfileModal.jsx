import { useMemo } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { palette } from "../palette";
import { styles } from "../styles";

export function PublicProfileModal({ user, lighters, onClose, colors }) {
    if (!user) return null;

    // Only get public lighters for this user
    const userLighters = useMemo(
        () => lighters.filter((lighter) => lighter.ownerId === user.id && lighter.visibility === "public"),
        [lighters, user]
    );

    const displayName = user.name || "Collector";
    const displayBio = user.bio?.trim() || "Collector of Vintage and Rare Lighters";

    return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={onClose} />
        <ScrollView style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border, padding: 0 }]} contentContainerStyle={{ padding: 16 }}>
          
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "800", marginBottom: 16 }}>User Profile</Text>
          
          <View style={[styles.profileCard, { backgroundColor: colors.bgElevated, borderColor: colors.border, margin: 0, padding: 16 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, width: "100%" }}>
              <Image
                source={user.avatar?.trim() ? { uri: user.avatar } : require("../../../assets/images/prototypes/profile/posts.png")}
                style={[styles.profileAvatar, { borderWidth: 2, borderColor: colors.border, width: 64, height: 64, borderRadius: 32 }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }} numberOfLines={2}>
                  {displayName}
                </Text>
                <Text style={{ color: colors.accent, fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>
                  {user.role === "admin" ? "Admin Vault" : "Collector"}
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 22 }}>{displayBio}</Text>
          </View>

          <View style={{ flexDirection: "row", marginTop: 14, marginBottom: 14 }}>
            <View style={[styles.stat, { backgroundColor: colors.bgElevated, borderColor: colors.border, flex: 1, marginRight: 0 }]}>
              <Text style={{ color: colors.muted, fontSize: 11 }}>Public Collection</Text>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>{userLighters.length}</Text>
            </View>
          </View>

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Items in Collection</Text>
          
          {userLighters.length === 0 ? (
            <View style={{ padding: 16, backgroundColor: colors.bgElevated, borderRadius: 12, borderColor: colors.border, borderWidth: 1 }}>
              <Text style={{ color: colors.muted, textAlign: "center" }}>No public items to display.</Text>
            </View>
          ) : null}

          {userLighters.map((lighter) => (
            <View key={lighter.id} style={[styles.listRow, { backgroundColor: colors.bgElevated, borderColor: colors.border, marginBottom: 8 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <Image source={{ uri: lighter.image }} style={{ width: 48, height: 48, borderRadius: palette.radius.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>{lighter.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{lighter.period} • {lighter.mechanism}</Text>
                </View>
              </View>
            </View>
          ))}

          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: palette.gradient.top, marginTop: 24 }]}>
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>Close Profile</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
    );
}
