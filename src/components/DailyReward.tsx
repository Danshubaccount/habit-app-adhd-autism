import React, { useState, useEffect } from 'react';
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
            setIsRevealed(true);
        } else if (unlockedDate === today) {
            setIsRevealed(true);
        } else {
            setIsRevealed(false);
        }
    }, [completedToday, unlockedDate, today, setQuoteIndex, setUnlockedDate]);

    return (
        <div className={`daily-reward-card glass-panel ${isRevealed ? 'revealed' : 'locked'}`}>
            <div className="reward-content">
                {isRevealed ? (
                    <>
                        <div className="reward-icon">🌟</div>
                        <h3>Daily Wisdom</h3>
                        <p>"{QUOTES[quoteIndex]}"</p>
                    </>
                ) : (
                    <>
                        <div className="reward-icon">🔒</div>
                        <h3>Daily Reward Locked</h3>
                        <p>Complete 1 habit to unlock today's boost!</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyReward;
