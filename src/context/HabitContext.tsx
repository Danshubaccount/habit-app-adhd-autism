import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Habit, HabitContextType } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

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
    const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
    const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>('emergencyMode', false);
    const [xp, setXp] = useLocalStorage<number>('xp', 0);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        setLevel(Math.floor(xp / 100) + 1);
    }, [xp]);

    const addXp = (amount: number) => {
        setXp(prev => prev + amount);
    };

    const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: crypto.randomUUID(),
            completedDates: [],
            streak: 0,
            createdAt: new Date().toISOString(),
        };
        setHabits([...habits, newHabit]);
        addXp(50); // XP for creating a habit
    };

    const calculateStreak = (dates: string[]): number => {
        if (dates.length === 0) return 0;

        const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let currentStreak = 0;
        let expectedDate = today;

        // Check if habit was done today
        if (sortedDates[0] === today) {
            currentStreak++;
            expectedDate = yesterday;
        } else if (sortedDates[0] === yesterday) {
            // If not done today but done yesterday, streak is still alive
            expectedDate = yesterday;
        } else {
            // Streak broken
            return 0;
        }

        // Iterate through past dates
        for (let i = (sortedDates[0] === today ? 1 : 0); i < sortedDates.length; i++) {
            if (sortedDates[i] === expectedDate) {
                currentStreak++;
                // Move expected date back one day
                const prevDate = new Date(expectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                expectedDate = prevDate.toISOString().split('T')[0];
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
                if (!isCompleted) addXp(10); // XP for completing a habit
            }

            return {
                ...habit,
                completedDates: newCompletedDates,
                streak: calculateStreak(newCompletedDates)
            };
        }));
    };

    const deleteHabit = (id: string) => {
        setHabits(prevHabits => prevHabits.filter(h => h.id !== id));
    };

    const toggleEmergencyMode = () => {
        setIsEmergencyMode(prev => !prev);
    };

    return (
        <HabitContext.Provider value={{
            habits,
            addHabit,
            toggleHabitCompletion,
            deleteHabit,
            isEmergencyMode,
            toggleEmergencyMode,
            xp,
            level
        }}>
            {children}
        </HabitContext.Provider>
    );
};
