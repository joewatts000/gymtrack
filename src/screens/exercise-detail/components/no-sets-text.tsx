import { Text, StyleSheet } from 'react-native';

export function NoSetsText() {
  return <Text style={styles.text}>No sets yet — add one</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: '#666',
    padding: 8,
  },
});
