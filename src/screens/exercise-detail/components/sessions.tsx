import { Text, View, ScrollView, StyleSheet, useWindowDimensions, TouchableOpacity } from "react-native";
import { SessionDate } from "./session-date";
import { SetSummary } from "./set-summary";
import { colors } from "../../../theme";
import { Exercise, Session, SetItem } from "../../../types/exercises";
import { Ionicons } from '@expo/vector-icons'; // If using Expo, otherwise use any icon library

export function Sessions({
  exercise,
  onDeleteSession,
}: {
  exercise: Exercise;
  onDeleteSession: (sessionId: string) => void;
}) {
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
                <View style={styles.sessionHeader}>
                  <SessionDate createdAt={session.createdAt} />
                  <TouchableOpacity
                    onPress={() => onDeleteSession(session.id)}
                    style={styles.deleteBtn}
                    accessibilityLabel="Delete session"
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
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
    padding: 12,
    // marginHorizontal: 2,
    minWidth: 0,
  },
  sessionBlockEmpty: {
    backgroundColor: 'transparent',
    opacity: 0,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteBtn: {
    marginRight: -2,
  },
});
