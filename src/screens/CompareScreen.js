import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import AppHeader from '../components/AppHeader';
import CategoryChip from '../components/CategoryChip';
import { lighterService } from '../api/lighterService';
import { styles } from '../styles';

export default function CompareScreen({ route }) {
  const firstItem = route.params?.firstItem;
  const [lighters, setLighters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await lighterService.getAll();
      setLighters(data);
      // pre-select a second item different from first
      const candidate = data.find(i => i.id !== firstItem?.id);
      setSelectedId(candidate?.id);
    })();
  }, [firstItem]);

  const secondItem = lighters.find(i => i.id === selectedId) || {};

  const compareValue = (a, b) => {
    if (a > b) return '↑';
    if (a < b) return '↓';
    return '=';
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Compare" subtitle="Compare two lighters" />

      <Text style={styles.sectionTitle}>Select second lighter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {lighters
          .filter(item => item.id !== firstItem?.id)
          .map(item => (
            <CategoryChip
              key={item.id}
              label={item.name}
              active={selectedId === item.id}
              onPress={() => setSelectedId(item.id)}
            />
          ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* comparison rows omitted for brevity, same logic as before */}
        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>{firstItem?.name}</Text>
          <Text style={styles.compareSubtitle}>vs</Text>
          <Text style={styles.compareTitle}>{secondItem?.name}</Text>
        </View>

        {[
          ['Weight', firstItem?.criteria.weight, secondItem?.criteria.weight, 'g'],
          ['Flame Temp', firstItem?.criteria.flameTemperature, secondItem?.criteria.flameTemperature, '°C'],
          ['Ignition Capacity', firstItem?.criteria.ignitionCapacity, secondItem?.criteria.ignitionCapacity, ''],
          ['Year', firstItem?.criteria.year, secondItem?.criteria.year, ''],
        ].map(([label, a, b, unit]) => (
          <View key={label} style={styles.compareRow}>
            <Text style={styles.compareLabel}>{label}</Text>
            <Text style={styles.compareValue}>
              {a} {unit} {compareValue(a, b)}
            </Text>
            <Text style={styles.compareValue}>
              {b} {unit} {compareValue(b, a)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
