import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ExercisesStackParamList } from '../navigation/exercises-stack';
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

const EMOJI_PALETTE = [
  '💪', '😅', '😓', '🔥', '😰', '😵‍💫', '😎', '🤯', '🙂', '🙃',
  '😬', '😣', '😫', '🤝', '✨', '🏋️', '🏃', '🧘', '🤸‍♂️', '🥵',
];

// allow decimal input (weight). Keeps only digits and one decimal point.
// Accepts leading '.' (becomes '0.')
function sanitizeDecimalInput(value: string) {
  if (value === '') return '';
  // replace comma with dot for locales that paste commas
  let v = value.replace(',', '.');
  // remove any character that's not digit or dot
  v = v.replace(/[^0-9.]/g, '');
  // if more than one dot, keep first only
  const parts = v.split('.');
  if (parts.length <= 1) return v;
  return parts.shift() + '.' + parts.join(''); // join remaining parts without extra dots
}

// integer-only: strip anything not digit
function sanitizeIntegerInput(value: string) {
  if (value === '') return '';
  return value.replace(/\D/g, '');
}


export default function ExerciseDetail({ route }: Props) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // current unsaved session sets
  const [sets, setSets] = useState<SetItem[]>([]);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [emojiPickerTargetSetId, setEmojiPickerTargetSetId] = useState<string | null>(null);
  const [customEmojiInput, setCustomEmojiInput] = useState('');

  // Refs for inputs per-set
  const weightInputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const repsInputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    loadExercise();
  }, []);

  // When the exercise loads, ensure there's at least one empty set for immediate input
  useEffect(() => {
    if (!loading && sets.length === 0) {
      setTimeout(() => {
        addEmptySet(true);
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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

  // addEmptySet optionally focuses the new weight input when `focus` is true
  function addEmptySet(focus = false) {
    const newSetId = uuidv4();
    setSets((s) => {
      const next = [...s, { id: newSetId, weight: null, reps: null, difficultyEmoji: '💪' }];
      return next;
    });

    if (focus) {
      setTimeout(() => {
        weightInputRefs.current[newSetId]?.focus();
      }, 120);
    }
  }

  function updateSet(id: string, patch: Partial<SetItem>) {
    setSets((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeSet(id: string) {
    setSets((s) => {
      const next = s.filter((x) => x.id !== id);
      return next;
    });

    if (weightInputRefs.current[id]) delete weightInputRefs.current[id];
    if (repsInputRefs.current[id]) delete repsInputRefs.current[id];
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
      setTimeout(() => addEmptySet(true), 80);
      Alert.alert('Saved', 'Session saved locally');
    } catch (err) {
      console.warn(err);
      Alert.alert('Save failed');
    }
  }

  // Open emoji picker for a given set: dismiss keyboard first (so the picker isn't overlaid)
  function openEmojiPickerForSet(setId: string) {
    // Dismiss keyboard immediately so the picker is shown cleanly
    Keyboard.dismiss();
    setEmojiPickerTargetSetId(setId);
    setCustomEmojiInput('');
    // small timeout to ensure keyboard fully hides before modal opens (avoids flicker on some devices)
    setTimeout(() => setEmojiPickerVisible(true), 60);
  }

  // When user picks an emoji from the palette
  function chooseEmoji(emoji: string) {
    if (!emojiPickerTargetSetId) return;
    // update the set first
    updateSet(emojiPickerTargetSetId, { difficultyEmoji: emoji });

    // Close the picker and ensure keyboard stays dismissed.
    // Delay hiding the modal slightly to avoid re-focusing race conditions on some keyboards.
    setEmojiPickerVisible(false);
    setEmojiPickerTargetSetId(null);

    // Ensure keyboard is hidden — call after modal closed
    setTimeout(() => Keyboard.dismiss(), 80);
  }

  // When user enters a custom emoji and confirms
  function chooseCustomEmoji() {
    const val = customEmojiInput.trim();
    if (!val) {
      Alert.alert('Enter an emoji');
      return;
    }

    // Apply the custom emoji
    if (emojiPickerTargetSetId) {
      updateSet(emojiPickerTargetSetId, { difficultyEmoji: val });
    }

    // Close UI and keep keyboard hidden
    setEmojiPickerVisible(false);
    setEmojiPickerTargetSetId(null);
    setCustomEmojiInput('');

    setTimeout(() => Keyboard.dismiss(), 80);
  }


  async function deleteSession(sessionId: string) {
    if (!exercise) return;
    Alert.alert('Delete session?', 'This will remove the saved session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const arr: Exercise[] = raw ? JSON.parse(raw) : [];
            const next = arr.map((e) => {
              if (e.id !== exercise.id) return e;
              return { ...e, sessions: e.sessions.filter((s) => s.id !== sessionId) };
            });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            const updated = next.find((e) => e.id === exercise.id) || null;
            setExercise(updated);
          } catch (err) {
            console.warn('Failed to delete session', err);
            Alert.alert('Delete failed', 'Could not delete session. Please try again.');
          }
        },
      },
    ]);
  }

  // Focus the next empty field: weight first, then reps. If none, add a new set and focus it.
  const focusNextEmpty = useCallback(() => {
    for (let i = 0; i < sets.length; i++) {
      const s = sets[i];
      if (s.weight === null) {
        weightInputRefs.current[s.id]?.focus();
        return;
      }
      if (s.reps === null) {
        repsInputRefs.current[s.id]?.focus();
        return;
      }
    }
    // nothing empty — create a new set and focus its weight
    addEmptySet(true);
  }, [sets]);

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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>{exercise.title}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current session (unsaved)</Text>
            <FlatList
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={false}
              data={sets}
              keyExtractor={(i) => i.id}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.setRow}>
                    <Text style={styles.setIndex}>{index + 1}</Text>

                    {/* Weight Input */}
                    <TextInput
                      ref={(ref) => { weightInputRefs.current[item.id] = ref; }}
                      style={styles.smallInput}
                      placeholder="kg"
                      keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                      value={item.weight === null ? '' : String(item.weight)}
                      onChangeText={(raw) => {
                        const sanitized = sanitizeDecimalInput(raw);
                        // if user cleared field, set null so Save validation works
                        if (sanitized === '') {
                          updateSet(item.id, { weight: null });
                        } else {
                          // parseFloat is safe here; you could also keep the string in state if you prefer
                          const n = Number(sanitized);
                          updateSet(item.id, { weight: Number.isNaN(n) ? null : n });
                        }
                      }}
                      returnKeyType="next"
                      returnKeyLabel="Next"
                      onSubmitEditing={() => {
                        repsInputRefs.current[item.id]?.focus();
                      }}
                      blurOnSubmit={false}
                    />


                    {/* Reps Input */}
                    <TextInput
                      ref={(ref) => { repsInputRefs.current[item.id] = ref; }}
                      style={styles.smallInput}
                      placeholder="reps"
                      keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                      value={item.reps === null ? '' : String(item.reps)}
                      onChangeText={(raw) => {
                        const sanitized = sanitizeIntegerInput(raw);
                        if (sanitized === '') {
                          updateSet(item.id, { reps: null });
                        } else {
                          // parseInt and guard against NaN
                          const n = parseInt(sanitized, 10);
                          updateSet(item.id, { reps: Number.isNaN(n) ? null : n });
                        }
                      }}
                      returnKeyType="next"
                      returnKeyLabel="Next"
                      onSubmitEditing={() => openEmojiPickerForSet(item.id)}
                      blurOnSubmit={false}
                    />
                    {/* Emoji Input */}
                    <TouchableOpacity
                      style={styles.emojiPill}
                      onPress={() => openEmojiPickerForSet(item.id)}
                      accessibilityLabel="Pick difficulty emoji"
                    >
                      <Text style={styles.emojiText}>{item.difficultyEmoji}</Text>
                    </TouchableOpacity>

                    {/* Conditional Remove: hide for first empty set */}
                    {(sets.length > 1 || item.weight != null || item.reps != null) ? (
                      <TouchableOpacity onPress={() => removeSet(item.id)} style={styles.removeBtn}>
                        <Text style={{ color: '#ff3b30' }}>Remove</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: 64 }} />
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={{ padding: 8 }}>
                  <Text style={{ color: '#666' }}>No sets yet — add one</Text>
                </View>
              }
            />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.addSetBtn} onPress={() => addEmptySet(true)}>
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
            </View>
          )}

          {/* Emoji picker modal */}
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
                  contentContainerStyle={{ paddingBottom: 10 }}
                />

                <Text style={{ marginTop: 6, marginBottom: 4 }}>Or paste a custom emoji</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="e.g. 😬"
                    value={customEmojiInput}
                    onChangeText={setCustomEmojiInput}
                  />
                  <TouchableOpacity style={styles.pickerChooseBtn} onPress={chooseCustomEmoji}>
                    <Text style={{ color: '#fff' }}>Use</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.pickerClose} onPress={() => setEmojiPickerVisible(false)}>
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

  emojiPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emojiText: { fontSize: 20 },

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
  input: {
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  pickerChooseBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  pickerClose: { marginTop: 10, alignItems: 'center' },
});
