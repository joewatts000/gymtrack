import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";

export function SetSummary({ set }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {set.reps ?? '-'} x {set.weight ?? '-'}kg
      </Text>
      <View
        style={[
          styles.circle,
          set.difficultyLight && { backgroundColor: set.difficultyLight }
        ]}
      />
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
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center'
  }
});
