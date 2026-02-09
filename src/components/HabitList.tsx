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
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0 }}>
                            Structure <span style={{ color: 'var(--primary-color)' }}>Builder</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {isEmergencyMode
                                ? "Only the essentials."
                                : "Building systems, one atom at a time."}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>
                            LVL {level || 1}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                            {xp || 0} XP
                        </div>
                    </div>
                </div>

                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {progress}% Completed
                </p>
            </header>

            <div>
                {sortedHabits.length === 0 ? (
                    <div style={{
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
        </div>
    );
};

export default HabitList;
