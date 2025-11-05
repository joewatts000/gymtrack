import { StyleSheet, Text } from "react-native";
import { colors } from "../../../theme";

interface SessionDateProps {
  createdAt: string | number | Date;
}

export function SessionDate({ createdAt }: SessionDateProps) {
  return (
    <Text style={styles.sessionDate}>
      {new Date(createdAt).toLocaleString()}
    </Text>
  );
}


const styles = StyleSheet.create({
  sessionDate: { fontWeight: '600', marginBottom: 8, color: colors.white },
});
