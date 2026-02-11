import React from 'react';

interface HomeSelectionProps {
    onSelectGoals: () => void;
    onSelectMindfulness: () => void;
    onSelectJournal: () => void;
}

const HomeSelection: React.FC<HomeSelectionProps> = ({ onSelectGoals, onSelectMindfulness, onSelectJournal }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            // Background is now handled in App.tsx
            color: 'var(--text-primary)',
            position: 'relative'
        }}>
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light overlay for readability
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Buddha Logo */}
                <img
                    src="/buddha-logo.png"
                    alt="Mindfulness Logo"
                    style={{
                        width: '180px',
                        height: '180px',
                        marginBottom: '1rem',
                        opacity: 0.95,
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                        padding: '1rem'
                    }}
                />

                {/* Two-Line Heading */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem'
                }}>
                    <h1 style={{
                        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                        fontSize: '4rem',
                        fontWeight: 500,
                        color: '#3d5a6b',
                        letterSpacing: '0.03em',
                        lineHeight: 1.3,
                        margin: 0,
                        textShadow: '2px 2px 8px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.4)',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}>
                        Grow Mindfully
                        <br />
                        <span style={{
                            fontSize: '3.5rem',
                            fontWeight: 400,
                            letterSpacing: '0.04em'
                        }}>
                            Each Day
                        </span>
                    </h1>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1200px',
                    width: '100%'
                }}>
                    <button
                        onClick={onSelectMindfulness}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            borderRadius: '24px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.9)', // More opaque
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <span style={{ fontSize: '4rem' }}>🧘</span>
                        <h2 style={{ fontSize: '1.8rem', color: '#2d3748', margin: 0 }}>Mindfulness Practice</h2>
                        <p style={{ color: '#4a5568', margin: 0, fontSize: '1rem' }}>
                            Center your mind and find peace.
                        </p>
                    </button>

                    <button
                        onClick={onSelectGoals}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            borderRadius: '24px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.9)', // More opaque
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <span style={{ fontSize: '4rem' }}>🎯</span>
                        <h2 style={{ fontSize: '1.8rem', color: '#2d3748', margin: 0 }}>Goals</h2>
                        <p style={{ color: '#4a5568', margin: 0, fontSize: '1rem' }}>
                            Track your habits and achieve your dreams.
                        </p>
                    </button>

                    <button
                        onClick={onSelectJournal}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem 2rem',
                            borderRadius: '24px',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.9)', // More opaque
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <span style={{ fontSize: '4rem' }}>📓</span>
                        <h2 style={{ fontSize: '1.8rem', color: '#2d3748', margin: 0 }}>Journal</h2>
                        <p style={{ color: '#4a5568', margin: 0, fontSize: '1rem' }}>
                            Reflect on your day with kindness.
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeSelection;
