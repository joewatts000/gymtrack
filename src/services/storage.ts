import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gymwatch:exercises';

export type Exercise = {
  id: string;
  title: string;
  sessions: any[];
  createdAt: string;
};

export async function loadExercises(): Promise<Exercise[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to load exercises', err);
    return [];
  }
}

export async function saveExercises(exercises: Exercise[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
  } catch (err) {
    console.warn('Failed to save exercises', err);
  }
}
