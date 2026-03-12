import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, SafeAreaView, Switch, Text, TextInput, View } from "react-native";
import { getShadow } from "../brand";
import { Atmosphere } from "../components/Atmosphere";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { styles } from "../styles";
export function ExploreScreen({ shared }) {
  const { colors, lighters, theme } = shared;
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
      <Atmosphere colors={colors}>
      <View style={styles.screenPad}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Collection radar</Text>
        <Text style={[styles.screenTitle, { color: colors.text, marginTop: 6 }]}>Explore the public vault.</Text>
        <Text style={[styles.bodyText, { color: colors.muted, marginBottom: 14, maxWidth: "92%" }]}>Search the shared catalog, refine by collector details, and compare standout pieces without breaking the warm, premium rhythm of the app.</Text>
        <View style={[styles.formCard, getShadow(theme, "card"), { padding: 16, backgroundColor: colors.panel, borderColor: colors.border }]}> 
        <View style={[styles.searchWrap, { backgroundColor: colors.panelSoft, borderColor: colors.border, marginBottom: 0 }]}>
          <SlidersHorizontal color={colors.muted} size={16}/>
          <TextInput placeholder="Search by name, brand, country" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={[styles.searchInput, { color: colors.text }]}/>
        </View>
        <View style={[styles.rowBetween, { paddingHorizontal: 2 }]}>
          <Text style={[styles.metaText, { color: colors.muted, textTransform: "uppercase", letterSpacing: 1.2 }]}>
            {filtered.length} pieces found
          </Text>
          <View style={styles.switchRow}>
            <Text style={[styles.metaText, { color: colors.muted, marginRight: 8 }]}>Public only</Text>
            <Switch value={showOnlyPublic} onValueChange={setShowOnlyPublic} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={showOnlyPublic ? colors.text : colors.panel}/>
          </View>
        </View>
        </View>
      </View>

      <FlatList data={filtered} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }} renderItem={({ item }) => <LighterCard lighter={item} onView={setSelected} onCompare={setCompare} colors={colors} theme={theme}/>}/>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} theme={theme}/>
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters} theme={theme}/>
      </Atmosphere>
    </SafeAreaView>);
}
