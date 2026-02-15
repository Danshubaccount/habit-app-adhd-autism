import React from 'react';
import { Sparkles, Target, BookText } from 'lucide-react';

interface HomeSelectionProps {
    onSelectGoals: () => void;
    onSelectMindfulness: () => void;
    onSelectJournal: () => void;
}

const Home: React.FC<HomeSelectionProps> = ({ onSelectGoals, onSelectMindfulness, onSelectJournal }) => {
    return (
        <div className="center-column-layout" style={{
            minHeight: '100vh',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            zIndex: 1
        }}>
            {/* Dynamic Background Overlay */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.5) 100%)',
                zIndex: -1
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

                {/* Two-Line Heading - Premium Type */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '5rem'
                }}>
                    <h1 className="animate-title" style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        margin: 0
                    }}>
                        Grow Mindfully
                    </h1>
                    <div className="animate-subtitle" style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--primary-text)',
                        marginTop: '0.75rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        opacity: 0.9
                    }}>
                        Each Day
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2.5rem',
                    maxWidth: '1100px',
                    width: '100%',
                    padding: '0 1rem'
                }}>
                    <button
                        onClick={onSelectMindfulness}
                        className="glass-panel"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3.5rem 2rem',
                            border: 'none',
                            cursor: 'pointer',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                    >
                        <Sparkles size={64} strokeWidth={1} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-sans)' }}>Mindfulness</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', lineHeight: 1.5 }}>
                            Peace & Tranquility
                        </p>
                    </button>

                    <button
                        onClick={onSelectGoals}
                        className="glass-panel"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3.5rem 2rem',
                            border: 'none',
                            cursor: 'pointer',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                    >
                        <Target size={64} strokeWidth={1} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-sans)' }}>Goals</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', lineHeight: 1.5 }}>
                            Growth & Tracking
                        </p>
                    </button>

                    <button
                        onClick={onSelectJournal}
                        className="glass-panel"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3.5rem 2rem',
                            border: 'none',
                            cursor: 'pointer',
                            gap: '1.5rem',
                            textAlign: 'center'
                        }}
                    >
                        <BookText size={64} strokeWidth={1} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-sans)' }}>Journal</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem', lineHeight: 1.5 }}>
                            Reflection & Gratitude
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
