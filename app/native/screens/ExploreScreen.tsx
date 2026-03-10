import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, SafeAreaView, Switch, Text, TextInput, View } from "react-native";
import { mockLighters } from "../../data/mockData";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { styles } from "../styles";
import type { Lighter, SharedScreenProps } from "../types";

export function ExploreScreen({ shared }: SharedScreenProps) {
  const { colors } = shared;
  const [search, setSearch] = useState("");
  const [showOnlyPublic, setShowOnlyPublic] = useState(true);
  const [selected, setSelected] = useState<Lighter | null>(null);
  const [compare, setCompare] = useState<Lighter | null>(null);

  const filtered = useMemo(() => {
    return (mockLighters as Lighter[]).filter((lighter) => {
      if (showOnlyPublic && lighter.visibility !== "public") return false;
      const query = search.toLowerCase().trim();
      if (!query) return true;
      return [lighter.name, lighter.brand, lighter.country, lighter.mechanism].some((field) =>
        field.toLowerCase().includes(query),
      );
    });
  }, [search, showOnlyPublic]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.screenPad}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Explore Vault</Text>
        <View style={[styles.searchWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <SlidersHorizontal color={colors.muted} size={16} />
          <TextInput
            placeholder="Search by name, brand, country"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <View style={styles.rowBetween}>
          <Text style={{ color: colors.muted }}>{filtered.length} results</Text>
          <View style={styles.switchRow}>
            <Text style={{ color: colors.muted, marginRight: 8 }}>Public only</Text>
            <Switch value={showOnlyPublic} onValueChange={setShowOnlyPublic} />
          </View>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => <LighterCard lighter={item} onView={setSelected} onCompare={setCompare} colors={colors} />}
      />

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} />
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} />
    </SafeAreaView>
  );
}
