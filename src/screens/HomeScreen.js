import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppHeader from '../components/AppHeader';
import LighterCard from '../components/LighterCard';
import { lighterService } from '../api/lighterService';
import { styles } from '../styles'; // we'll create a shared stylesheet later

// home screen loads a (small) selection of items and shows hero text
export default function HomeScreen({ navigation }) {
  const [lighters, setLighters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await lighterService.getAll();
      setLighters(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  const featured = lighters.slice(0, 4); // could be replaced by a backend flag

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Ignition Vault"
          subtitle="A premium lighter collection app"
        />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Discover and compare iconic lighters</Text>
          <Text style={styles.heroText}>
            Browse categories, explore technical criteria, and manage your personal collection.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Collection')}
            >
              <Text style={styles.primaryButtonText}>Open Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.secondaryButtonText}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Featured lighters</Text>
        {featured.map(item => (
          <LighterCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate('Detail', { item })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
