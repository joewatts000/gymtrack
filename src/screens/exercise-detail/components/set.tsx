import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import InputText from '../../../components/atoms/input-text';
import TrafficLightPicker from '../../../components/molecules/traffic-light-picker';
import { SetItem } from '../../../types/exercises';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  item: SetItem;
  index: number;
  onChange: (id: string, patch: Partial<SetItem>) => void;
  onRemove: (id: string) => void;
  weightRef?: (r: any) => void;
  repsRef?: (r: any) => void;
  showRemove?: boolean;
};

export default function Set({
  item,
  index,
  onChange,
  onRemove,
  weightRef,
  repsRef,
  showRemove = true,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.index}>{index + 1}</Text>
      <InputText
        ref={weightRef as React.Ref<any>}
        style={styles.input}
        placeholder="kg"
        value={item.weight === null ? '' : String(item.weight)}
        onChangeText={(t: string) => onChange(item.id, { weight: t === '' ? null : Number(t) })}
      />
      <InputText
        ref={repsRef as React.Ref<any>}
        style={styles.input}
        placeholder="reps"
        value={item.reps === null ? '' : String(item.reps)}
        onChangeText={(t: string) => onChange(item.id, { reps: t === '' ? null : Number(t) })}
      />
      <TrafficLightPicker
        value={item.difficultyLight ?? 'green'}
        onSelect={(color) => onChange(item.id, { difficultyLight: color })}
      />
      {showRemove ? (
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.remove}>
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      ) : (
        <View style={styles.removePlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  index: { width: 20, fontWeight: '600' },
  input: { marginRight: 8, minWidth: 64 },
  remove: { marginLeft: 'auto' },
  removeText: { color: '#ff3b30' },
  removePlaceholder: { width: 64 },
});
