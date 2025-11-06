export type SetItem = {
  id: string;
  weight: number | null;
  reps: number | null;
  difficultyLight: 'red' | 'orange' | 'green';
};

export type Session = {
  id: string;
  createdAt: string;
  sets: SetItem[];
};

export type Exercise = {
  id: string;
  title: string;
  sessions: Session[];
  createdAt: string;
};
