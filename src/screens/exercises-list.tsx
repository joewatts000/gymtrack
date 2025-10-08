// src/screens/ExercisesList.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ExercisesStackParamList } from '../navigation/exercise-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Exercise = {
  id: string;
  title: string;
  sessions: Session[]; // newest first
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

type NavProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExercisesList'>;

// simple id helper (stable & safe fallback)
function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000).toString(36)}`;
}

export default function ExercisesList() {
  const nav = useNavigation<NavProp>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & save state
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Exercise[] = JSON.parse(raw);
        setExercises(parsed);
      } else {
        setExercises([]);
      }
    } catch (err) {
      console.warn('Failed to load exercises', err);
      Alert.alert('Load failed', 'Could not load exercises from storage.');
    } finally {
      setLoading(false);
    }
  }

  async function persist(items: Exercise[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save exercises', err);
      throw err;
    }
  }

  function openAdd() {
    setNewTitle('');
    setAdding(true);
    // allow the modal to show and autoFocus to work
    setTimeout(() => { }, 100);
  }

  // Defensive addExercise with error handling + id fallback
  async function addExercise() {
    if (saving) return; // prevent double submits
    const title = newTitle.trim();
    if (!title) {
      Alert.alert('Please enter a title');
      return;
    }

    setSaving(true);
    Keyboard.dismiss();

    const ex: Exercise = {
      id: makeId('ex'),
      title,
      sessions: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const next = [ex, ...exercises];
      // optimistic update
      setExercises(next);
      await persist(next);
      setAdding(false);
      setNewTitle('');
      // navigate after save — wrapped in try/catch to report errors
      try {
        nav.navigate('ExerciseDetail', { exerciseId: ex.id });
      } catch (navErr) {
        console.warn('Navigation failed', navErr);
        // Not fatal — still saved locally
        Alert.alert('Saved', 'Exercise created but navigation failed.');
      }
    } catch (err) {
      console.warn('Error creating exercise', err);
      Alert.alert('Save failed', 'Could not create exercise. Please try again.');
      // rollback optimistic update
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const arr: Exercise[] = raw ? JSON.parse(raw) : [];
        setExercises(arr);
      } catch (loadErr) {
        console.warn('Rollback load failed', loadErr);
      }
    } finally {
      setSaving(false);
    }
  }

  async function refresh() {
    setLoading(true);
    await load();
    setLoading(false);
  }

  function renderItem({ item }: { item: Exercise }) {
    const lastSession = item.sessions[0];
    const prevSession = item.sessions[1];

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => nav.navigate('ExerciseDetail', { exerciseId: item.id })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          {lastSession ? (
            <Text style={styles.meta}>
              Current session: {lastSession.sets.length} sets • {new Date(lastSession.createdAt).toLocaleString()}
            </Text>
          ) : (
            <Text style={styles.meta}>No sessions yet — tap to add one</Text>
          )}
          {prevSession && (
            <Text style={styles.smallMeta}>
              Previous: {prevSession.sets.length} sets • {new Date(prevSession.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No exercises yet</Text>
              <Text style={styles.emptySub}>Tap the + button to log your first exercise</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}

      {/* Floating + button */}
      <TouchableOpacity style={styles.addButton} onPress={openAdd} accessibilityLabel="Add exercise">
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add modal */}
      <Modal visible={adding} animationType="slide" transparent onRequestClose={() => setAdding(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Exercise</Text>
            <TextInput
              placeholder="Exercise title (e.g. Bench Press)"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addExercise}
              editable={!saving}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setAdding(false)} disabled={saving}>
                <Text style={{ color: '#333' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSave, saving ? { opacity: 0.6 } : null]}
                onPress={addExercise}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Create</Text>}
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? <View style={{ height: 20 }} /> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    backgroundColor: '#f7f7f8',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#666', marginTop: 4 },
  smallMeta: { color: '#999', marginTop: 4, fontSize: 12 },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginBottom: 6 },
  emptySub: { color: '#666', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,20,0.45)',
    padding: 20,
  },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: {
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtnCancel: { padding: 10, marginRight: 8 },
  modalBtnSave: { backgroundColor: '#007AFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
});
