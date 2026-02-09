export type HabitCategory = 'health' | 'work' | 'mindfulness' | 'social' | 'other';

export interface Habit {
  id: string;
  title: string;
  cue: string;
  routine: string;
  reward: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  isCritical: boolean; // For Emergency Mode
  createdAt: string;
}

export interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;
  xp: number;
  level: number;
}
