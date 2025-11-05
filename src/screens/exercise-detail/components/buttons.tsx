import { View, StyleSheet } from "react-native";
import ButtonPrimary from "../../../components/atoms/button-primary";

type ButtonsProps = {
  addEmptySet: (flag: boolean) => void;
  saveSession: () => void;
};

export function Buttons({ addEmptySet, saveSession }: ButtonsProps) {
  return (
    <View style={styles.row}>
      <ButtonPrimary onPress={() => addEmptySet(true)} style={styles.button}>
        Add set
      </ButtonPrimary>
      <ButtonPrimary onPress={saveSession} style={styles.button}>
        Save session
      </ButtonPrimary>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
