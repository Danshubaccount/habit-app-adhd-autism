import React, { useEffect, useRef } from 'react';
import { Flame, Check, Trash2, Sun, Play, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Habit } from '../../../types';
import { useHabitContext } from '../../../context/HabitContext';
import tibetanBellSound from '../../../assets/tibetan-bell.mp3';

interface HabitItemProps {
    habit: Habit;
    onToggle: (id: string, isNowCompleted: boolean) => void;
    onDelete: (id: string) => void;
    isCompletedToday: boolean;
    onEdit: (id: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle, onDelete, isCompletedToday, onEdit }) => {
    const navigate = useNavigate();
    const { getWeeklyProgress, updateSubtask, updateHabitScale } = useHabitContext();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isExpanded, setIsExpanded] = React.useState(false);

    useEffect(() => {
        audioRef.current = new Audio(tibetanBellSound);
    }, []);

    const handleToggle = () => {
        const becomingCompleted = !isCompletedToday;
        if (becomingCompleted && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
        onToggle(habit.id, becomingCompleted);
    };

    const { today, yesterday } = React.useMemo(() => {
        const d = new Date();
        const t = d.toISOString().split('T')[0];
        const y = new Date(d.getTime() - 86400000).toISOString().split('T')[0];
        return { today: t, yesterday: y };
    }, []);

    const missedYesterday = !habit.completedDates.includes(yesterday) && !habit.completedDates.includes(today);
    const isGraceActive = missedYesterday && habit.streak > 0;

    return (
        <div
            className={`habit-item glass-panel ${isCompletedToday ? 'habit-item--completed' : ''} ${habit.isCritical ? 'habit-item--critical' : ''}`}
            style={{
                borderLeft: habit.isCritical ? '6px solid var(--danger-color)' : isCompletedToday ? '6px solid var(--success-color)' : isGraceActive ? '6px solid var(--warning-color)' : '1px solid var(--border-color)',
                padding: '1.5rem 2rem',
                borderRadius: 'var(--radius-lg)'
            }}
        >
            <div className="habit-item-header">
                <div style={{ flex: 1 }}>
                    <div className="habit-meta" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`habit-tag ${habit.category}`} style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            {habit.category}
                        </span>
                        {habit.isCritical && (
                            <span className="habit-tag critical" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Critical</span>
                        )}
                        {isGraceActive && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--warning-color)', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                Grace Day Active
                            </span>
                        )}
                    </div>

                    <h3 className="habit-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {habit.title}
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', opacity: 0.7 }}>
                            {getWeeklyProgress(habit.completedDates)} / {habit.frequency || 7} wk
                        </span>
                    </h3>

                    {habit.subtasks && habit.subtasks.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-text)',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {isExpanded ? 'Hide Steps' : `Show Steps (${habit.subtasks.filter(s => s.completed).length}/${habit.subtasks.length})`}
                            </button>

                            {isExpanded && (
                                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {habit.subtasks.map(st => (
                                        <label key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: st.completed ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                                            <input
                                                type="checkbox"
                                                checked={st.completed}
                                                onChange={(e) => updateSubtask(habit.id, st.id, e.target.checked)}
                                                style={{ accentColor: 'var(--primary-color)' }}
                                            />
                                            <span style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>{st.title}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {habit.affirmations && habit.affirmations.length > 0 && (
                        <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sun size={14} /> Affirmations
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {habit.affirmations.map(aff => (
                                    <div
                                        key={aff.id}
                                        onClick={() => navigate('/mindfulness/affirmations', { state: { affirmation: aff } })}
                                        className="glass-panel"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            fontSize: '0.9rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: 'var(--text-primary)' }}>{aff.text}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{aff.repeats} repeats</span>
                                        </div>
                                        <Play size={14} color="var(--primary-color)" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="habit-details" style={{ marginTop: '1.25rem' }}>
                        <div className="detail-row" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="detail-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Cue</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{habit.cue}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="detail-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Reward</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{habit.reward}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="detail-label" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Scale</span>
                                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                                    {(['mini', 'standard', 'ideal'] as const).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateHabitScale(habit.id, s)}
                                            style={{
                                                padding: '2px 8px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border-color)',
                                                background: habit.scaleLevel === s ? 'var(--primary-color)' : 'transparent',
                                                color: habit.scaleLevel === s ? 'white' : 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="habit-actions" style={{ gap: '1.5rem' }}>
                    <div className="streak-badge" style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        <Flame size={18} fill="currentColor" />
                        <span style={{ fontSize: '1.1rem' }}>{habit.streak}</span>
                    </div>

                    <button
                        onClick={handleToggle}
                        className="toggle-btn"
                        style={{ width: '4rem', height: '4rem' }}
                        aria-label={isCompletedToday ? "Mark not completed" : "Mark completed"}
                    >
                        {isCompletedToday ? <Check size={32} strokeWidth={3} /> : <div style={{ width: 32, height: 32 }} />}
                    </button>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(habit.id);
                }}
                className="delete-btn"
                style={{ top: '1.5rem', right: '3.5rem', opacity: 0.4 }}
                aria-label="Edit Habit"
            >
                <Pencil size={18} />
            </button>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this habit?')) onDelete(habit.id);
                }}
                className="delete-btn"
                style={{ top: '1.5rem', right: '1.5rem', opacity: 0.4 }}
                aria-label="Delete Habit"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export default HabitItem;
