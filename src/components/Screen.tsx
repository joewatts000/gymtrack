import { JSX, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

export default function Screen({ children }: { children: ReactNode }): JSX.Element {
  return (
    <View style={styles.safe}>
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
});
