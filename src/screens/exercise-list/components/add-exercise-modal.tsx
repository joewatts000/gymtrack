import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Keyboard, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (title: string) => void;
  submitting?: boolean;
};

export default function AddExerciseModal({ visible, onCancel, onSubmit, submitting = false }: Props) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (visible) {
      setTitle('');
    }
  }, [visible]);

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    Keyboard.dismiss();
    onSubmit(trimmed);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>New Exercise</Text>
          <TextInput
            placeholder="Exercise title (e.g. Bench Press)"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            editable={!submitting}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>Create</Text>}
            </TouchableOpacity>
          </View>
          {Platform.OS === 'ios' ? <View style={styles.iosSpacer} /> : null}
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
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: 10,
    marginRight: 8,
  },
  cancelText: {
    color: '#333',
  },
  createBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createText: {
    color: '#fff',
  },
  iosSpacer: {
    height: 20,
  },
});
