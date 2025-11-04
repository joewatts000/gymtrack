// InputText.tsx
import { forwardRef } from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  // You can add extra props if you need, like label, error, etc.
};

const InputText = forwardRef<TextInput, Props>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      style={[styles.input, props.style]}
      {...props}
    />
  );
});

export default InputText;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 64,
  },
});
