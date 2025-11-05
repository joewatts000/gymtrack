import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';

type Props = { onPress: () => void; accessibilityLabel?: string; };

export default function FloatingAddButton({ onPress, accessibilityLabel = 'Add' }: Props) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
});
