import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  emoji: string;
  onPress?: () => void;
};

export default function EmojiPill({ emoji, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.pill}>
      <Text style={styles.emoji}>{emoji}</Text>
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
  emoji: {
    fontSize: 20,
  },
});
