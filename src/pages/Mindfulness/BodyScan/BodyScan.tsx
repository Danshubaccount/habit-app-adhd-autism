import React, { useState, useEffect, useRef } from 'react';
import tibetanBellSound from '../../../assets/tibetan-bell.mp3';
import { useMascot } from '../../../context/MascotContext';
import { ElevenLabsService } from '../../../services/elevenlabs';
import { useMeditationAudio } from '../../../hooks/useMeditationAudio';
import { Play, Pause, RotateCcw, Volume2, Music, Timer } from 'lucide-react';

interface BodyPart {
    name: string;
    category: 'upper' | 'lower' | 'central' | 'head';
}

type MeditationPhase = 'idle' | 'intro' | 'body-scan' | 'whole-body' | 'closing' | 'paused';

const iconButtonStyle = {
    background: 'rgba(255,255,255,0.08)',
    color: 'white',
    border: 'none',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const volumeControlStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const volumeHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem'
};

const BodyScanMeditation: React.FC = () => {
    const [phase, setPhase] = useState<MeditationPhase>('idle');
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [timeInPhase, setTimeInPhase] = useState(0);
    const [bodySequence, setBodySequence] = useState<BodyPart[]>([]);
    const [scriptHistory, setScriptHistory] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [translateY, setTranslateY] = useState(0);
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pausedTimeRef = useRef(0);
    const [isListenMode, setIsListenMode] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const OCEAN_WAVES_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-beach-waves-loop-1196.mp3';

    const {
        isPlaying,
        isAmbientEnabled,
        voiceVolume,
        ambientVolume,
        currentTime,
        duration,
        play: playAudio,
        pause: pauseAudio,
        restart: restartAudio,
        toggleAmbient,
        setVoiceVolume,
        setAmbientVolume,
    } = useMeditationAudio(OCEAN_WAVES_URL);

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

        // Select 1 part for a 45s test script
        const targetCount = 1;
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

    const { triggerInteraction, updateMascotStreak } = useMascot();

    const startMeditation = () => {
        const sequence = generateSequence();
        setBodySequence(sequence);
        setPhase('intro');
        setCurrentPartIndex(0);
        setTimeInPhase(0);
        setIsListenMode(false);
        triggerInteraction('meditation', 'start');

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    const startListenMode = async () => {
        if (!import.meta.env.VITE_ELEVEN_LABS_API_KEY) {
            setApiKeyMissing(true);
            return;
        }

        const sequence = generateSequence();
        setBodySequence(sequence);
        setIsGenerating(true);
        setError(null);
        setCurrentPartIndex(0);
        setTimeInPhase(0);

        // Notify user generation is starting
        triggerInteraction('meditation', 'start');

        // Generate the full script text

        // Add intro lines manually to match getScript logic or use ElevenLabsService.prepareFullScript
        // We want the voice to read the WHOLE thing in one go or segment by segment?
        // Programmatic structure requested: Intro (Static) + Dynamic + Closing (Static)

        const dynamicContent = sequence.map((part, index) => {
            const variations = [
                `Allow your awareness to drift gently toward your ${part.name}.\n...\n...\n...\n...\n...\nObserve the subtle landscape of sensation here... perhaps a softness, or a quiet pulse.\n...\n...\n...\n...\n...\n...\n...\n...\nSimply noticing, without needing to change a thing.\n...\n...\n...\n...\n...\nBeing present.\n...\n...\n...\n...\n...\n...\n...\n...`,
                `Gently guide your focus into your ${part.name}.\n...\n...\n...\n...\n...\nNotice the temperature... the texture... the very aliveness within your ${part.name}.\n...\n...\n...\n...\n...\n...\n...\n...\nLetting go of any effort.\n...\n...\n...\n...\n...\nResting in this breath.\n...\n...\n...\n...\n...\n...\n...\n...`
            ];
            return variations[index % variations.length];
        }).join('\n');

        const wholeBodyContent = `\nNow, feel your presence... your entire body as one field of awareness.\n...\n...\n...\n...\n...\n...\n...\n...\nComplete. Still.\n...\n...\n...\n...\n...\n...\n...\n...\nPerfectly at peace.\n...\n...\n...\n...\n...\n...\n...\n...`;

        const fullScript = ElevenLabsService.prepareFullScript(`${dynamicContent}\n${wholeBodyContent}`);

        try {
            const url = await ElevenLabsService.textToSpeech(fullScript);
            setVoiceUrl(url);
            setIsListenMode(true);
            setPhase('intro');
            playAudio(url);
            setError(null);
        } catch (err: any) {
            console.error("Failed to generate voice:", err);
            setError(err.message || "Failed to generate audio. Please check your API key and connection.");
            setIsListenMode(false);
            setPhase('idle');
        } finally {
            setIsGenerating(false);
        }
    };

    const pauseMeditation = () => {
        pausedTimeRef.current = timeInPhase;
        setPhase('paused');
    };

    const resumeMeditation = () => {
        setTimeInPhase(pausedTimeRef.current);
        if (currentPartIndex === 0 && pausedTimeRef.current < 18) {
            setPhase('intro');
        } else if (currentPartIndex < bodySequence.length) {
            setPhase('body-scan');
        } else if (pausedTimeRef.current < 25) {
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
        setScriptHistory(['A guided practice to bring awareness through your body, noticing subtle sensations and aliveness in each area.']);
        pausedTimeRef.current = 0;
        setIsListenMode(false);
        pauseAudio();
    };

    // Sync phase and current part with audio in Listen mode
    useEffect(() => {
        if (!isListenMode || !isPlaying) return;

        const time = currentTime;
        const introDuration = 12; // ~12s for 4 short phrases + ellipsis pauses
        const partDuration = 25; // ~25s per body part
        const wholeBodyDuration = 15;

        if (time < introDuration) {
            setPhase('intro');
            setTimeInPhase(Math.floor(time));
        } else if (time < introDuration + (bodySequence.length * partDuration)) {
            setPhase('body-scan');
            const relativeTime = time - introDuration;
            const partIndex = Math.floor(relativeTime / partDuration);
            setCurrentPartIndex(partIndex);
            setTimeInPhase(Math.floor(relativeTime % partDuration));
        } else if (time < introDuration + (bodySequence.length * partDuration) + wholeBodyDuration) {
            setPhase('whole-body');
            const relativeTime = time - introDuration - (bodySequence.length * partDuration);
            setTimeInPhase(Math.floor(relativeTime));
        } else {
            setPhase('closing');
            const relativeTime = time - introDuration - (bodySequence.length * partDuration) - wholeBodyDuration;
            setTimeInPhase(Math.floor(relativeTime));
        }

        // Handle completion
        if (duration > 0 && time >= duration - 1) {
            triggerInteraction('meditation', 'complete');
            updateMascotStreak(true);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.error("Error playing sound:", e));
            }
        }
    }, [currentTime, isListenMode, isPlaying, bodySequence.length, duration, triggerInteraction, updateMascotStreak]);

    // Timer logic for manual Reading mode
    useEffect(() => {
        if (phase === 'idle' || phase === 'paused' || isListenMode) {
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
    }, [phase, isListenMode]);

    const getScript = React.useCallback((): string => {
        const totalMinutes = Math.ceil((15 + (bodySequence.length * 35) + 20 + 20) / 60);

        // In Listen mode, show exactly what the audio is saying
        if (isListenMode) {
            switch (phase) {
                case 'idle':
                    return 'A guided practice to bring awareness through your body, noticing subtle sensations and aliveness in each area.';

                case 'intro': {
                    if (timeInPhase < 3) {
                        return 'Welcome.';
                    } else if (timeInPhase < 6) {
                        return 'Take a moment to simply be.';
                    } else if (timeInPhase < 9) {
                        return 'Release any expectations, and just notice.';
                    } else {
                        return 'Let\u2019s begin.';
                    }
                }

                case 'body-scan': {
                    const currentPart = bodySequence[currentPartIndex];
                    if (!currentPart) return '';

                    const listenVariations = [
                        {
                            a: `Allow your awareness to drift gently toward your ${currentPart.name}.`,
                            b: `Observe the subtle landscape of sensation here... perhaps a softness, or a quiet pulse.`,
                            c: `Simply noticing, without needing to change a thing.`,
                            d: `Being present.`,
                        },
                        {
                            a: `Gently guide your focus into your ${currentPart.name}.`,
                            b: `Notice the temperature... the texture... the very aliveness within your ${currentPart.name}.`,
                            c: `Letting go of any effort.`,
                            d: `Resting in this breath.`,
                        },
                    ];

                    const v = listenVariations[currentPartIndex % listenVariations.length];

                    if (timeInPhase < 5) {
                        return v.a;
                    } else if (timeInPhase < 12) {
                        return v.b;
                    } else if (timeInPhase < 18) {
                        return v.c;
                    } else {
                        return v.d;
                    }
                }

                case 'whole-body':
                    if (timeInPhase < 5) {
                        return 'Now, feel your presence... your entire body as one field of awareness.';
                    } else if (timeInPhase < 10) {
                        return 'Complete. Still.';
                    } else {
                        return 'Perfectly at peace.';
                    }

                case 'closing':
                    if (timeInPhase < 5) {
                        return 'Gently returning to the space around you.';
                    } else {
                        return 'Peace.';
                    }

                case 'paused':
                    return 'Meditation paused. Take your time, and resume when ready.';

                default:
                    return '';
            }
        }

        // Read Alone mode — original script
        switch (phase) {
            case 'idle':
                return 'A guided practice to bring awareness through your body, noticing subtle sensations and aliveness in each area.';

            case 'intro': {
                if (timeInPhase < 4) {
                    return `This meditation will last approximately ${totalMinutes} minutes. A gentle gong will sound at the end to bring you back to centre.`;
                } else if (timeInPhase < 8) {
                    return 'If you feel complete before the meditation ends, simply rest quietly until you hear the gong.';
                } else if (timeInPhase < 12) {
                    return 'Find a comfortable position\u2014sitting or lying down, whatever feels right for you. Let your gaze soften.';
                } else if (timeInPhase < 15) {
                    return 'Notice your breath... the natural rhythm of breathing. No need to change anything.';
                } else {
                    return 'As you settle, if it feels comfortable, you might allow your eyes to gently close.';
                }
            }

            case 'body-scan': {
                const currentPart = bodySequence[currentPartIndex];
                if (!currentPart) return '';

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
            }

            case 'whole-body':
                if (timeInPhase < 10) {
                    return 'Now, expand your awareness... let it include your whole body. Feel yourself as a complete presence.';
                } else {
                    return 'Notice the aliveness throughout\u2014a field of sensation, vibration, energy flowing through you.';
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
    }, [bodySequence, phase, timeInPhase, currentPartIndex, isListenMode]);

    // Update script history and handle auto-scroll
    useEffect(() => {
        const currentScript = getScript();
        if (currentScript && scriptHistory[scriptHistory.length - 1] !== currentScript) {
            setScriptHistory(prev => {
                const newHistory = [...prev, currentScript];
                // Keep only last 10 lines to prevent performance issues
                return newHistory.slice(-10);
            });
        }
    }, [getScript, scriptHistory]);

    // Auto-scroll to center of current text using transform
    useEffect(() => {
        if (containerRef.current && wrapperRef.current) {
            const containerHeight = containerRef.current.clientHeight;
            const lastChild = wrapperRef.current.lastElementChild as HTMLElement;

            if (lastChild) {
                const childOffsetTop = lastChild.offsetTop;
                const childHeight = lastChild.clientHeight;

                // Calculate target center position
                // We want: translateY = (containerHeight / 2) - (childOffsetTop + childHeight / 2)
                const targetY = (containerHeight / 2) - (childOffsetTop + childHeight / 2);
                setTranslateY(targetY);
            }
        }
    }, [scriptHistory]);

    // Phase progression logic
    useEffect(() => {
        if (isListenMode) return; // Audio is the source of truth in Listen mode

        const handleProgression = () => {
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
                triggerInteraction('meditation', 'complete');
                updateMascotStreak(true);
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.error("Error playing sound:", e));
                }
            }
        };

        // Wrap progression in a microtask to avoid "cascading renders" lint error
        const timeout = setTimeout(handleProgression, 0);
        return () => clearTimeout(timeout);
    }, [timeInPhase, phase, currentPartIndex, bodySequence.length, isListenMode]);



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
        if (isListenMode) return Math.floor(currentTime);
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
            padding: '2.5rem',
            gap: '2.5rem',
            maxWidth: '1000px',
            width: '95%',
            margin: '0 auto',
            minHeight: '600px'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                padding: '3rem',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                alignItems: 'center'
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

                {/* Meditation Script with Scrolling History */}
                <div
                    ref={containerRef}
                    style={{
                        height: '350px',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                    }}
                >
                    <div
                        ref={wrapperRef}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2.5rem',
                            padding: '175px 0',
                            width: '100%',
                            transform: `translate3d(0, ${translateY}px, 0)`,
                            transition: 'transform 1.8s cubic-bezier(0.2, 0, 0.2, 1)',
                            willChange: 'transform'
                        }}
                    >
                        {scriptHistory.map((text, index) => {
                            const isLast = index === scriptHistory.length - 1;
                            return (
                                <p
                                    key={`${index}-${text.substring(0, 10)}`}
                                    style={{
                                        fontSize: isLast ? '1.6rem' : '1.2rem',
                                        lineHeight: '1.8',
                                        color: isLast ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)',
                                        fontWeight: isLast ? 400 : 300,
                                        margin: 0,
                                        transition: 'all 1.5s ease-in-out',
                                        opacity: isLast ? 1 : 1, // Fixed opacity for the history, relying on gradients
                                        transform: isLast ? 'scale(1)' : 'scale(0.95)',
                                        filter: isLast ? 'none' : 'blur(0.5px)',
                                    }}
                                >
                                    {text}
                                </p>
                            );
                        })}
                    </div>
                </div>

                <style>{`
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    border-top-color: var(--primary-color);
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                @keyframes slideUpEnter {
                    0% {
                        transform: translateY(40px) scale(0.98);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    width: '100%',
                    marginTop: '1rem'
                }}>
                    {phase === 'idle' ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            width: '100%',
                            maxWidth: '600px'
                        }}>
                            {/* Read Alone Card */}
                            <div
                                onClick={startMeditation}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <Timer size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Read Alone</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Follow the script at your own pace.
                                    </p>
                                </div>
                                <button style={{
                                    background: 'transparent',
                                    border: '1px solid var(--primary-color)',
                                    color: 'var(--primary-color)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    marginTop: 'auto'
                                }}>Start Reading</button>
                            </div>

                            {/* Guided Audio Card */}
                            <div
                                onClick={!isGenerating ? startListenMode : undefined}
                                style={{
                                    background: 'rgba(255,107,107,0.05)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,107,107,0.2)',
                                    cursor: isGenerating ? 'wait' : 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => !isGenerating && (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
                                onMouseLeave={e => !isGenerating && (e.currentTarget.style.background = 'rgba(255,107,107,0.05)')}
                            >
                                {isGenerating && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        gap: '1rem'
                                    }}>
                                        <div className="spinner" />
                                        <span style={{ color: 'white', fontWeight: 600 }}>Creating Voice...</span>
                                    </div>
                                )}

                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'var(--primary-color)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Music size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Guided Audio</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Immersive AI voice with ambient soundscapes.
                                    </p>
                                </div>
                                {apiKeyMissing ? (
                                    <div style={{
                                        color: '#ff4d4d',
                                        fontSize: '0.8rem',
                                        background: 'rgba(255,77,77,0.1)',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        marginTop: 'auto'
                                    }}>
                                        API Key Missing in .env
                                    </div>
                                ) : (
                                    <button style={{
                                        background: 'var(--primary-color)',
                                        border: 'none',
                                        color: 'white',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '999px',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        marginTop: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Play size={16} />
                                        Listen Now
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    padding: '1rem',
                                    background: 'rgba(255, 77, 77, 0.1)',
                                    border: '1px solid rgba(255, 77, 77, 0.2)',
                                    borderRadius: '12px',
                                    color: '#ff4d4d',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginTop: '0.5rem'
                                }}>
                                    <span style={{ fontWeight: 600 }}>Error:</span> {error}
                                </div>
                            )}
                        </div>
                    ) : isListenMode ? (
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {/* Player Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                                <button
                                    onClick={restartAudio}
                                    style={iconButtonStyle}
                                    title="Restart"
                                >
                                    <RotateCcw size={22} />
                                </button>
                                <button
                                    onClick={isPlaying ? pauseAudio : () => voiceUrl && playAudio(voiceUrl)}
                                    style={{
                                        ...iconButtonStyle,
                                        background: 'var(--primary-color)',
                                        width: '60px',
                                        height: '60px'
                                    }}
                                >
                                    {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
                                </button>
                                <button
                                    onClick={resetMeditation}
                                    style={{ ...iconButtonStyle, color: '#ff4d4d' }}
                                    title="End Session"
                                >
                                    <RotateCcw size={22} style={{ transform: 'rotate(135deg)' }} />
                                </button>
                            </div>

                            {/* Volume and Toggles */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Voice Volume */}
                                <div style={volumeControlStyle}>
                                    <div style={volumeHeaderStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Volume2 size={16} />
                                            <span>Voice</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={voiceVolume}
                                        onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                                        className="audio-slider"
                                    />
                                </div>

                                {/* Ambient Volume */}
                                <div style={volumeControlStyle}>
                                    <div style={volumeHeaderStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Music size={16} />
                                            <span>Ambient</span>
                                        </div>
                                        <button
                                            onClick={toggleAmbient}
                                            style={{
                                                background: isAmbientEnabled ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.05)',
                                                color: isAmbientEnabled ? '#81c784' : 'var(--text-secondary)',
                                                border: 'none',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isAmbientEnabled ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.5"
                                        step="0.01"
                                        value={ambientVolume}
                                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                                        disabled={!isAmbientEnabled}
                                        className="audio-slider"
                                        style={{ opacity: isAmbientEnabled ? 1 : 0.4 }}
                                    />
                                </div>
                            </div>

                            {/* Time Info */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem'
                            }}>
                                <Timer size={14} />
                                <span>{formatTime(Math.floor(currentTime))}</span>
                                <span style={{ opacity: 0.5 }}>/</span>
                                <span>{formatTime(Math.floor(duration || 0))}</span>
                            </div>
                        </div>
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
        </div >
    );
};
export default BodyScanMeditation;
