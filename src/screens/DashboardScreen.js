import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text } from 'react-native';
import AppHeader from '../components/AppHeader';
import StatCard from '../components/StatCard';
import LighterCard from '../components/LighterCard';
import { lighterService } from '../api/lighterService';
import { styles } from '../styles';

export default function DashboardScreen() {
  const [lighters, setLighters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await lighterService.getAll();
      setLighters(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return null; // or spinner

  const publicCount = lighters.filter(i => i.isPublic).length;
  const categoryCount = new Set(lighters.flatMap(i => i.categories)).size;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Dashboard" subtitle="Manage your collection" />

        <View style={styles.statsRow}>
          <StatCard label="Objects" value={lighters.length} />
          <StatCard label="Categories" value={categoryCount} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Public" value={publicCount} />
          <StatCard label="Private" value={lighters.length - publicCount} />
        </View>

        <Text style={styles.sectionTitle}>Recent objects</Text>
        {lighters.slice(0, 4).map(item => (
          <LighterCard key={item.id} item={item} onPress={() => {}} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
