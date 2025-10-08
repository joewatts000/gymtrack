import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WorkoutsScreen() {
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>
      <Text style={styles.subtitle}>Create and run workouts from here.</Text>

      {/* Placeholder control to show navigation works */}
      <View style={{ marginTop: 20 }}>
        <Button title="Open a workout (placeholder)" onPress={() => { /* add later */ }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
});
