import { Text, View, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { SessionDate } from "./session-date";
import { SetSummary } from "./set-summary";
import { colors } from "../../../theme";
import { Exercise, Session, SetItem } from "../../../types/exercises";


export function Sessions({ exercise }: { exercise: Exercise }) {
  const { height: windowHeight } = useWindowDimensions();
  const prevSessionsMax = Math.round(windowHeight * 0.5);

  // Split sessions into rows of 2 for the grid
  const sessionRows = [];
  for (let i = 0; i < exercise.sessions.length; i += 2) {
    sessionRows.push(exercise.sessions.slice(i, i + 2));
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Previous sessions</Text>
      <ScrollView
        style={[styles.prevSessionsScroll, { maxHeight: prevSessionsMax }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sessionRows.map((row, rowIdx) => (
          <View style={styles.row} key={rowIdx}>
            {row.map((session: Session) => (
              <View key={session.id} style={styles.sessionBlock}>
                <SessionDate createdAt={session.createdAt} />
                {session.sets.map((set: SetItem) => (
                  <SetSummary set={set} key={set.id} />
                ))}
              </View>
            ))}
            {row.length < 2 ? (
              <View style={[styles.sessionBlock, styles.sessionBlockEmpty]} />
            ) : null}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18, marginTop: 22 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  prevSessionsScroll: { marginTop: 8 },
  scrollContent: { paddingBottom: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sessionBlock: {
    flex: 1,
    backgroundColor: colors.darkBlue,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 2,
    minWidth: 0,
  },
  sessionBlockEmpty: {
    backgroundColor: 'transparent',
    opacity: 0,
  },
});
