import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";

export function SetSummary({ set }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {set.reps ?? '-'} x {set.weight ?? '-'}kg
      </Text>
      <Text>
        {set.difficultyEmoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  text: {
    marginBottom: 8,
    color: colors.white
  }
});
