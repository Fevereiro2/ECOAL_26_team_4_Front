import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, SafeAreaView, Switch, Text, TextInput, View } from "react-native";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { styles } from "../styles";
export function ExploreScreen({ shared }) {
    const { colors, lighters } = shared;
    const [search, setSearch] = useState("");
    const [showOnlyPublic, setShowOnlyPublic] = useState(true);
    const [selected, setSelected] = useState(null);
    const [compare, setCompare] = useState(null);
    const filtered = useMemo(() => {
        return lighters.filter((lighter) => {
            if (showOnlyPublic && lighter.visibility !== "public")
                return false;
            const query = search.toLowerCase().trim();
            if (!query)
                return true;
            return [lighter.name, lighter.brand, lighter.country, lighter.mechanism].some((field) => field.toLowerCase().includes(query));
        });
    }, [lighters, search, showOnlyPublic]);
    return (<SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.screenPad}>
        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.4 }}>Garage radar</Text>
        <Text style={[styles.screenTitle, { color: colors.text, marginTop: 6 }]}>Explore The Lineup</Text>
        <Text style={{ color: colors.muted, marginBottom: 14, lineHeight: 19 }}>
          Search the open garage, filter the public rides, and compare standout pieces before you pull them into your watchlist.
        </Text>
        <View style={[styles.searchWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <SlidersHorizontal color={colors.muted} size={16}/>
          <TextInput placeholder="Search by name, brand, country" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={[styles.searchInput, { color: colors.text }]}/>
        </View>
        <View style={[styles.rowBetween, { paddingHorizontal: 2 }]}>
          <Text style={{ color: colors.muted, fontWeight: "700", textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>
            {filtered.length} machines found
          </Text>
          <View style={styles.switchRow}>
            <Text style={{ color: colors.muted, marginRight: 8, fontWeight: "700" }}>Public only</Text>
            <Switch value={showOnlyPublic} onValueChange={setShowOnlyPublic} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={showOnlyPublic ? "#f4ede3" : "#d6c2ae"}/>
          </View>
        </View>
      </View>

      <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }} renderItem={({ item }) => <LighterCard lighter={item} onView={setSelected} onCompare={setCompare} colors={colors}/>}/>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors}/>
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters}/>
    </SafeAreaView>);
}
