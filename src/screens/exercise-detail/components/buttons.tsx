import { View } from "react-native";
import ButtonPrimary from "../../../components/atoms/button-primary";

type ButtonsProps = {
  addEmptySet: (flag: boolean) => void;
  saveSession: () => void;
};

export function Buttons({ addEmptySet, saveSession }: ButtonsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <ButtonPrimary onPress={() => addEmptySet(true)} style={{ flex: 1 }}>
        Add set
      </ButtonPrimary>
      <ButtonPrimary onPress={saveSession} style={{ flex: 1 }}>
        Save session
      </ButtonPrimary>
    </View>
  );
}
