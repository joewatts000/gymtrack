// src/screens/exercise-detail.tsx
import { useEffect, useState, useMemo, useRef } from 'react';
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
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// maximum height of the expanded history area (tweakable)
const HISTORY_MAX_HEIGHT = 340;
const ANIM_DURATION = 200;

export default function ExerciseDetail({ route }: Props) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // For building a new session
  const [sets, setSets] = useState<SetItem[]>([]);

  // Emoji picker
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [emojiPickerTargetSetId, setEmojiPickerTargetSetId] = useState<string | null>(null);
  const [customEmojiInput, setCustomEmojiInput] = useState('');

  // History expand toggle
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Animated value for expand/collapse (0 = collapsed, 1 = expanded)
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadExercise();
  }, []);

  useEffect(() => {
    // animate when historyExpanded changes
    Animated.timing(anim, {
      toValue: historyExpanded ? 1 : 0,
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating height (layout) so native driver cannot be used
    }).start();
  }, [historyExpanded, anim]);

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

  function openEmojiPickerForSet(setId: string) {
    setEmojiPickerTargetSetId(setId);
    setCustomEmojiInput('');
    setEmojiPickerVisible(true);
  }

  function chooseEmoji(emoji: string) {
    if (!emojiPickerTargetSetId) return;
    updateSet(emojiPickerTargetSetId, { difficultyEmoji: emoji });
    setEmojiPickerVisible(false);
    setEmojiPickerTargetSetId(null);
  }

  function chooseCustomEmoji() {
    const val = customEmojiInput.trim();
    if (!val) {
      Alert.alert('Enter an emoji');
      return;
    }
    chooseEmoji(val);
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
            if (updated && updated.sessions.length === 0) setHistoryExpanded(false);
          } catch (err) {
            console.warn('Failed to delete session', err);
            Alert.alert('Delete failed', 'Could not delete session. Please try again.');
          }
        },
      },
    ]);
  }

  const olderSessions = useMemo(() => {
    if (!exercise) return [];
    return exercise.sessions.slice(1);
  }, [exercise]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  const lastSession = exercise.sessions[0] || null;

  function ListHeader() {
    return (
      <View>
        <Text style={styles.title}>{exercise?.title}</Text>
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

                <TouchableOpacity
                  style={styles.emojiPill}
                  onPress={() => openEmojiPickerForSet(item.id)}
                  accessibilityLabel="Pick difficulty emoji"
                >
                  <Text style={styles.emojiText}>{item.difficultyEmoji}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeSet(item.id)} style={styles.removeBtn}>
                  <Text style={{ color: '#ff3b30' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666' }}>No sets yet — add one</Text>}
            nestedScrollEnabled={false}
          />

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
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

            {exercise?.sessions?.length && exercise?.sessions?.length > 1 && (
              <TouchableOpacity
                style={styles.expandToggle}
                onPress={() => setHistoryExpanded((v) => !v)}
              >
                <Text style={{ color: '#007AFF' }}>
                  {historyExpanded ? 'Collapse history' : `Expand history (${exercise.sessions.length - 1} older)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  // animated height and opacity for the older-sessions container
  const animatedHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, HISTORY_MAX_HEIGHT],
  });
  const animatedOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={historyExpanded ? olderSessions : []}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{new Date(item.createdAt).toLocaleString()}</Text>
                <Text style={{ color: '#666', marginBottom: 6 }}>{item.sets.length} sets</Text>
                {item.sets.map((set) => (
                  <Text key={set.id}>
                    {set.reps ?? '-'} reps @ {set.weight ?? '-'}kg {set.difficultyEmoji}
                  </Text>
                ))}
              </View>

              <View style={{ marginLeft: 12, alignItems: 'flex-end' }}>
                <TouchableOpacity
                  onPress={() => deleteSession(item.id)}
                  style={styles.sessionDeleteBtn}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={<ListHeader />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator
          // footer is our animated container wrapper (so it appears below header/content)
          ListFooterComponent={
            <Animated.View
              style={{
                height: animatedHeight,
                opacity: animatedOpacity,
                overflow: 'hidden',
                marginTop: 8,
              }}
            >
              {/* We render the same olderSessions list inside the animated area for better UX.
                  When collapsed, height=0 so it's effectively hidden. */}
              <FlatList
                data={olderSessions}
                keyExtractor={(s) => s.id}
                renderItem={({ item }) => (
                  <View style={styles.sessionCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700' }}>{new Date(item.createdAt).toLocaleString()}</Text>
                      <Text style={{ color: '#666', marginBottom: 6 }}>{item.sets.length} sets</Text>
                      {item.sets.map((set) => (
                        <Text key={set.id}>
                          {set.reps ?? '-'} reps @ {set.weight ?? '-'}kg {set.difficultyEmoji}
                        </Text>
                      ))}
                    </View>

                    <View style={{ marginLeft: 12, alignItems: 'flex-end' }}>
                      <TouchableOpacity
                        onPress={() => deleteSession(item.id)}
                        style={styles.sessionDeleteBtn}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                nestedScrollEnabled
              />
            </Animated.View>
          }
        />

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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

  // emoji pill
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

  // picker modal
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

  // session card
  sessionCard: {
    backgroundColor: '#f6f6f7',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sessionDeleteBtn: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },

  expandToggle: { marginTop: 8 },
});
