import { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import useExercises from '../../hooks/use-exercises';
import ExerciseRow from './components/exercise-row';
import AddExerciseModal from './components/add-exercise-modal';
import FloatingAddButton from './components/floating-add-button';
import EmptyState from './components/empty-state';
import { ExercisesStackParamList } from '../../navigation/exercises-stack';

type NavProp = NativeStackNavigationProp<ExercisesStackParamList, 'ExercisesList'>;

export default function ExercisesList() {
  const nav = useNavigation<NavProp>();
  const { exercises, loading, saving, createExercise, deleteExercise, refresh } = useExercises();
  const isFocused = useIsFocused();

  const [adding, setAdding] = useState(false);

  // Keep a ref to the currently open swipeable so we can close it when another opens
  const openSwipeableRef = useRef<Swipeable | null>(null);

  useEffect(() => {
    if (isFocused) {
      refresh();
    }
    // refresh is recreated on every render by the hook, so intentionally omit it from deps
    // to avoid a repeated effect that causes a render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  async function handleCreate(title: string) {
    try {
      const ex = await createExercise(title);
      setAdding(false);
      try {
        nav.navigate('ExerciseDetail', { exerciseId: ex.id });
      } catch (navErr) {
        console.warn('Navigation failed', navErr);
        Alert.alert('Saved', 'Exercise created but navigation failed.');
      }
    } catch (err) {
      console.warn('Create failed', err);
      Alert.alert('Save failed', 'Could not create exercise. Please try again.');
    }
  }

  function handleDeleteConfirm(id: string) {
    Alert.alert('Delete exercise?', 'This will remove the exercise and all its sessions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // close any open swipeable first
          if (openSwipeableRef.current) {
            try {
              openSwipeableRef.current.close();
            } catch { }
            openSwipeableRef.current = null;
          }
          try {
            await deleteExercise(id);
          } catch (err) {
            console.warn('Delete failed', err);
            Alert.alert('Delete failed', 'Could not delete exercise. Please try again.');
          }
        },
      },
    ]);
  }

  function setOpenSwipeable(ref: Swipeable | null) {
    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
      try {
        openSwipeableRef.current.close();
      } catch { }
    }
    openSwipeableRef.current = ref;
  }

  function renderItem({ item }: { item: any }) {
    return (
      <ExerciseRow
        item={item}
        onPress={() => nav.navigate('ExerciseDetail', { exerciseId: item.id })}
        onDelete={() => handleDeleteConfirm(item.id)}
        onSetOpenSwipeable={setOpenSwipeable}
      />
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
          ListEmptyComponent={<EmptyState />}
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
      <FloatingAddButton onPress={() => setAdding(true)} accessibilityLabel="Add exercise" />
      <AddExerciseModal
        visible={adding}
        onCancel={() => setAdding(false)}
        onSubmit={handleCreate}
        submitting={saving}
      />
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
  deleteAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    height: '86%',
    alignSelf: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '700', paddingRight: 6 },
});
