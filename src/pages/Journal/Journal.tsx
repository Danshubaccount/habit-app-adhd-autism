import React, { useState, useEffect } from 'react';
import { Calendar, Save, History, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import Confetti from '../../components/Confetti';
import CalendarView from './components/CalendarView';

import CenterColumnLayout from '../../components/CenterColumnLayout';

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
    const { triggerInteraction, updateMascotStreak } = useMascot();
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
            setTimeout(() => {
                setSavedEntries(JSON.parse(saved));
            }, 0);
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
        triggerInteraction('journal', 'complete');
        updateMascotStreak(true);
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
            <CenterColumnLayout onBack={handleBackToWrite} backText="Back to Journal">
                <div style={{ padding: '2rem', width: '100%', maxWidth: '800px' }} className="animate-fade-in">
                    <CalendarView
                        entries={savedEntries}
                        onSelectDate={handleSelectDate}
                    />
                </div>
            </CenterColumnLayout>
        );
    }

    // Read View (Selected Entry)
    if (viewMode === 'read' && selectedEntry) {
        return (
            <CenterColumnLayout onBack={handleBackToCalendar} backText="Back to Calendar">
                <div style={{ width: '100%', maxWidth: '800px', paddingTop: '6rem' }} className="animate-fade-in">
                    <div className="glass-panel" style={{
                        padding: '3rem',
                        borderRadius: '24px',
                        borderLeft: '5px solid var(--primary-color)',
                        textAlign: 'left'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} />
                            {selectedEntry.date}
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                            {selectedEntry.content}
                        </p>
                    </div>
                </div>
            </CenterColumnLayout>
        );
    }

    // Write View (Default)
    return (
        <CenterColumnLayout onBack={onBack} className="animate-fade-in" style={{ paddingTop: '6rem' }}>
            {showConfetti && <Confetti />}

            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>My Journal</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4rem', maxWidth: '600px', fontSize: '1.2rem', lineHeight: 1.6 }}>
                Reflect on your day and cultivate mindfulness through the art of writing
            </p>

            <div className="journal-content-overlay glass-panel" style={{
                width: '100%',
                marginBottom: '5rem',
                textAlign: 'left',
                padding: '4rem',
                position: 'relative'
            }}>
                <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                        How was your day? <Leaf size={28} className="text-primary-text" style={{ color: 'var(--primary-text)' }} />
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>
                        Take a moment to breathe. Focus on the positive moments, what you're grateful for, or simply let your reflections flow onto the page.
                    </p>
                </div>

                {/* Date Picker */}
                <div style={{
                    marginBottom: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        <Calendar size={20} color="var(--primary-text)" />
                        <span>Entry Date:</span>
                    </div>
                    <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="form-input"
                        style={{
                            maxWidth: '200px',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            fontWeight: 600
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <textarea
                        value={entry}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_CHARS) setEntry(e.target.value);
                        }}
                        placeholder="Begin your reflection..."
                        style={{
                            width: '100%',
                            minHeight: '400px',
                            padding: '2.5rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(255, 255, 255, 0.3)',
                            color: 'var(--text-primary)',
                            fontSize: '1.2rem',
                            lineHeight: 1.8,
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'var(--font-body)',
                            boxSizing: 'border-box',
                            transition: 'all 0.3s'
                        }}
                    />

                    <div style={{
                        marginTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span className="journal-encouragement" style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', opacity: 0.8 }}>
                            {entry.length === 0 ? "Your thoughts matter..." :
                                entry.length < 100 ? "Breathe and write..." :
                                    entry.length < 500 ? "Beautiful reflections..." :
                                        entry.length > 800 ? `${entry.length} / ${MAX_CHARS}` :
                                            "Flow with your thoughts..."}
                        </span>

                        {entry.trim() && (
                            <button
                                onClick={handleSave}
                                className="btn-premium btn-premium-primary"
                                style={{ padding: '1.25rem 3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                            >
                                <Save size={20} />
                                Save Entry
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Calendar View Button */}
            <button
                onClick={() => setViewMode('calendar')}
                className="btn-premium btn-premium-secondary"
                style={{ padding: '1.25rem 4rem', marginBottom: '8rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
                <History size={22} />
                Calendar History
            </button>

            {/* Past Entries Section (Centered below) */}
            {savedEntries.length > 0 && (
                <div style={{ width: '100%', maxWidth: '700px', marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
                        <h3 style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-muted)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em'
                        }}>
                            Recent Reflections
                        </h3>
                        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {savedEntries.slice(0, 5).map(saved => (
                            <div key={saved.id} className="glass-panel" style={{
                                padding: '2.5rem',
                                borderRadius: '24px',
                                borderLeft: '6px solid var(--primary-color)',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                                onClick={() => {
                                    setSelectedDate(saved.date);
                                    setViewMode('read');
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={14} />
                                    {saved.date}
                                </div>
                                <p style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.7,
                                    margin: 0,
                                    fontSize: '1.1rem',
                                    color: 'var(--text-primary)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {saved.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </CenterColumnLayout>
    );
};

export default Journal;
