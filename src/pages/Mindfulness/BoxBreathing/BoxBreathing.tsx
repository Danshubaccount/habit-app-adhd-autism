import React, { useState, useEffect, useRef } from 'react';
import tibetanBellSound from '../../../assets/tibetan-bell.mp3';
import { useMascot } from '../../../context/MascotContext';
import Mascot from '../../../components/Mascot/Mascot';

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

const BoxBreathing: React.FC = () => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [timeLeft, setTimeLeft] = useState(4);
    const [cycleCount, setCycleCount] = useState(0);
    const [feelingBetter, setFeelingBetter] = useState(false);
    const timerRef = useRef<number | null>(null);
    const timeLeftRef = useRef(timeLeft);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const elapsedRef = useRef(0);
    const elapsedTimerRef = useRef<number | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(tibetanBellSound);
    }, []);

    const INHALE_DURATION = 4;
    const HOLD_IN_DURATION = 4;
    const EXHALE_DURATION = 4;
    const HOLD_OUT_DURATION = 4;
    const FEELING_BETTER_SECONDS = 30;

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
            if (elapsedTimerRef.current) {
                clearInterval(elapsedTimerRef.current);
                elapsedTimerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
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

    // Elapsed time tracker for "feeling better" message
    useEffect(() => {
        if (phase !== 'idle' && !elapsedTimerRef.current) {
            elapsedTimerRef.current = window.setInterval(() => {
                elapsedRef.current += 1;
                if (elapsedRef.current >= FEELING_BETTER_SECONDS) {
                    setFeelingBetter(true);
                    if (elapsedTimerRef.current) {
                        clearInterval(elapsedTimerRef.current);
                        elapsedTimerRef.current = null;
                    }
                }
            }, 1000);
        }

        return () => {
            if (elapsedTimerRef.current && phase === 'idle') {
                clearInterval(elapsedTimerRef.current);
                elapsedTimerRef.current = null;
            }
        };
    }, [phase]);

    const { triggerInteraction, updateMascotStreak, mascot } = useMascot();

    const startBreathing = () => {
        setPhase('inhale');
        setTimeLeft(INHALE_DURATION);
        setCycleCount(0);
        setFeelingBetter(false);
        elapsedRef.current = 0;
        triggerInteraction('breathing', 'start');
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    const stopBreathing = () => {
        if (cycleCount >= 2) {
            triggerInteraction('breathing', 'complete');
            updateMascotStreak(true);
        } else {
            triggerInteraction('breathing', 'cancel');
        }
        setPhase('idle');
        setTimeLeft(INHALE_DURATION);
        setFeelingBetter(false);
        elapsedRef.current = 0;
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

    // The aura behind the mascot
    const getAuraScale = () => {
        switch (phase) {
            case 'inhale': return 2.2;
            case 'hold-in': return 2.2;
            case 'exhale': return 1.0;
            case 'hold-out': return 1.0;
            default: return 1.0;
        }
    };

    const mascotName = mascot?.name || 'Your companion';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1.5rem',
            minHeight: '60vh'
        }}>
            {/* Feeling Better Speech Bubble */}
            {feelingBetter && phase !== 'idle' && (
                <div
                    className="glass-panel animate-fade-in"
                    style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '20px',
                        borderBottomRightRadius: '4px',
                        maxWidth: '300px',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        position: 'relative',
                        marginBottom: '0.5rem'
                    }}
                >
                    I'm starting to feel so much better! 🌟 Keep going, we've got this!
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderTop: '10px solid var(--glass-background)',
                    }} />
                </div>
            )}

            {/* Center Stage: Mascot + Breathing Aura */}
            <div style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Breathing Aura Circle behind mascot */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)',
                    opacity: phase === 'idle' ? 0.15 : 0.25,
                    transform: `scale(${getAuraScale()})`,
                    transition: `transform ${getPhaseDuration(phase)}s linear, opacity 0.5s ease`,
                }} />

                {/* The Mascot — center stage */}
                <div style={{
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: phase !== 'idle' ? 'drop-shadow(0 0 20px rgba(255,255,255,0.15))' : 'none',
                }}>
                    <Mascot
                        size={160}
                        currentEmotion={feelingBetter ? 'happy' : (phase !== 'idle' ? 'calm' : 'neutral')}
                        breathingPhase={phase}
                        breathingDuration={getPhaseDuration(phase)}
                    />
                </div>
            </div>

            {/* Instruction Text */}
            <div style={{
                textAlign: 'center',
                zIndex: 1,
            }}>
                <h2 style={{
                    fontSize: '1.6rem',
                    margin: '0 0 0.25rem 0',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.02em'
                }}>
                    {getInstruction()}
                </h2>
                {phase !== 'idle' && (
                    <span style={{
                        fontSize: '2.5rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        opacity: 0.7
                    }}>
                        {timeLeft}
                    </span>
                )}
            </div>

            {/* Info & Controls */}
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    {phase === 'idle'
                        ? `Breathe together with ${mascotName}. Let's find some calm.`
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
        </div>
    );
};

export default BoxBreathing;
