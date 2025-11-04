import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  emoji: string;
  onPress?: () => void;
  size?: number;
};

export default function EmojiPill({ emoji, onPress, size = 20 }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.pill}>
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
