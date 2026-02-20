import React, { useState, useEffect } from 'react';
import { Calendar, Save, History, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMascot } from '../../context/MascotContext';
import Confetti from '../../components/Confetti';
import CalendarView from './components/CalendarView';

import CenterColumnLayout from '../../components/CenterColumnLayout';
import './Journal.css';

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
                <div className="journal-calendar-shell animate-fade-in">
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
                <div className="journal-read-shell animate-fade-in">
                    <div className="glass-panel journal-read-panel">
                        <div className="journal-entry-date">
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
        <CenterColumnLayout onBack={onBack} className="journal-page animate-fade-in">
            {showConfetti && <Confetti />}

            <h1 className="journal-title">My Journal</h1>
            <p className="journal-subtitle">
                Reflect on your day and cultivate mindfulness through the art of writing
            </p>

            <div className="journal-content-overlay glass-panel journal-main-panel">
                <div className="journal-intro">
                    <h2 className="journal-section-title">
                        How was your day? <Leaf size={28} className="text-primary-text" style={{ color: 'var(--primary-text)' }} />
                    </h2>
                    <p className="journal-intro-copy">
                        Take a moment to breathe. Focus on the positive moments, what you're grateful for, or simply let your reflections flow onto the page.
                    </p>
                </div>

                {/* Date Picker */}
                <div className="journal-date-row">
                    <div className="journal-date-label">
                        <Calendar size={20} color="var(--primary-text)" />
                        <span>Entry Date:</span>
                    </div>
                    <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="form-input journal-date-input"
                    />
                </div>

                <div className="journal-editor">
                    <textarea
                        value={entry}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_CHARS) setEntry(e.target.value);
                        }}
                        placeholder="Begin your reflection..."
                        className="journal-textarea"
                    />

                    <div className="journal-editor-footer">
                        <span className="journal-encouragement">
                            {entry.length === 0 ? "Your thoughts matter..." :
                                entry.length < 100 ? "Breathe and write..." :
                                    entry.length < 500 ? "Beautiful reflections..." :
                                        entry.length > 800 ? `${entry.length} / ${MAX_CHARS}` :
                                            "Flow with your thoughts..."}
                        </span>

                        {entry.trim() && (
                            <button
                                onClick={handleSave}
                                className="btn-premium btn-premium-primary journal-save-btn"
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
                className="btn-premium btn-premium-secondary journal-history-btn"
            >
                <History size={22} />
                Calendar History
            </button>

            {/* Past Entries Section (Centered below) */}
            {savedEntries.length > 0 && (
                <div className="journal-recent-shell">
                    <div className="journal-recent-header">
                        <hr />
                        <h3>
                            Recent Reflections
                        </h3>
                        <hr />
                    </div>
                    <div className="journal-recent-list">
                        {savedEntries.slice(0, 5).map(saved => (
                            <div key={saved.id} className="glass-panel journal-entry-card"
                                onClick={() => {
                                    setSelectedDate(saved.date);
                                    setViewMode('read');
                                }}
                            >
                                <div className="journal-entry-date">
                                    <Calendar size={14} />
                                    {saved.date}
                                </div>
                                <p className="journal-entry-preview">
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
