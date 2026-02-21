export type HabitCategory = string;

export type MascotType = 'puppy' | 'kitten' | 'bird' | 'fox' | 'bunny';

export interface MascotCustomization {
  color: string;
  outfit?: string;
  accessory?: string;
}

export interface MascotState {
  type: MascotType;
  customization: MascotCustomization;
  name: string;
  lastInteractionAt: string;
  streak: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  password?: string;
  createdAt: string;
  mascot?: MascotState;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Affirmation {
  id: string;
  text: string;
  repeats: number;
  isPersonal: boolean;
  theme?: string;
  trigger?: string;
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
  graceDays: number;
  subtasks: Subtask[];
  affirmations?: Affirmation[];
  scaleLevel: 'mini' | 'standard' | 'ideal';
}

export interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates' | 'subtasks'> & { subtasks?: string[] }) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  updateSubtask: (habitId: string, subtaskId: string, completed: boolean) => void;
  updateHabitScale: (habitId: string, scaleLevel: 'mini' | 'standard' | 'ideal') => void;
  deleteHabit: (id: string) => void;
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;
  xp: number;
  level: number;
  getWeeklyProgress: (completedDates: string[]) => number;
  categories: string[];
  addCategory: (category: string) => void;
  personalAffirmations: Affirmation[];
  addPersonalAffirmation: (text: string, repeats: number, trigger?: string) => void;
  deletePersonalAffirmation: (id: string) => void;
}
