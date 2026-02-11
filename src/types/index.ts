export type HabitCategory = string;

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  password?: string;
  createdAt: string;
}

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
  frequency?: number; // Target times per period (default 7 if undefined)
  period?: 'week' | 'day'; // Default 'week' for this feature
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
  getWeeklyProgress: (completedDates: string[]) => number;
  categories: string[];
  addCategory: (category: string) => void;
}
