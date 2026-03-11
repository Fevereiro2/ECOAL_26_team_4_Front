import React from 'react';
import { View, Text } from 'react-native';

export default function CriteriaRow({ label, value, unit }) {
  return (
    <View style={styles.criteriaRow}>
      <Text style={styles.criteriaLabel}>{label}</Text>
      <Text style={styles.criteriaValue}>
        {value} {unit || ''}
      </Text>
    </View>
  );
}

// styling must be provided by the parent screen's stylesheet
