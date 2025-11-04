import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import ButtonPrimary from '../components/atoms/button-primary';
import SetRow from '../components/molecules/set-row';

import type { ExercisesStackParamList } from '../navigation/exercises-stack';

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

export type SetItem = {
  id: string;
  weight: number | null;
  reps: number | null;
  difficultyEmoji: string;
};

const STORAGE_KEY = 'gymwatch:exercises';
const EMOJI_PALETTE = ['😎', '😅', '😓', '🔥', '😫'];

// input sanitizers
function sanitizeDecimalInput(value: string) {
  if (value === '') return '';
  let v = value.replace(',', '.');
  v = v.replace(/[^0-9.]/g, '');
  const parts = v.split('.');
  if (parts.length <= 1) return v;
  return parts.shift() + '.' + parts.join('');
}
function sanitizeIntegerInput(value: string) {
  if (value === '') return '';
  return value.replace(/\D/g, '');
}

export default function ExerciseDetail({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const { height: windowHeight } = useWindowDimensions();
  const prevSessionsMax = Math.round(windowHeight * 0.5);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<SetItem[]>([]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [emojiPickerTargetSetId, setEmojiPickerTargetSetId] = useState<string | null>(null);

  const weightInputRefs = useRef<{ [key: string]: any }>({});
  const repsInputRefs = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    loadExercise();
  }, []);

  useEffect(() => {
    if (!loading && sets.length === 0) {
      setTimeout(() => addEmptySet(true), 80);
    }
  }, [loading]);

  async function loadExercise() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const arr: Exercise[] = raw ? JSON.parse(raw) : [];
      const ex = arr.find((e) => e.id === exerciseId) || null;
      setExercise(ex);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  function addEmptySet(focus = false) {
    const newSetId = uuidv4();
    let added = false;
    setSets((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.weight === null && last.reps === null) {
        return prev;
      }
      added = true;
      return [...prev, { id: newSetId, weight: null, reps: null, difficultyEmoji: '💪' }];
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
    if (!exercise) return;
    const setsToSave = sets.filter((s) => s.weight !== null || s.reps !== null);
    if (setsToSave.length === 0) {
      Alert.alert('Add at least one set');
      return;
    }

    const session: Session = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      sets: setsToSave,
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const arr: Exercise[] = raw ? JSON.parse(raw) : [];
      const next = arr.map((e) =>
        e.id === exercise.id ? { ...e, sessions: [session, ...e.sessions] } : e
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setExercise((ex) => (ex ? { ...ex, sessions: [session, ...ex.sessions] } : ex));
      setSets([]);
      setTimeout(() => addEmptySet(true), 80);
      navigation.goBack();
    } catch (err) {
      console.warn(err);
      Alert.alert('Save failed');
    }
  }

  function openEmojiPickerForSet(setId: string) {
    Keyboard.dismiss();
    setEmojiPickerTargetSetId(setId);
    setTimeout(() => setEmojiPickerVisible(true), 60);
  }

  function chooseEmoji(emoji: string) {
    if (!emojiPickerTargetSetId) return;
    updateSet(emojiPickerTargetSetId, { difficultyEmoji: emoji });
    setEmojiPickerVisible(false);
    setEmojiPickerTargetSetId(null);
    setTimeout(() => Keyboard.dismiss(), 80);
    setTimeout(() => addEmptySet(true), 160);
  }

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>{exercise.title}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current session (unsaved)</Text>
            {sets.length === 0 && (
              <Text style={{ color: '#666', padding: 8 }}>No sets yet — add one</Text>
            )}
            {sets.map((item, index) => (
              <SetRow
                key={item.id}
                item={item}
                index={index}
                onChange={updateSet}
                onRemove={removeSet}
                onOpenEmoji={openEmojiPickerForSet}
                weightRef={(r) => (weightInputRefs.current[item.id] = r)}
                repsRef={(r) => (repsInputRefs.current[item.id] = r)}
                showRemove={sets.length > 1 || item.weight != null || item.reps != null}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <ButtonPrimary onPress={() => addEmptySet(true)} style={{ flex: 1 }}>
              Add set
            </ButtonPrimary>
            <ButtonPrimary onPress={saveSession} style={{ flex: 1 }}>
              Save session
            </ButtonPrimary>
          </View>

          {exercise.sessions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous sessions</Text>
              <ScrollView
                style={[styles.prevSessionsScroll, { maxHeight: prevSessionsMax }]}
                contentContainerStyle={{ paddingBottom: 6 }}
                keyboardShouldPersistTaps="handled"
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
          )}

          {/* Emoji Picker */}
          <Modal visible={emojiPickerVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerTitle}>Pick an emoji</Text>
                <FlatList
                  data={EMOJI_PALETTE}
                  numColumns={5}
                  keyExtractor={(e) => e}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => chooseEmoji(item)}
                      style={({ pressed }) => [
                        styles.emojiButton,
                        pressed ? { opacity: 0.6 } : null,
                      ]}
                    >
                      <Text style={styles.emojiBig}>{item}</Text>
                    </Pressable>
                  )}
                />
                <TouchableOpacity
                  style={styles.pickerClose}
                  onPress={() => setEmojiPickerVisible(false)}
                >
                  <Text style={{ color: '#007AFF' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,20,0.45)',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  pickerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emojiButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  emojiBig: { fontSize: 28 },
  pickerClose: { marginTop: 10, alignItems: 'center' },
  prevSessionsScroll: { marginTop: 8 },
});
