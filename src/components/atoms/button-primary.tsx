import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  testID?: string;
};

export default function ButtonPrimary({ children, onPress, style, disabled, testID }: Props) {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, style, disabled ? styles.disabled : null]}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.s12,
    paddingHorizontal: spacing.s16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
