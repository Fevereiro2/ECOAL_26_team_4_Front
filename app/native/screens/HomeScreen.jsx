import { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { SectionTitle } from "../components/SectionTitle";
import { styles } from "../styles";

export function HomeScreen({ shared }) {
    const { colors, lighters } = shared;
    const featured = lighters.filter((lighter) => lighter.visibility === "public").slice(0, 3);
    const [selected, setSelected] = useState(null);
    const [compare, setCompare] = useState(null);

    return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <View style={[styles.hero, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>Collector Vault</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Preserve Your Legacy</Text>
          <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 22 }}>
            Curate and evaluate your lighter collection in a native vault app.
          </Text>
        </View>

        <SectionTitle title="Featured" subtitle="Top public pieces" colors={colors} />
        {featured.map((item) => (
          <LighterCard key={item.id} lighter={item} colors={colors} onView={setSelected} onCompare={setCompare} />
        ))}
      </ScrollView>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} />
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} lighters={lighters} />
    </SafeAreaView>
    );
}
