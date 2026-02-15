/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Habit, HabitContextType, Affirmation } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabitContext = () => {
    const context = useContext(HabitContext);
    if (!context) {
        throw new Error('useHabitContext must be used within a HabitProvider');
    }
    return context;
};

interface HabitProviderProps {
    children: ReactNode;
}

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const userId = currentUser ? currentUser.id : 'guest';

    // Namespace data by User ID
    const [habits, setHabits] = useLocalStorage<Habit[]>(`habits_${userId}`, []);
    const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>(`emergencyMode_${userId}`, false);
    const [xp, setXp] = useLocalStorage<number>(`xp_${userId}`, 0);
    const [level, setLevel] = useState(1);
    const [categories, setCategories] = useLocalStorage<string[]>(`categories_${userId}`, ['Health', 'Work', 'Mindfulness', 'Social', 'Other']);
    const [personalAffirmations, setPersonalAffirmations] = useLocalStorage<Affirmation[]>(`personalAffirmations_${userId}`, []);

    useEffect(() => {
        setLevel(Math.floor(xp / 100) + 1);
    }, [xp]);

    const addXp = (amount: number) => {
        setXp(prev => prev + amount);
    };

    const addCategory = (category: string) => {
        if (!categories.includes(category)) {
            setCategories([...categories, category]);
        }
    };

    const addPersonalAffirmation = (text: string, repeats: number, trigger?: string) => {
        const newAffirmation: Affirmation = {
            id: crypto.randomUUID(),
            text,
            repeats,
            trigger,
            isPersonal: true
        };
        setPersonalAffirmations([...personalAffirmations, newAffirmation]);
    };

    const deletePersonalAffirmation = (id: string) => {
        setPersonalAffirmations(personalAffirmations.filter(a => a.id !== id));
    };

    const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates' | 'subtasks'> & { subtasks?: string[]; affirmations?: Affirmation[] }) => {
        const newHabit: Habit = {
            ...habitData,
            id: crypto.randomUUID(),
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString(),
            frequency: habitData.frequency || 7,
            period: habitData.period || 'week',
            graceDays: habitData.graceDays ?? 1,
            scaleLevel: habitData.scaleLevel || 'standard',
            subtasks: (habitData.subtasks || []).map(title => ({
                id: crypto.randomUUID(),
                title,
                completed: false
            })),
            affirmations: habitData.affirmations || []
        };
        setHabits([...habits, newHabit]);
        addXp(50);
    };

    const updateHabit = (id: string, updates: Partial<Habit>) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id !== id) return habit;
            return {
                ...habit,
                ...updates,
                // Recalculate streak if completedDates or graceDays changed
                streak: (updates.completedDates || updates.graceDays !== undefined)
                    ? calculateStreak(updates.completedDates || habit.completedDates, updates.graceDays ?? habit.graceDays)
                    : habit.streak
            };
        }));
    };

    const calculateStreak = (dates: string[], graceDays: number = 1): number => {
        if (dates.length === 0) return 0;

        const sortedDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const today = new Date().toISOString().split('T')[0];

        let currentStreak = 0;
        const lastDate = sortedDates[0];

        // Check if the streak is still alive (done today or yesterday or within grace period)
        const diffInDays = (date1: string, date2: string) => {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
        };

        const daysSinceLast = diffInDays(today, lastDate);
        if (daysSinceLast > graceDays) {
            return 0; // Streak broken
        }

        currentStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const gap = diffInDays(sortedDates[i - 1], sortedDates[i]);
            if (gap <= graceDays + 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        return currentStreak;
    };

    const toggleHabitCompletion = (id: string, date: string) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id !== id) return habit;

            const isCompleted = habit.completedDates.includes(date);
            let newCompletedDates;

            if (isCompleted) {
                newCompletedDates = habit.completedDates.filter(d => d !== date);
            } else {
                newCompletedDates = [...habit.completedDates, date];
                if (!isCompleted) addXp(10);
            }

            return {
                ...habit,
                completedDates: newCompletedDates,
                streak: calculateStreak(newCompletedDates, habit.graceDays)
            };
        }));
    };

    const updateSubtask = (habitId: string, subtaskId: string, completed: boolean) => {
        setHabits(prevHabits => prevHabits.map(habit => {
            if (habit.id !== habitId) return habit;

            const newSubtasks = habit.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed } : st
            );

            const allSubtasksCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);
            const today = new Date().toISOString().split('T')[0];
            const isAlreadyCompletedToday = habit.completedDates.includes(today);

            let newCompletedDates = habit.completedDates;
            const subtask = habit.subtasks.find(s => s.id === subtaskId);
            if (completed && subtask && !subtask.completed) {
                // XP based on scale
                const xpPerSubtask = habit.scaleLevel === 'mini' ? 1 : habit.scaleLevel === 'ideal' ? 3 : 2;
                addXp(xpPerSubtask);
            }

            if (allSubtasksCompleted && !isAlreadyCompletedToday) {
                newCompletedDates = [...habit.completedDates, today];
                const bonusXp = habit.scaleLevel === 'mini' ? 3 : habit.scaleLevel === 'ideal' ? 10 : 5;
                addXp(bonusXp); // Bonus for full completion
            } else if (!allSubtasksCompleted && isAlreadyCompletedToday) {
                // If we uncheck a subtask and it was the last one keeping it completed
                newCompletedDates = habit.completedDates.filter(d => d !== today);
            }

            return {
                ...habit,
                subtasks: newSubtasks,
                completedDates: newCompletedDates,
                streak: calculateStreak(newCompletedDates, habit.graceDays)
            };
        }));
    };

    const updateHabitScale = (habitId: string, scaleLevel: 'mini' | 'standard' | 'ideal') => {
        setHabits(prevHabits => prevHabits.map(habit =>
            habit.id === habitId ? { ...habit, scaleLevel } : habit
        ));
    };

    const deleteHabit = (id: string) => {
        setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
    };

    const getWeeklyProgress = (completedDates: string[]) => {
        if (!completedDates || completedDates.length === 0) return 0;

        const now = new Date();
        const startOfWeek = new Date(now);
        // Set to previous Sunday (or Monday depending on preference, standard getDay() returns 0 for Sunday)
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return completedDates.filter(date => {
            const d = new Date(date);
            return d >= startOfWeek;
        }).length;
    };

    const toggleEmergencyMode = () => {
        setIsEmergencyMode(prev => !prev);
    };

    return (
        <HabitContext.Provider value={{
            habits,
            addHabit,
            updateHabit,
            toggleHabitCompletion,
            updateSubtask,
            updateHabitScale,
            deleteHabit,
            isEmergencyMode,
            toggleEmergencyMode,
            xp,
            level,
            getWeeklyProgress,
            categories,
            addCategory,
            personalAffirmations,
            addPersonalAffirmation,
            deletePersonalAffirmation
        }}>
            {children}
        </HabitContext.Provider>
    );
};
