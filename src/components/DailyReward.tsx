import React, { useState, useEffect } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext';
import useLocalStorage from '../hooks/useLocalStorage';

const QUOTES = [
    "Small steps every day add up to big results.",
    "You don't have to be perfect, just consistent.",
    "The secret of your future is hidden in your daily routine.",
    "Every action you take is a vote for the person you wish to become.",
    "Success is the product of daily habits—not once-in-a-lifetime transformations.",
    "You are capable of more than you know.",
    "Be gentle with yourself. You're doing great.",
    "Progress, not perfection.",
    "Today is a fresh start.",
    "Your potential is endless."
];

const DailyReward: React.FC = () => {
    const { habits } = useHabitContext();
    const [unlockedDate, setUnlockedDate] = useLocalStorage<string>('dailyRewardDate', '');
    const [quoteIndex, setQuoteIndex] = useLocalStorage<number>('dailyRewardIndex', 0);
    const [isRevealed, setIsRevealed] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.some(h => h.completedDates.includes(today));

    useEffect(() => {
        if (completedToday && unlockedDate !== today) {
            // Unlock new reward
            const newIndex = Math.floor(Math.random() * QUOTES.length);
            setQuoteIndex(newIndex);
            setUnlockedDate(today);
            setTimeout(() => setIsRevealed(true), 0);
        } else if (unlockedDate === today) {
            setTimeout(() => setIsRevealed(true), 0);
        } else {
            setTimeout(() => setIsRevealed(false), 0);
        }
    }, [completedToday, unlockedDate, today, setQuoteIndex, setUnlockedDate]);

    return (
        <div className={`daily-reward-card glass-panel ${isRevealed ? 'revealed' : 'locked'}`} style={{
            padding: '1.5rem 2rem',
            marginBottom: '3rem',
            textAlign: 'center',
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 'var(--radius-lg)'
        }}>
            <div className="reward-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {isRevealed ? (
                    <>
                        <Sparkles size={40} color="var(--primary-text)" />
                        <h3 style={{ margin: 0, color: 'var(--primary-text)', fontWeight: 800 }}>Daily Wisdom</h3>
                        <p style={{ margin: 0, fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>"{QUOTES[quoteIndex]}"</p>
                    </>
                ) : (
                    <>
                        <Lock size={40} color="var(--text-muted)" />
                        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Daily Reward Locked</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Complete 1 habit to unlock today's boost!</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyReward;
