import { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Home
      </Text>
      <Text style={styles.subtitle} accessibilityLabel="Welcome line 1">
        Simple, free gym tracker.
      </Text>
      <Text style={styles.subtitle} accessibilityLabel="Welcome line 2">
        Log workouts quickly.
      </Text>
      <Text style={styles.subtitle} accessibilityLabel="Welcome line 2">
        No ads, no fuss, no nonsense.
      </Text>
    </View>
  );
}

const COLORS = { textMuted: '#666', primary: '#000' };

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', lineHeight: 24 },
});
