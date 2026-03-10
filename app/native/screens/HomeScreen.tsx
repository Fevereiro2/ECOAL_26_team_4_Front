import { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { mockLighters } from "../../data/mockData";
import { CompareModal } from "../components/CompareModal";
import { DetailModal } from "../components/DetailModal";
import { LighterCard } from "../components/LighterCard";
import { SectionTitle } from "../components/SectionTitle";
import { styles } from "../styles";
import type { Lighter, SharedScreenProps } from "../types";

export function HomeScreen({ shared }: SharedScreenProps) {
  const { colors } = shared;
  const featured = (mockLighters as Lighter[]).filter((lighter) => lighter.visibility === "public").slice(0, 3);
  const [selected, setSelected] = useState<Lighter | null>(null);
  const [compare, setCompare] = useState<Lighter | null>(null);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.screenPad}>
        <View style={[styles.hero, { backgroundColor: colors.panelSoft, borderColor: colors.border }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Preserve Your Legacy</Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>Curate and evaluate your collection in a native vault app.</Text>
        </View>

        <SectionTitle title="Featured" subtitle="Top public pieces" colors={colors} />
        {featured.map((item) => (
          <LighterCard key={item.id} lighter={item} colors={colors} onView={setSelected} onCompare={setCompare} />
        ))}
      </ScrollView>

      <DetailModal item={selected} onClose={() => setSelected(null)} colors={colors} />
      <CompareModal item={compare} onClose={() => setCompare(null)} colors={colors} />
    </SafeAreaView>
  );
}
