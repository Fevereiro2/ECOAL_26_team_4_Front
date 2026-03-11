import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { styles } from '../styles';

export default function LighterCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: item.isPublic ? '#16351F' : '#3A1B1B' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.isPublic ? COLORS.green : COLORS.red },
              ]}
            >
              {item.isPublic ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.cardDescription}>
          {item.description}
        </Text>
        <View style={styles.chipRow}>
          {/* Use optional chaining (?.) to prevent crash if categories is undefined */}
          {item.categories?.map(cat => (
            <View key={cat} style={styles.miniChip}>
              <Text style={styles.miniChipText}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}