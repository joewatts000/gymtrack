import { StyleSheet, Text } from "react-native";
import { colors } from "../../../theme";

interface SessionDateProps {
  createdAt: string | number | Date;
}

export function SessionDate({ createdAt }: SessionDateProps) {
  const dateObj = new Date(createdAt);
  const dateStr = dateObj
    .toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-')
    .replace(/\./g, '-');

  return (
    <Text style={styles.sessionDate}>
      {dateStr}
    </Text>
  );
}

const styles = StyleSheet.create({
  sessionDate: {
    fontWeight: '700',
    color: colors.white
  },
});
