import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Confetti from './Confetti';
import CalendarView from './CalendarView';

interface JournalProps {
    onBack: () => void;
}

interface JournalEntry {
    id: string;
    date: string;
    content: string;
}

const Journal: React.FC<JournalProps> = ({ onBack }) => {
    const { currentUser } = useAuth();
    const [entry, setEntry] = useState('');
    const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const [viewMode, setViewMode] = useState<'write' | 'calendar' | 'read'>('write');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const MAX_CHARS = 1000;

    useEffect(() => {
        const saved = localStorage.getItem(`journal_${currentUser?.id}`);
        if (saved) {
            setSavedEntries(JSON.parse(saved));
        }
    }, [currentUser]);

    const handleSave = () => {
        if (!entry.trim()) return;

        const selectedDateObj = new Date(customDate + 'T12:00:00');
        const formattedDate = selectedDateObj.toLocaleDateString();

        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: formattedDate,
            content: entry
        };

        const updatedEntries = [newEntry, ...savedEntries];
        setSavedEntries(updatedEntries);
        localStorage.setItem(`journal_${currentUser?.id}`, JSON.stringify(updatedEntries));
        setEntry('');
        setCustomDate(new Date().toISOString().split('T')[0]); // Reset to today
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        setViewMode('read');
    };

    const handleBackToCalendar = () => {
        setViewMode('calendar');
        setSelectedDate(null);
    };

    const handleBackToWrite = () => {
        setViewMode('write');
        setSelectedDate(null);
    };

    const selectedEntry = selectedDate ? savedEntries.find(e => e.date === selectedDate) : null;

    // Calendar View
    if (viewMode === 'calendar') {
        return (
            <div className="app-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
                <CalendarView
                    entries={savedEntries}
                    onSelectDate={handleSelectDate}
                    onBack={handleBackToWrite}
                />
            </div>
        );
    }

    // Read View (Selected Entry)
    if (viewMode === 'read' && selectedEntry) {
        return (
            <div className="app-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                    <button
                        onClick={handleBackToCalendar}
                        style={{
                            border: 'none',
                            background: 'var(--card-bg)',
                            color: 'var(--text-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        ← Back to Calendar
                    </button>
                </div>

                <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                </header>

                <div style={{
                    background: 'var(--card-bg)',
                    padding: '2rem',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-md)',
                    borderLeft: '4px solid var(--primary-color)'
                }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>
                        {selectedEntry.date}
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '1.1rem' }}>
                        {selectedEntry.content}
                    </p>
                </div>
            </div>
        );
    }

    // Write View (Default)
    return (
        <div className="app-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
            {showConfetti && <Confetti />}

            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                <button
                    onClick={onBack}
                    style={{
                        border: 'none',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>
            </div>

            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>My Journal</h1>
                <button
                    onClick={() => setViewMode('calendar')}
                    className="desktop-only"
                    style={{
                        background: 'var(--primary-color)',
                        border: 'none',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        fontWeight: 600,
                        marginLeft: 'auto',
                        transition: 'all 0.2s'
                    }}
                >
                    📅 Calendar View
                </button>
            </header>

            <div className="journal-layout">
                {/* Main Editor Section */}
                <div className="journal-editor-container">
                    <div className="journal-content-overlay" style={{ marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>How was your day? 🌿</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                Take a moment to reflect. Focus on the positive moments, what you're grateful for, or simply let your thoughts flow. This is your safe space.
                            </p>
                        </div>

                        {/* Date Picker */}
                        <div style={{
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem'
                        }}>
                            <label style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)'
                            }}>
                                📅 Entry Date:
                            </label>
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '2px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--primary-color)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={entry}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_CHARS) setEntry(e.target.value);
                                }}
                                placeholder="Start writing here..."
                                style={{
                                    width: '100%',
                                    minHeight: '300px',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '2px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6,
                                    resize: 'vertical',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />

                            {/* Encouraging message instead of character count */}
                            <div style={{
                                marginTop: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span className="journal-encouragement">
                                    {entry.length === 0 ? "Your thoughts matter..." :
                                        entry.length < 100 ? "Keep going..." :
                                            entry.length < 500 ? "You're doing great..." :
                                                entry.length > 800 ? `${entry.length} / ${MAX_CHARS}` :
                                                    "Beautiful reflections..."}
                                </span>

                                {/* Save button appears when typing */}
                                {entry.trim() && (
                                    <button
                                        onClick={handleSave}
                                        className="journal-save-button"
                                        style={{
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.8rem 2rem',
                                            borderRadius: '999px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'static',
                                            float: 'none',
                                            margin: 0
                                        }}
                                    >
                                        Save Entry
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile History Button */}
                    {savedEntries.length > 0 && (
                        <button
                            onClick={() => setViewMode('calendar')}
                            className="mobile-only"
                            style={{
                                background: 'var(--primary-color)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: 600,
                                width: '100%',
                                transition: 'all 0.2s',
                                display: 'none'
                            }}
                        >
                            📅 View History ({savedEntries.length})
                        </button>
                    )}
                </div>

                {/* Desktop Sidebar - Past Entries */}
                {savedEntries.length > 0 && (
                    <div className="journal-sidebar">
                        <h3 style={{
                            fontSize: '1.2rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem',
                            marginTop: 0
                        }}>
                            Past Entries
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {savedEntries.slice(0, 5).map(saved => (
                                <div key={saved.id} className="glass-panel" style={{
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    borderLeft: '4px solid var(--primary-color)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(-4px)';
                                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                    onClick={() => {
                                        setSelectedDate(saved.date);
                                        setViewMode('read');
                                    }}
                                >
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        {saved.date}
                                    </div>
                                    <p style={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.5,
                                        margin: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        fontSize: '0.95rem'
                                    }}>
                                        {saved.content}
                                    </p>
                                </div>
                            ))}
                            {savedEntries.length > 5 && (
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    style={{
                                        background: 'transparent',
                                        border: '2px solid var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    View All ({savedEntries.length})
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add responsive styles */}
            <style>{`
                @media (max-width: 1023px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: block !important;
                    }
                }
                @media (min-width: 1024px) {
                    .mobile-only {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Journal;
