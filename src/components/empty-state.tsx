import { View, Text } from 'react-native';

export default function EmptyState() {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 6 }}>No exercises yet</Text>
      <Text style={{ color: '#666', textAlign: 'center' }}>Tap the + button to log your first exercise</Text>
    </View>
  );
}
