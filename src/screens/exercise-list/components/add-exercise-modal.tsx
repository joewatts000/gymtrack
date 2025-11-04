import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform, Keyboard } from 'react-native';

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
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(20,20,20,0.45)', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>New Exercise</Text>
          <TextInput
            placeholder="Exercise title (e.g. Bench Press)"
            value={title}
            onChangeText={setTitle}
            style={{ borderColor: '#eee', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreate}
            editable={!submitting}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ padding: 10, marginRight: 8 }} onPress={onCancel} disabled={submitting}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }} onPress={handleCreate} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Create</Text>}
            </TouchableOpacity>
          </View>
          {Platform.OS === 'ios' ? <View style={{ height: 20 }} /> : null}
        </View>
      </View>
    </Modal>
  );
}
