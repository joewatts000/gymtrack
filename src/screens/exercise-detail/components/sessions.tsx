import { Text, View, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { Exercise } from "../types";


export function Sessions({ exercise }: { exercise: Exercise }) {
  const { height: windowHeight } = useWindowDimensions();
  const prevSessionsMax = Math.round(windowHeight * 0.5);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Previous sessions</Text>
      <ScrollView
        style={[styles.prevSessionsScroll, { maxHeight: prevSessionsMax }]}
        contentContainerStyle={{ paddingBottom: 6 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {exercise.sessions.map((session) => (
          <View key={session.id} style={{ marginTop: 8 }}>
            <Text style={{ fontWeight: '600' }}>
              {new Date(session.createdAt).toLocaleString()}
            </Text>
            {session.sets.map((s) => (
              <Text key={s.id}>
                {s.reps ?? '-'} reps @ {s.weight ?? '-'}kg {s.difficultyEmoji}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  prevSessionsScroll: { marginTop: 8 },
});
