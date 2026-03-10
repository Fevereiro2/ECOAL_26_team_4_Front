import { Shield } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Image, SafeAreaView, Text, TextInput, View } from "react-native";
import { mockLighters } from "../../data/mockData";
import { styles } from "../styles";
import type { Lighter, SharedScreenProps } from "../types";

export function VaultScreen({ shared }: SharedScreenProps) {
  const { role, colors } = shared;
  const [query, setQuery] = useState("");

  const myLighters = useMemo(
    () => (mockLighters as Lighter[]).filter((lighter) => lighter.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const avgValue = myLighters.length
    ? (myLighters.reduce((acc, lighter) => acc + lighter.criteria.value, 0) / myLighters.length).toFixed(1)
    : "0";

  if (role === "guest") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Shield color={colors.accent} size={28} />
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Vault Locked</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>Sign in from Profile to manage your private collection.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.screenPad}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Vault</Text>
        <View style={styles.rowBetween}>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Pieces</Text>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>{myLighters.length}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Avg Value</Text>
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>{avgValue}/10</Text>
          </View>
        </View>
        <TextInput
          placeholder="Search your collection"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.singleInput, { color: colors.text, backgroundColor: colors.panel, borderColor: colors.border }]}
        />
      </View>

      <FlatList
        data={myLighters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={[styles.listRow, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.brand} • {item.year}</Text>
              <Text style={{ color: colors.primary, fontSize: 12 }}>{item.mechanism}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
