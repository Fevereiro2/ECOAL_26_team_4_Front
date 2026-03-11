import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import LighterCard from '../components/LighterCard';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import { lighterService } from '../api/lighterService';
import { styles } from '../styles';

export default function CollectionScreen({ navigation }) {
  const [lighters, setLighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await lighterService.getAll();
      setLighters(data);
      setLoading(false);
    })();
  }, []);

  const data = useMemo(() => {
    let filtered = [...lighters];
    // TODO: apply search / category / sorting
    return filtered;
  }, [lighters, search, selectedCategory, sortBy]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SearchBar value={search} onChangeText={setSearch} />
        {/* category chips would go here */}
        {data.map(item => (
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
