import React, { useState } from 'react';

interface JournalEntry {
    id: string;
    date: string;
    content: string;
}

interface CalendarViewProps {
    entries: JournalEntry[];
    onSelectDate: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, onSelectDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday, 1 = Monday, ...

    // Adjust for Monday start (Monday=0 -> Sunday=6)
    // The previous implementation assumed Monday start mapping.
    // Sunday (0) -> should be index 6
    // Monday (1) -> should be index 0
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startDayIndex; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }


    const hasEntry = (day: number | null) => {
        if (!day) return false;
        // Construct date string to match entry format
        // Note: This relies on entries being saved with consistent locale.
        // If the user's browser locale changes, this might break.
        // A more robust app would store ISO strings, but we follow existing pattern.
        const checkDate = new Date(year, month, day).toLocaleDateString();
        return entries.some(e => e.date === checkDate);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number | null) => {
        if (!day) return;
        const dateStr = new Date(year, month, day).toLocaleDateString();
        onSelectDate(dateStr);
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    return (
        <div className="animate-fade-in" style={{
            background: 'var(--card-bg)',
            padding: '2rem',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '100%',
            margin: '0 auto',
            color: 'var(--text-primary)'
        }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        ‹
                    </button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, minWidth: '140px', textAlign: 'center' }}>
                        {monthNames[month]} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{year}</span>
                    </h2>
                    <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        ›
                    </button>
                </div>
                <div style={{ width: '80px' }}></div> {/* Spacer for alignment */}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '1rem' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '1rem', columnGap: '0.5rem' }}>
                {days.map((day, index) => {
                    if (day === null) return <div key={`empty-${index}`} />;

                    const isToday = isCurrentMonth && day === today.getDate();
                    const entryExists = hasEntry(day);

                    return (
                        <div key={day} style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => handleDayClick(day)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: isToday ? 'var(--primary-color)' : 'transparent',
                                    color: isToday ? 'white' : 'var(--text-primary)',
                                    fontWeight: isToday ? 700 : 400,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isToday ? '0 4px 10px rgba(255, 142, 114, 0.4)' : 'none'
                                }}
                            >
                                {day}
                                {entryExists && !isToday && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        width: '5px',
                                        height: '5px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary-color)'
                                    }} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
