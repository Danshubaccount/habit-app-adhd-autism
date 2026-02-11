import React from 'react';
import { useHabitContext } from '../context/HabitContext';
import HabitItem from './HabitItem';

const HabitList: React.FC = () => {
    const { habits, toggleHabitCompletion, deleteHabit, isEmergencyMode, xp, level } = useHabitContext();

    const today = new Date().toISOString().split('T')[0];

    const visibleHabits = habits.filter(habit => {
        if (isEmergencyMode) {
            return habit.isCritical;
        }
        return true;
    });

    // Sort: Critical first, then incomplete first
    const sortedHabits = [...visibleHabits].sort((a, b) => {
        if (a.isCritical && !b.isCritical) return -1;
        if (!a.isCritical && b.isCritical) return 1;

        const aCompleted = a.completedDates.includes(today);
        const bCompleted = b.completedDates.includes(today);
        if (!aCompleted && bCompleted) return -1;
        if (aCompleted && !bCompleted) return 1;
        return 0;
    });

    const completedCount = habits.filter(h => h.completedDates.includes(today)).length;
    const totalCount = habits.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <div>
            <header className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem 0' }}>
                        Hello, <span style={{ color: 'var(--primary-color)' }}>Friend!</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {isEmergencyMode
                            ? "Take a deep breath. Just the essentials today."
                            : "You are becoming 1% better every day."}
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                            {level || 1}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            Level
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                            {xp || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            XP
                        </div>
                    </div>
                </div>

                <div className="progress-track" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    {progress}% Completed
                </p>
            </header>

            <div>
                {sortedHabits.length === 0 ? (
                    <div className="glass-panel" style={{
                        textAlign: 'center',
                        padding: '3rem',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--text-secondary)'
                    }}>
                        <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                            {isEmergencyMode ? "No critical habits set." : "No habits found."}
                        </p>
                        <p style={{ fontSize: '0.875rem' }}>
                            {isEmergencyMode ? "Switch off emergency mode to add habits." : "Start small. Add one today."}
                        </p>
                    </div>
                ) : (
                    sortedHabits.map(habit => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            onToggle={(id) => toggleHabitCompletion(id, today)}
                            onDelete={deleteHabit}
                            isCompletedToday={habit.completedDates.includes(today)}
                        />
                    ))
                )}
            </div>

            <div className="glass-panel" style={{ marginTop: '4rem', textAlign: 'center', padding: '1.5rem', borderRadius: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>What this means to you</h4>
                <p style={{ fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    Every habit you complete is a vote for the person you wish to become.
                    You aren't just ticking a box; you are proving to yourself that you can trust yourself.
                </p>
            </div>
        </div>
    );
};

export default HabitList;
