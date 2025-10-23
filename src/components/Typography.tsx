import { JSX, ReactNode } from 'react';
import { Text, StyleSheet, AccessibilityRole } from 'react-native';

export function Title({ children, accessibilityRole }: { children: ReactNode; accessibilityRole?: AccessibilityRole }): JSX.Element {
  return (
    <Text style={styles.title} accessibilityRole={accessibilityRole ?? 'header'}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, accessibilityLabel }: { children: ReactNode; accessibilityLabel?: string }): JSX.Element {
  return (
    <Text style={styles.subtitle} accessibilityLabel={accessibilityLabel}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: '#000' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
});
