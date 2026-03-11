import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

// simple header used across multiple screens
export default function AppHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// the styles object is imported from the shared stylesheet
// any deprecation warnings such as props.pointerEvents come from
// React Native internals; you can use style.pointerEvents instead
// if you ever set pointer events manually on a view.
