import { View, TouchableOpacity, StyleSheet } from 'react-native';

type TrafficLight = 'red' | 'orange' | 'green';

interface Props {
  value: TrafficLight | null;
  onSelect: (color: TrafficLight) => void;
  size?: number;
}

export default function TrafficLightPicker({ value, onSelect, size = 30 }: Props) {
  return (
    <View style={styles.row}>
      {(['red', 'orange', 'green'] as TrafficLight[]).map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.circle,
            { backgroundColor: color, width: size, height: size },
            value === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
          accessibilityLabel={`Set difficulty: ${color}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  circle: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
    opacity: 0.8,
  },
  selected: {
    borderColor: '#222',
    opacity: 1,
    borderWidth: 3,
  },
});
