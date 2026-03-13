import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, SafeAreaView, Switch, Text, TextInput, View, useWindowDimensions } from "react-native";
import { getBodyTextStyle, getCollectionColumns, getEyebrowStyle, getPageShellStyle, getPanelStyle } from "../artDirection";
import { AmbientBackground } from "../components/AmbientBackground";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { TopBar } from "../components/TopBar";
import { styles } from "../styles";
export function ExploreScreen({ shared }) {
    const { colors, lighters, toggleTheme } = shared;
    const [search, setSearch] = useState("");
    const [showOnlyPublic, setShowOnlyPublic] = useState(true);
    const [selected, setSelected] = useState(null);
    const [compare, setCompare] = useState(null);
    const { width } = useWindowDimensions();
    const columns = getCollectionColumns(width);
    const shellStyle = getPageShellStyle(width);
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
      <AmbientBackground colors={colors}/>
      <FlatList data={filtered} keyExtractor={(item) => item.id} numColumns={columns} columnWrapperStyle={columns > 1 ? { gap: 16, marginBottom: 16 } : undefined} contentContainerStyle={{ ...shellStyle, paddingBottom: 90 }} ListHeaderComponent={<>
            <TopBar colors={colors} activeRoute="Explore" onToggleTheme={toggleTheme} compact={width < 700}/>
            <View style={[getPanelStyle(colors, { radius: 30, padding: 22 }), { marginBottom: 24 }]}>
              <Text style={getEyebrowStyle(colors)}>Collection Archive</Text>
              <Text style={[styles.screenTitle, { color: colors.text, marginTop: 0 }]}>Explore The Collection</Text>
              <Text style={[getBodyTextStyle(colors, true), { fontSize: 16, marginBottom: 16 }]}>
                Search the public archive, filter visible pieces, and compare standout entries inside the official LightIt art direction.
              </Text>
              <View style={[styles.searchWrap, { backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
                <SlidersHorizontal color={colors.muted} size={16}/>
                <TextInput placeholder="Search by name, brand, country" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={[styles.searchInput, { color: colors.text }]}/>
              </View>
              <View style={[styles.rowBetween, { paddingHorizontal: 2, marginTop: 4 }]}>
                <Text style={{ color: colors.muted, fontWeight: "700", textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>
                  {filtered.length} pieces found
                </Text>
                <View style={styles.switchRow}>
                  <Text style={{ color: colors.muted, marginRight: 8, fontWeight: "700" }}>Public only</Text>
                  <Switch value={showOnlyPublic} onValueChange={setShowOnlyPublic} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={showOnlyPublic ? colors.highlight : "#d6c2ae"}/>
                </View>
              </View>
            </View>
          </>} renderItem={({ item, index }) => <LighterCard lighter={item} onView={setSelected} onCompare={setCompare} colors={colors} style={{ flex: columns > 1 ? 1 : undefined, marginBottom: columns > 1 ? 0 : 16, marginRight: columns > 1 && index % columns !== columns - 1 ? 0 : 0 }}/>}/>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors}/>
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters}/>
    </SafeAreaView>);
}
