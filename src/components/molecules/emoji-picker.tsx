import { Modal, View, Text, FlatList, Pressable, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

const EMOJI_PALETTE = ['😎', '😅', '😓', '🔥', '😫'];

export default function EmojiPicker({ visible, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Pick an emoji</Text>
          <FlatList
            data={EMOJI_PALETTE}
            numColumns={5}
            keyExtractor={(e) => e}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.emojiButton,
                  pressed && styles.emojiButtonPressed,
                ]}
              >
                <Text style={styles.emojiBig}>{item}</Text>
              </Pressable>
            )}
          />
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,20,0.45)',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emojiButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  emojiButtonPressed: {
    opacity: 0.6,
  },
  emojiBig: { fontSize: 28 },
  close: { marginTop: 10, alignItems: 'center' },
  closeText: { color: '#007AFF' },
});
