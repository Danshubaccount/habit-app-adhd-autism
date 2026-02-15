import React from 'react';
import { Star } from 'lucide-react';
import { useHabitContext } from '../../../context/HabitContext';
import HabitItem from './HabitItem';

interface HabitListProps {
    onHabitComplete?: () => void;
    onEdit: (id: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({ onHabitComplete, onEdit }) => {
    const { habits, toggleHabitCompletion, deleteHabit, isEmergencyMode } = useHabitContext();

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

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sortedHabits.length === 0 ? (
                    <div className="glass-panel" style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-secondary)'
                    }}>
                        <Star size={40} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            {isEmergencyMode ? "No critical habits set." : "No habits found."}
                        </p>
                        <p style={{ fontSize: '0.9rem' }}>
                            {isEmergencyMode ? "Switch off emergency mode to add habits." : "Start small. Add one today."}
                        </p>
                    </div>
                ) : (
                    sortedHabits.map(habit => (
                        <HabitItem
                            key={habit.id}
                            habit={habit}
                            onToggle={(id, isNowCompleted) => {
                                toggleHabitCompletion(id, today);
                                if (isNowCompleted && onHabitComplete) onHabitComplete();
                            }}
                            onDelete={deleteHabit}
                            isCompletedToday={habit.completedDates.includes(today)}
                            onEdit={onEdit}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default HabitList;
