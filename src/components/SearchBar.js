import React from 'react';
import { TextInput } from 'react-native';

export default function SearchBar({ value, onChangeText, placeholder = 'Search...' }) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9AA4B2" /* use COLORS.sub when imported */
      value={value}
      onChangeText={onChangeText}
      style={styles.search}
    />
  );
}

// screens that import SearchBar must provide a `styles.search` entry
// so that styling is consistent with the rest of the app.
