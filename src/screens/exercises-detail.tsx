// src/screens/ExerciseDetail.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExercisesStackParamList } from '../navigation/exercise-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';

type Props = NativeStackScreenProps<ExercisesStackParamList, 'ExerciseDetail'>;

type Exercise = {
  id: string;
  title: string;
  sessions: Session[];
  createdAt: string;
};

type Session = {
  id: string;
  createdAt: string;
  sets: SetItem[];
};

type SetItem = {
  id: string;
  weight: number | null;
  reps: number | null;
  difficultyEmoji: string;
};

const STORAGE_KEY = 'gymwatch:exercises';

export default function ExerciseDetail({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // For building a new session
  const [sets, setSets] = useState<SetItem[]>([]);

  useEffect(() => {
    loadExercise();
  }, []);

  async function loadExercise() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setExercise(null);
        setLoading(false);
        return;
      }
      const arr: Exercise[] = JSON.parse(raw);
      const ex = arr.find((e) => e.id === exerciseId) || null;
      setExercise(ex);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  function addEmptySet() {
    setSets((s) => [
      ...s,
      { id: uuidv4(), weight: null, reps: null, difficultyEmoji: '💪' },
    ]);
  }

  function updateSet(id: string, patch: Partial<SetItem>) {
    setSets((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeSet(id: string) {
    setSets((s) => s.filter((x) => x.id !== id));
  }

  async function saveSession() {
    if (!exercise) return;
    if (sets.length === 0) {
      Alert.alert('Add at least one set');
      return;
    }
    const session: Session = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      sets,
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const arr: Exercise[] = raw ? JSON.parse(raw) : [];
      const next = arr.map((e) => {
        if (e.id === exercise.id) {
          return { ...e, sessions: [session, ...e.sessions] };
        }
        return e;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setExercise((ex) => (ex ? { ...ex, sessions: [session, ...ex.sessions] } : ex));
      setSets([]);
      Alert.alert('Saved', 'Session saved locally');
    } catch (err) {
      console.warn(err);
      Alert.alert('Save failed');
    }
  }

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>Exercise not found</Text>
      </View>
    );
  }

  const lastSession = exercise.sessions[0];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.container}>
        <Text style={styles.title}>{exercise.title}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current session (unsaved)</Text>
          <FlatList
            data={sets}
            keyExtractor={(i) => i.id}
            renderItem={({ item, index }) => (
              <View style={styles.setRow}>
                <Text style={styles.setIndex}>{index + 1}</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="kg"
                  keyboardType="numeric"
                  value={item.weight === null ? '' : String(item.weight)}
                  onChangeText={(t) => updateSet(item.id, { weight: t === '' ? null : Number(t) })}
                />
                <TextInput
                  style={styles.smallInput}
                  placeholder="reps"
                  keyboardType="numeric"
                  value={item.reps === null ? '' : String(item.reps)}
                  onChangeText={(t) => updateSet(item.id, { reps: t === '' ? null : Number(t) })}
                />
                <TextInput
                  style={[styles.smallInput, { width: 64 }]}
                  value={item.difficultyEmoji}
                  onChangeText={(t) => updateSet(item.id, { difficultyEmoji: t || '💪' })}
                />
                <TouchableOpacity onPress={() => removeSet(item.id)} style={styles.removeBtn}>
                  <Text style={{ color: '#ff3b30' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={{ padding: 8 }}>
                <Text style={{ color: '#666' }}>No sets yet — add one</Text>
              </View>
            }
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.addSetBtn} onPress={addEmptySet}>
              <Text style={{ color: '#fff' }}>Add set</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveSession}>
              <Text style={{ color: '#fff' }}>Save session</Text>
            </TouchableOpacity>
          </View>
        </View>

        {lastSession && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most recent saved session</Text>
            <Text style={{ color: '#444' }}>
              {new Date(lastSession.createdAt).toLocaleString()} — {lastSession.sets.length} sets
            </Text>
            {lastSession.sets.slice(0, 4).map((s) => (
              <Text key={s.id}>
                {s.reps ?? '-'} reps @ {s.weight ?? '-'}kg {s.difficultyEmoji}
              </Text>
            ))}
            {exercise.sessions.length > 1 && (
              <TouchableOpacity style={{ marginTop: 8 }} onPress={() => Alert.alert('Expand', 'We will add history expand here next')}>
                <Text style={{ color: '#007AFF' }}>Expand history</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  setIndex: { width: 20, fontWeight: '600' },
  smallInput: {
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 64,
  },
  removeBtn: { marginLeft: 'auto' },
  addSetBtn: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
});
