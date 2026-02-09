import React from 'react';
import type { Habit } from '../types';

interface HabitItemProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    isCompletedToday: boolean;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle, onDelete, isCompletedToday }) => {
    return (
        <div
            className={`habit-item ${isCompletedToday ? 'habit-item--completed' : ''} ${habit.isCritical ? 'habit-item--critical' : ''}`}
        >
            <div className="habit-item-header">
                <div style={{ flex: 1 }}>
                    <div className="habit-meta">
                        <span className="habit-tag" style={{
                            backgroundColor:
                                habit.category === 'health' ? '#fee2e2' :
                                    habit.category === 'work' ? '#dbeafe' :
                                        habit.category === 'mindfulness' ? '#f3e8ff' : '#f3f4f6',
                            color:
                                habit.category === 'health' ? '#991b1b' :
                                    habit.category === 'work' ? '#1e40af' :
                                        habit.category === 'mindfulness' ? '#6b21a8' : '#374151',
                        }}>
                            {habit.category}
                        </span>
                        {habit.isCritical && (
                            <span className="habit-tag critical">Critical</span>
                        )}
                    </div>

                    <h3 className="habit-title">
                        {habit.title}
                    </h3>

                    <div className="habit-details">
                        <div className="detail-row">
                            <span className="detail-label">Cue</span>
                            <span>{habit.cue}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Reward</span>
                            <span>{habit.reward}</span>
                        </div>
                    </div>
                </div>

                <div className="habit-actions">
                    <div className="streak-badge">
                        <span role="img" aria-label="fire">🔥</span>
                        <span>{habit.streak}</span>
                    </div>

                    <button
                        onClick={() => onToggle(habit.id)}
                        className="toggle-btn"
                        aria-label={isCompletedToday ? "Mark not completed" : "Mark completed"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this habit?')) onDelete(habit.id);
                }}
                className="delete-btn"
                aria-label="Delete Habit"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export default HabitItem;
