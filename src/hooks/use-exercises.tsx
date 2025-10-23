import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../types/exercises';

const STORAGE_KEY = 'gymwatch:exercises';

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 10000).toString(36)}`;
}

export default function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setExercises(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.warn('useExercises.load failed', err);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(items: Exercise[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async function createExercise(title: string) {
    if (saving) throw new Error('already saving');
    setSaving(true);
    const ex: Exercise = {
      id: makeId('ex'),
      title,
      sessions: [],
      createdAt: new Date().toISOString(),
    };
    const next = [ex, ...exercises];
    setExercises(next); // optimistic
    try {
      await persist(next);
      return ex;
    } catch (err) {
      console.warn('createExercise persist failed', err);
      // rollback: reload from storage
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setExercises(raw ? JSON.parse(raw) : []);
      } catch (loadErr) {
        console.warn('rollback load failed', loadErr);
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteExercise(id: string) {
    const next = exercises.filter((e) => e.id !== id);
    setExercises(next); // optimistic
    try {
      await persist(next);
    } catch (err) {
      console.warn('deleteExercise persist failed', err);
      // rollback: reload from storage
      await load();
      throw err;
    }
  }

  async function refresh() {
    setLoading(true);
    await load();
    setLoading(false);
  }

  return {
    exercises,
    loading,
    saving,
    createExercise,
    deleteExercise,
    refresh,
    setExercises, // for rare cases
  };
}
