import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Note: the parent screen must supply a `styles` object containing
// chip, chipActive, chipText and chipTextActive entries.
