import { SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, SafeAreaView, Switch, Text, TextInput, View } from "react-native";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { palette } from "../palette";
import { styles } from "../styles";
import { PublicProfileModal } from "../components/PublicProfileModal";

export function ExploreScreen({ shared }) {
    const { colors, lighters, role } = shared;
    const [search, setSearch] = useState("");
    const [showOnlyPublic, setShowOnlyPublic] = useState(true);
    const [selected, setSelected] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState("");
    const [filterMechanism, setFilterMechanism] = useState("");

    const filtered = useMemo(() => {
        return lighters.filter((lighter) => {
            if (role !== "admin" && lighter.visibility !== "public") return false;
            if (role === "admin" && showOnlyPublic && lighter.visibility !== "public") return false;
            if (filterPeriod && lighter.period !== filterPeriod) return false;
            if (filterMechanism && lighter.mechanism !== filterMechanism) return false;
            const query = search.toLowerCase().trim();
            if (!query) return true;
            return [lighter.name, lighter.description, lighter.period, lighter.mechanism]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(query));
        });
    }, [lighters, search, showOnlyPublic, role, filterPeriod, filterMechanism]);

    return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.screenPad}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Explore</Text>
        <View style={[styles.searchWrap, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Pressable onPress={() => setIsFilterOpen(true)} style={{ padding: 4, marginRight: 4 }}>
            <SlidersHorizontal color={filterPeriod || filterMechanism ? colors.primary : colors.muted} size={20} />
          </Pressable>
          <TextInput
            placeholder="Search by name, brand, country..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
        <View style={[styles.rowBetween, { marginTop: 4 }]}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{filtered.length} results</Text>
          {role === "admin" ? (
            <View style={styles.switchRow}>
              <Text style={{ color: colors.muted, marginRight: 8, fontSize: 13 }}>Public only</Text>
              <Switch
                value={showOnlyPublic}
                onValueChange={setShowOnlyPublic}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
              />
            </View>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <LighterCard lighter={item} onView={setSelected} colors={colors} />
        )}
      />

      <DetailModal 
        item={selected} 
        onClose={() => setSelected(null)} 
        colors={colors} 
        user={selected ? shared.users?.find((u) => u.id === selected.ownerId) : null}
        onViewUser={(user) => {
            setSelected(null);
            setSelectedUser(user);
        }}
      />
      
      <PublicProfileModal
        user={selectedUser}
        lighters={shared.lighters}
        onClose={() => setSelectedUser(null)}
        colors={colors}
      />
      
      <Modal visible={isFilterOpen} transparent animationType="slide" onRequestClose={() => setIsFilterOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setIsFilterOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <View style={styles.rowBetween}>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>Filters</Text>
                <Pressable onPress={() => { setFilterPeriod(""); setFilterMechanism(""); }}>
                    <Text style={{ color: colors.accent, fontWeight: "600" }}>Reset</Text>
                </Pressable>
            </View>
            <View style={{ marginTop: 16 }}>
                <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Period</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {["Antique (Pre-1920)", "Vintage (1920-1970)", "Modern (1970+)"].map(opt => (
                        <Pressable key={opt} onPress={() => setFilterPeriod(p => p === opt ? "" : opt)}
                            style={{ borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: filterPeriod === opt ? palette.gradient.top : "transparent" }}>
                            <Text style={{ color: filterPeriod === opt ? colors.buttonText : colors.text }}>{opt}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            <View style={{ marginTop: 16 }}>
                <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Mechanism</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {["Spark wheel", "Piezoelectric", "Electric arc", "Friction"].map(opt => (
                        <Pressable key={opt} onPress={() => setFilterMechanism(p => p === opt ? "" : opt)}
                            style={{ borderRadius: palette.radius.sm, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: filterMechanism === opt ? palette.gradient.top : "transparent" }}>
                            <Text style={{ color: filterMechanism === opt ? colors.buttonText : colors.text }}>{opt}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            <Pressable onPress={() => setIsFilterOpen(false)} style={[styles.closeBtn, { backgroundColor: palette.gradient.top, marginTop: 24 }]}>
              <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    );
}
