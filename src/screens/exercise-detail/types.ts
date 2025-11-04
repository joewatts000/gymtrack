export type Exercise = {
  id: string;
  title: string;
  sessions: Session[];
  createdAt: string;
};

export type Session = {
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
