import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Switch } from 'react-native';
import AppHeader from '../components/AppHeader';
import { styles } from '../styles';

export default function ProfileScreen() {
  const [publicCollection, setPublicCollection] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Profile" subtitle="User and collection settings" />

        <View style={styles.profileCard}>
          <Text style={styles.profileName}>Pedro Fevereiro</Text>
          <Text style={styles.profileEmail}>pedro@example.com</Text>

          <View style={styles.divider} />

          <Text style={styles.profileSection}>Collection title</Text>
          <Text style={styles.profileText}>Ignition Vault</Text>

          <Text style={styles.profileSection}>Collection description</Text>
          <Text style={styles.profileText}>
            A curated mobile collection of historical and technological lighters.
          </Text>

          <View style={[styles.rowBetween, { marginTop: 14 }]}>            
            <Text style={styles.profileSection}>Public collection</Text>
            <Switch
              value={publicCollection}
              onValueChange={setPublicCollection}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
