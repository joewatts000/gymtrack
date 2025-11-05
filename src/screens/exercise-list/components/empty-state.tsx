import { View, Text, StyleSheet } from 'react-native';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No exercises yet</Text>
      <Text style={styles.subtitle}>Tap the + button to log your first exercise</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
});
