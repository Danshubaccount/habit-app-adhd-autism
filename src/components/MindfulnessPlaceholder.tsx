import React, { useState } from 'react';
import BoxBreathing from './BoxBreathing';
import BodyScanMeditation from './BodyScanMeditation';
import Affirmations from './Affirmations';

interface MindfulnessPlaceholderProps {
    onBack: () => void;
}

type MeditationType = 'selection' | 'box-breathing' | 'body-scan' | 'affirmations';

const MindfulnessPlaceholder: React.FC<MindfulnessPlaceholderProps> = ({ onBack }) => {
    const [selectedMeditation, setSelectedMeditation] = useState<MeditationType>('selection');

    if (selectedMeditation === 'box-breathing') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                    <button
                        onClick={() => setSelectedMeditation('selection')}
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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Box Breathing</h1>
                <BoxBreathing />
            </div>
        );
    }

    if (selectedMeditation === 'body-scan') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                    <button
                        onClick={() => setSelectedMeditation('selection')}
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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Body Scan Meditation</h1>
                <BodyScanMeditation />
            </div>
        );
    }

    if (selectedMeditation === 'affirmations') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                    <button
                        onClick={() => setSelectedMeditation('selection')}
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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Daily Affirmations</h1>
                <Affirmations />
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            padding: '2rem'
        }}>
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

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Mindfulness Practice</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px' }}>
                Choose a practice to cultivate presence and awareness
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                maxWidth: '600px',
                width: '100%'
            }}>
                {/* Box Breathing Card */}
                <div
                    onClick={() => setSelectedMeditation('box-breathing')}
                    style={{
                        background: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                >
                    <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem'
                    }}>🫁</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Box Breathing</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        A simple 4-4-4-4 breathing technique to help you relax and find calm
                    </p>
                </div>

                {/* Body Scan Card */}
                <div
                    onClick={() => setSelectedMeditation('body-scan')}
                    style={{
                        background: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                >
                    <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem'
                    }}>✨</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Body Scan</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        A 5-8 minute guided practice to move awareness through your body
                    </p>
                </div>

                {/* Affirmations Card */}
                <div
                    onClick={() => setSelectedMeditation('affirmations')}
                    style={{
                        background: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-md)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                >
                    <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem'
                    }}>🌟</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Daily Affirmations</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Personalized affirmations to ground you in calm, confidence, and clarity
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MindfulnessPlaceholder;
