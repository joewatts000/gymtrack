import { StyleSheet, Text, View } from "react-native";

export function ExerciseNotFound() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Exercise not found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16 },
});
