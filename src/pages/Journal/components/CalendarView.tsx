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
        <div className="glass-panel journal-calendar-panel animate-fade-in">
            <header className="journal-calendar-header">
                <div className="journal-calendar-nav">
                    <button onClick={handlePrevMonth} className="journal-calendar-arrow">
                        ‹
                    </button>
                    <h2 className="journal-calendar-title">
                        {monthNames[month]} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{year}</span>
                    </h2>
                    <button onClick={handleNextMonth} className="journal-calendar-arrow">
                        ›
                    </button>
                </div>
                <div style={{ width: '80px' }}></div>
            </header>

            <div className="journal-calendar-weekdays">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
                    <div key={day} className="journal-calendar-weekday">
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
