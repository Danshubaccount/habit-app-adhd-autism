import React, { useState, useEffect, useRef } from 'react';
import tibetanBellSound from '../assets/tibetan-bell.mp3';

interface BodyPart {
    name: string;
    category: 'upper' | 'lower' | 'central' | 'head';
}

type MeditationPhase = 'idle' | 'intro' | 'body-scan' | 'whole-body' | 'closing' | 'paused';

const BodyScanMeditation: React.FC = () => {
    const [phase, setPhase] = useState<MeditationPhase>('idle');
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [timeInPhase, setTimeInPhase] = useState(0);
    const [bodySequence, setBodySequence] = useState<BodyPart[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [previousScript, setPreviousScript] = useState('');
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pausedTimeRef = useRef(0);

    useEffect(() => {
        audioRef.current = new Audio(tibetanBellSound);
    }, []);

    // Body part pools
    const bodyParts = {
        upper: [
            { name: 'left hand', category: 'upper' as const },
            { name: 'right hand', category: 'upper' as const },
            { name: 'left arm', category: 'upper' as const },
            { name: 'right arm', category: 'upper' as const },
            { name: 'shoulders', category: 'upper' as const },
            { name: 'chest', category: 'upper' as const },
            { name: 'upper back', category: 'upper' as const },
        ],
        lower: [
            { name: 'left leg', category: 'lower' as const },
            { name: 'right leg', category: 'lower' as const },
            { name: 'left knee', category: 'lower' as const },
            { name: 'right knee', category: 'lower' as const },
            { name: 'left foot', category: 'lower' as const },
            { name: 'right foot', category: 'lower' as const },
            { name: 'hips', category: 'lower' as const },
            { name: 'left ankle', category: 'lower' as const },
            { name: 'right ankle', category: 'lower' as const },
        ],
        central: [
            { name: 'spine', category: 'central' as const },
            { name: 'abdomen', category: 'central' as const },
            { name: 'pelvis', category: 'central' as const },
            { name: 'lower back', category: 'central' as const },
        ],
        head: [
            { name: 'jaw', category: 'head' as const },
            { name: 'scalp', category: 'head' as const },
            { name: 'back of the head', category: 'head' as const },
            { name: 'throat', category: 'head' as const },
            { name: 'forehead', category: 'head' as const },
            { name: 'temples', category: 'head' as const },
        ],
    };

    // Generate random sequence ensuring diversity
    const generateSequence = (): BodyPart[] => {
        const allParts = [...bodyParts.upper, ...bodyParts.lower, ...bodyParts.central, ...bodyParts.head];
        const shuffled = [...allParts].sort(() => Math.random() - 0.5);

        // Select 7-11 parts ensuring mix from different categories
        const targetCount = 7 + Math.floor(Math.random() * 5); // 7-11
        const sequence: BodyPart[] = [];
        const categoryCounts = { upper: 0, lower: 0, central: 0, head: 0 };

        for (const part of shuffled) {
            if (sequence.length >= targetCount) break;

            // Ensure we don't over-represent any category
            if (categoryCounts[part.category] < Math.ceil(targetCount / 3)) {
                sequence.push(part);
                categoryCounts[part.category]++;
            }
        }

        return sequence;
    };

    const startMeditation = () => {
        const sequence = generateSequence();
        setBodySequence(sequence);
        setPhase('intro');
        setCurrentPartIndex(0);
        setTimeInPhase(0);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    const pauseMeditation = () => {
        pausedTimeRef.current = timeInPhase;
        setPhase('paused');
    };

    const resumeMeditation = () => {
        setTimeInPhase(pausedTimeRef.current);
        if (currentPartIndex === 0 && pausedTimeRef.current < 15) {
            setPhase('intro');
        } else if (currentPartIndex < bodySequence.length) {
            setPhase('body-scan');
        } else if (pausedTimeRef.current < 20) {
            setPhase('whole-body');
        } else {
            setPhase('closing');
        }
    };

    const resetMeditation = () => {
        setPhase('idle');
        setCurrentPartIndex(0);
        setTimeInPhase(0);
        setBodySequence([]);
        pausedTimeRef.current = 0;
    };

    // Timer logic
    useEffect(() => {
        if (phase === 'idle' || phase === 'paused') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeInPhase(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [phase]);

    // Detect script changes and trigger transition
    useEffect(() => {
        const currentScript = getScript();
        if (currentScript !== previousScript && previousScript !== '') {
            setIsTransitioning(true);
            setTimeout(() => {
                setPreviousScript(currentScript);
                setIsTransitioning(false);
            }, 800); // Match transition duration
        } else if (previousScript === '') {
            setPreviousScript(currentScript);
        }
    }, [timeInPhase, phase, currentPartIndex]);

    // Phase progression logic
    useEffect(() => {
        if (phase === 'intro' && timeInPhase >= 15) {
            setPhase('body-scan');
            setTimeInPhase(0);
        } else if (phase === 'body-scan' && timeInPhase >= 35) {
            if (currentPartIndex < bodySequence.length - 1) {
                setCurrentPartIndex(prev => prev + 1);
                setTimeInPhase(0);
            } else {
                setPhase('whole-body');
                setTimeInPhase(0);
            }
        } else if (phase === 'whole-body' && timeInPhase >= 20) {
            setPhase('closing');
            setTimeInPhase(0);
        } else if (phase === 'closing' && timeInPhase >= 20) {
            // Play gong at the end of meditation
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));
            }
        }
    }, [timeInPhase, phase, currentPartIndex, bodySequence.length]);

    const getScript = (): string => {
        const totalMinutes = Math.ceil((15 + (bodySequence.length * 35) + 20 + 20) / 60);

        switch (phase) {
            case 'idle':
                return 'A guided practice to bring awareness through your body, noticing subtle sensations and aliveness in each area.';

            case 'intro':
                if (timeInPhase < 4) {
                    return `This meditation will last approximately ${totalMinutes} minutes. A gentle gong will sound at the end to bring you back to centre.`;
                } else if (timeInPhase < 8) {
                    return 'If you feel complete before the meditation ends, simply rest quietly until you hear the gong.';
                } else if (timeInPhase < 12) {
                    return 'Find a comfortable position—sitting or lying down, whatever feels right for you. Let your gaze soften.';
                } else if (timeInPhase < 15) {
                    return 'Notice your breath... the natural rhythm of breathing. No need to change anything.';
                } else {
                    return 'As you settle, if it feels comfortable, you might allow your eyes to gently close.';
                }

            case 'body-scan':
                const currentPart = bodySequence[currentPartIndex];
                if (!currentPart) return '';

                // Vary the phrasing for different body parts to keep it fresh
                const variations = [
                    {
                        intro: `Bring your awareness now to your ${currentPart.name}.`,
                        explore: `What do you notice here? Perhaps warmth, tingling, or a sense of aliveness in your ${currentPart.name}.`,
                        rest: `Simply be with whatever you find. No need to change or fix anything in your ${currentPart.name}.`,
                    },
                    {
                        intro: `Let your attention settle into your ${currentPart.name}.`,
                        explore: `Notice the sensations... maybe pulsing, pressure, or a gentle vibration in your ${currentPart.name}.`,
                        rest: `Just observing. Allowing your ${currentPart.name} to be exactly as it is.`,
                    },
                    {
                        intro: `Gently shift your focus to your ${currentPart.name}.`,
                        explore: `Sense into this area. You might feel temperature, texture, or subtle movement in your ${currentPart.name}.`,
                        rest: `Rest your awareness here. Whatever is present in your ${currentPart.name} is perfectly okay.`,
                    },
                ];

                const variation = variations[currentPartIndex % variations.length];

                if (timeInPhase < 8) {
                    return variation.intro;
                } else if (timeInPhase < 18) {
                    return variation.explore;
                } else if (timeInPhase < 28) {
                    return variation.rest;
                } else {
                    const nextPart = bodySequence[currentPartIndex + 1];
                    if (nextPart) {
                        const transitions = [
                            `And now, let your awareness travel from your ${currentPart.name} to your ${nextPart.name}.`,
                            `Gently guide your attention from your ${currentPart.name}... moving to your ${nextPart.name}.`,
                            `Allow your focus to shift naturally from your ${currentPart.name} toward your ${nextPart.name}.`,
                        ];
                        return transitions[currentPartIndex % transitions.length];
                    } else {
                        return `Take one more breath with your ${currentPart.name}... noticing what's here.`;
                    }
                }

            case 'whole-body':
                if (timeInPhase < 10) {
                    return 'Now, expand your awareness... let it include your whole body. Feel yourself as a complete presence.';
                } else {
                    return 'Notice the aliveness throughout—a field of sensation, vibration, energy flowing through you.';
                }

            case 'closing':
                if (timeInPhase < 8) {
                    return 'Begin to deepen your breath, just a little. Feel the air moving in... and out.';
                } else if (timeInPhase < 15) {
                    return 'When you\'re ready, bring some gentle movement to your fingers and toes. Take your time.';
                } else {
                    return 'In your own time, you might blink your eyes open and return to the space around you.';
                }

            case 'paused':
                return 'Meditation paused. Take your time, and resume when ready.';

            default:
                return '';
        }
    };

    const getProgress = (): number => {
        if (phase === 'idle') return 0;
        if (phase === 'closing' && timeInPhase >= 15) return 100;

        const totalParts = bodySequence.length;
        const introDuration = 15;
        const partDuration = 35;
        const wholeBodyDuration = 20;
        const closingDuration = 20;
        const totalDuration = introDuration + (totalParts * partDuration) + wholeBodyDuration + closingDuration;

        let elapsed = 0;
        if (phase === 'intro') {
            elapsed = timeInPhase;
        } else if (phase === 'body-scan') {
            elapsed = introDuration + (currentPartIndex * partDuration) + timeInPhase;
        } else if (phase === 'whole-body') {
            elapsed = introDuration + (totalParts * partDuration) + timeInPhase;
        } else if (phase === 'closing') {
            elapsed = introDuration + (totalParts * partDuration) + wholeBodyDuration + timeInPhase;
        }

        return Math.min(100, (elapsed / totalDuration) * 100);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTotalElapsed = (): number => {
        if (phase === 'intro') return timeInPhase;
        if (phase === 'body-scan') return 15 + (currentPartIndex * 35) + timeInPhase;
        if (phase === 'whole-body') return 15 + (bodySequence.length * 35) + timeInPhase;
        if (phase === 'closing') return 15 + (bodySequence.length * 35) + 20 + timeInPhase;
        return 0;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            {/* Progress Bar */}
            {phase !== 'idle' && (
                <div style={{ width: '100%' }}>
                    <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${getProgress()}%`,
                            height: '100%',
                            background: 'var(--primary-color)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        marginTop: '0.5rem'
                    }}>
                        {formatTime(getTotalElapsed())}
                    </p>
                </div>
            )}

            {/* Meditation Script */}
            <div style={{
                height: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem 3rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Previous text - scrolls up and fades out */}
                {isTransitioning && previousScript && (
                    <p style={{
                        fontSize: '1.4rem',
                        lineHeight: '1.8',
                        color: 'var(--text-primary)',
                        fontWeight: 300,
                        position: 'absolute',
                        width: 'calc(100% - 6rem)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        margin: 0,
                        animation: 'scrollUpFadeOut 0.8s ease-out forwards'
                    }}>
                        {previousScript}
                    </p>
                )}


                {/* Current text - fades in and centers */}
                <p style={{
                    fontSize: '1.4rem',
                    lineHeight: '1.8',
                    color: 'var(--text-primary)',
                    fontWeight: 300,
                    position: 'absolute',
                    width: 'calc(100% - 6rem)',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, ${isTransitioning ? 'calc(-50% + 20px)' : '-50%'})`,
                    margin: 0,
                    opacity: phase === 'idle' ? 0.7 : (isTransitioning ? 0 : 1),
                    transition: 'opacity 0.8s ease, transform 0.8s ease'
                }}>
                    {getScript()}
                </p>
            </div>

            <style>{`
                @keyframes scrollUpFadeOut {
                    0% {
                        transform: translate(-50%, -50%);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, calc(-50% - 40px));
                        opacity: 0;
                    }
                }
            `}</style>

            {/* Current Body Part Indicator */}
            {phase === 'body-scan' && bodySequence[currentPartIndex] && (
                <div style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Focus Area
                    </p>
                    <p style={{
                        fontSize: '1.5rem',
                        color: 'var(--primary-color)',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                    }}>
                        {bodySequence[currentPartIndex].name}
                    </p>
                </div>
            )}

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                {phase === 'idle' ? (
                    <button
                        onClick={startMeditation}
                        style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 2.5rem',
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
                        Start Meditation
                    </button>
                ) : (
                    <>
                        <button
                            onClick={phase === 'paused' ? resumeMeditation : pauseMeditation}
                            style={{
                                background: phase === 'paused' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                color: 'var(--text-primary)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '0.8rem 2rem',
                                borderRadius: '999px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {phase === 'paused' ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={resetMeditation}
                            style={{
                                background: 'rgba(255,77,77,0.2)',
                                color: '#ff4d4d',
                                border: '1px solid rgba(255,77,77,0.3)',
                                padding: '0.8rem 2rem',
                                borderRadius: '999px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Reset
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BodyScanMeditation;
