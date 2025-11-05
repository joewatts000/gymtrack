import { useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (newTitle: string) => void;
  style?: any;
};

export default function EditableTitle({ value, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<TextInput>(null);

  function startEdit() {
    setText(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function finishEdit() {
    setEditing(false);
    if (text.trim() && text !== value) {
      onChange(text.trim());
    }
  }

  return editing ? (
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={text}
      onChangeText={setText}
      onBlur={finishEdit}
      onSubmitEditing={finishEdit}
      returnKeyType="done"
      maxLength={50}
    />
  ) : (
    <TouchableOpacity onPress={startEdit}>
      <Text style={styles.text}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  text: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
});
