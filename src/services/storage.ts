import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gymwatch:exercises';

export async function loadAllExercises() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveAllExercises(arr: any[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
