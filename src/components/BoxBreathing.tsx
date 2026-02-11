import React, { useState, useEffect, useRef } from 'react';
import tibetanBellSound from '../assets/tibetan-bell.mp3';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

const BoxBreathing: React.FC = () => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [timeLeft, setTimeLeft] = useState(4);
    const [cycleCount, setCycleCount] = useState(0);
    const timerRef = useRef<number | null>(null);
    const timeLeftRef = useRef(timeLeft);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(tibetanBellSound);
    }, []);

    const INHALE_DURATION = 4;
    const HOLD_IN_DURATION = 4;
    const EXHALE_DURATION = 4;
    const HOLD_OUT_DURATION = 4;

    const getPhaseDuration = (p: Phase) => {
        switch (p) {
            case 'inhale': return INHALE_DURATION;
            case 'hold-in': return HOLD_IN_DURATION;
            case 'exhale': return EXHALE_DURATION;
            case 'hold-out': return HOLD_OUT_DURATION;
            default: return 0;
        }
    };

    const getNextPhase = (current: Phase): Phase => {
        switch (current) {
            case 'inhale': return 'hold-in';
            case 'hold-in': return 'exhale';
            case 'exhale': return 'hold-out';
            case 'hold-out': return 'inhale';
            default: return 'idle';
        }
    };

    // Keep ref in sync with state for interval closure usage
    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    useEffect(() => {
        if (phase === 'idle') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
            // Check the ref to get the current time without closure staleness
            if (timeLeftRef.current <= 1) {
                const next = getNextPhase(phase);
                setPhase(next);
                if (next === 'inhale') {
                    setCycleCount(c => c + 1);
                }
                const nextDuration = getPhaseDuration(next);
                setTimeLeft(nextDuration);
            } else {
                setTimeLeft(prev => prev - 1);
            }
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [phase]);

    const startBreathing = () => {
        setPhase('inhale');
        setTimeLeft(INHALE_DURATION);
        setCycleCount(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    const stopBreathing = () => {
        setPhase('idle');
        setTimeLeft(INHALE_DURATION);
    };

    const getInstruction = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In...';
            case 'hold-in': return 'Hold...';
            case 'exhale': return 'Breathe Out...';
            case 'hold-out': return 'Hold...';
            default: return 'Ready?';
        }
    };

    const getScale = () => {
        switch (phase) {
            case 'inhale': return 2;
            case 'hold-in': return 2;
            case 'exhale': return 1;
            case 'hold-out': return 1;
            default: return 1;
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '2rem'
        }}>
            <div style={{
                position: 'relative',
                width: '150px',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Breathing Circle */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    opacity: 0.3,
                    transform: `scale(${getScale()})`,
                    // Use the duration of the current phase for the transition
                    transition: `transform ${getPhaseDuration(phase)}s linear`,
                }} />

                {/* Inner Text */}
                <div style={{
                    zIndex: 1,
                    textAlign: 'center',
                    color: 'var(--text-primary)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                        {getInstruction()}
                    </h2>
                    {phase !== 'idle' && (
                        <span style={{ fontSize: '2rem', fontWeight: 600 }}>{timeLeft}</span>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {phase === 'idle'
                        ? 'Box breathing is a simple technique to help you relax.'
                        : `Cycle: ${cycleCount + 1}`}
                </p>

                <button
                    onClick={phase === 'idle' ? startBreathing : stopBreathing}
                    style={{
                        background: phase === 'idle' ? 'var(--primary-color)' : 'var(--danger-color, #ff4d4d)',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 2rem',
                        borderRadius: '999px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {phase === 'idle' ? 'Start Exercise' : 'Stop'}
                </button>
            </div>

            <style>
                {`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}
            </style>
        </div>
    );
};

export default BoxBreathing;
