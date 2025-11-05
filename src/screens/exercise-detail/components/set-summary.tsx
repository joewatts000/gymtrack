import { StyleSheet, Text } from "react-native";
import { colors } from "../../../theme";

export function SetSummary({ set }: any) {
  return (
    <Text style={styles.text}>
      {set.reps ?? '-'} x {set.weight ?? '-'}kg {set.difficultyEmoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    marginBottom: 8,
    color: colors.white
  }
});
