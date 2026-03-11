import React from 'react';
import { SafeAreaView, ScrollView, Image, View, Text, TouchableOpacity } from 'react-native';
import AppHeader from '../components/AppHeader';
import CriteriaRow from '../components/CriteriaRow';
import { styles } from '../styles';

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.image }} style={styles.detailImage} />
        <View style={styles.detailBody}>
          <View style={styles.rowBetween}>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.isPublic ? '#16351F' : '#3A1B1B' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.isPublic ? '#22C55E' : '#EF4444' },
                ]}
              >
                {item.isPublic ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>

          <Text style={styles.detailDescription}>{item.description}</Text>

          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.chipRow}>
            {item.categories.map(cat => (
              <View key={cat} style={styles.miniChip}>
                <Text style={styles.miniChipText}>{cat}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Criteria</Text>
          <View style={styles.criteriaCard}>
            <CriteriaRow label="Weight" value={item.criteria.weight} unit="g" />
            <CriteriaRow
              label="Flame Temperature"
              value={item.criteria.flameTemperature}
              unit="°C"
            />
            <CriteriaRow
              label="Ignition Capacity"
              value={item.criteria.ignitionCapacity}
              unit=""
            />
            <CriteriaRow label="Year" value={item.criteria.year} unit="" />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Compare', { firstItem: item })}
          >
            <Text style={styles.primaryButtonText}>Compare this lighter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
