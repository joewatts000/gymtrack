import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import type { ExercisesStackParamList } from '../../navigation/exercises-stack';
import { loadExercises, saveExercises } from '../../services/storage';
import { ExerciseNotFound } from './components/exercise-not-found';
import { Buttons } from './components/buttons';
import { Sessions } from './components/sessions';
import { Sets } from './components/sets';
import HeaderBottomLine from '../../components/header-bottom-line';
import EditableTitle from './components/editable-title';
import { Exercise, Session, SetItem } from '../../types/exercises';

type Props = NativeStackScreenProps<ExercisesStackParamList, 'ExerciseDetail'>;

export default function ExerciseDetail({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<SetItem[]>([]);
  const weightInputRefs = useRef<{ [key: string]: any }>({});
  const repsInputRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const all = await loadExercises();
        const ex = all.find((e) => e.id === exerciseId) || null;
        setExercise(ex);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [exerciseId]);

  useEffect(() => {
    if (!loading && sets.length === 0) {
      setTimeout(() => addEmptySet(true), 80);
    }
  }, [loading]);

  function addEmptySet(focus = false) {
    const newSetId = uuidv4();
    let added = false;
    setSets((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.weight === null && last.reps === null) {
        return prev;
      }
      added = true;
      return [...prev, { id: newSetId, weight: null, reps: null, difficultyLight: 'green' }];
    });
    if (focus && added) {
      setTimeout(() => {
        weightInputRefs.current[newSetId]?.focus();
      }, 160);
    }
  }

  function updateSet(id: string, patch: Partial<SetItem>) {
    setSets((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeSet(id: string) {
    setSets((s) => s.filter((x) => x.id !== id));
    delete weightInputRefs.current[id];
    delete repsInputRefs.current[id];
  }

  async function saveSession() {
    if (!exercise) {
      return;
    }
    const setsToSave = sets.filter((s) => s.weight !== null || s.reps !== null);
    if (setsToSave.length === 0) {
      Alert.alert('Add at least one set');
      return;
    }

    Alert.alert(
      'Save session?',
      'Are you sure you want to save and exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          style: 'default',
          onPress: async () => {
            const session: Session = {
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              sets: setsToSave,
            };

            try {
              const all = await loadExercises();
              const updated = all.map((e) =>
                e.id === exercise.id ? { ...e, sessions: [session, ...e.sessions] } : e
              );
              await saveExercises(updated);

              setExercise((ex) => (ex ? { ...ex, sessions: [session, ...ex.sessions] } : ex));
              setSets([]);
              setTimeout(() => addEmptySet(true), 80);
              navigation.goBack();
            } catch (err) {
              console.warn(err);
              Alert.alert('Save failed');
            }
          },
        },
      ]
    );
  }

  async function updateExerciseTitle(newTitle: string) {
    if (!exercise) {
      return;
    }
    const all = await loadExercises();
    const updated = all.map((e) =>
      e.id === exercise.id ? { ...e, title: newTitle } : e
    );
    await saveExercises(updated);
    setExercise((ex) => (ex ? { ...ex, title: newTitle } : ex));
  }

  if (!exercise) {
    return (
      <ExerciseNotFound />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <HeaderBottomLine />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
          <EditableTitle
            value={exercise.title}
            onChange={updateExerciseTitle}
          />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current session (unsaved)</Text>
            <Sets
              sets={sets}
              updateSet={updateSet}
              removeSet={removeSet}
              weightInputRefs={weightInputRefs}
              repsInputRefs={repsInputRefs}
            />
          </View>
          <Buttons addEmptySet={addEmptySet} saveSession={saveSession} />
          {exercise.sessions.length > 0 && <Sessions exercise={exercise} />}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  prevSessionsScroll: { marginTop: 8 },
});
