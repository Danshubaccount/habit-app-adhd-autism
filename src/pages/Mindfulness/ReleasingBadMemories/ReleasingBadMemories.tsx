import React, { useState, useEffect, useRef } from 'react';
import tibetanBellSound from '../../../assets/tibetan-bell.mp3';
import { useMascot } from '../../../context/MascotContext';
import { ElevenLabsService } from '../../../services/elevenlabs';
import { useMeditationAudio } from '../../../hooks/useMeditationAudio';
import { Play, Timer } from 'lucide-react';

type MeditationPhase = 'idle' | 'meditation' | 'paused' | 'video';

const REPLAY_STORAGE_KEY = 'releasing-memories-replay-count';
const VIDEO_RESTART_DELAY_MS = 900;
const meditationPaceOptions = [1, 1.5, 2] as const;
const affirmationMessages = [
    'See yourself gently placing each released memory into the fire - and watch it transform into light.',
    'Each memory you release becomes light. You are lighter now.',
    'Release. Transform. Rise.'
] as const;

const getReplayCounterPrefix = (replayCount: number): string | null => {
    if (replayCount <= 0) return null;
    if (replayCount === 1) return 'You have chosen to release again';
    if (replayCount === 2) return 'You are practicing release';
    return 'Each repetition strengthens your healing';
};

interface AffirmationOverlayProps {
    isVisible: boolean;
    message: string;
    replayCount: number;
}

const AffirmationOverlay: React.FC<AffirmationOverlayProps> = ({ isVisible, message, replayCount }) => {
    const replayCounterPrefix = getReplayCounterPrefix(replayCount);

    return (
        <div className={`rmb-affirmation-overlay ${isVisible ? 'is-visible' : ''}`} aria-live="polite">
            <div className="rmb-affirmation-overlay-inner">
                <p className="rmb-affirmation-message">{message}</p>
                {replayCounterPrefix && (
                    <p className="rmb-replay-counter">
                        {replayCounterPrefix} -{' '}
                        <span key={replayCount} className="rmb-replay-count-number">
                            {replayCount}
                        </span>{' '}
                        {replayCount === 1 ? 'time.' : 'times.'}
                    </p>
                )}
            </div>
        </div>
    );
};

const scriptBlocks = [
    { text: "Take a slow breath in...\nAnd gently close your eyes.", duration: 8 },
    { text: "Imagine yourself sitting quietly in a peaceful forest at twilight.\nThe air is soft. The world is still.", duration: 10 },
    { text: "With calm awareness, bring to mind a memory that feels heavy ---\na thought you no longer need to carry.", duration: 10 },
    { text: "Without judgment... simply notice it.", duration: 6 },
    { text: "Now imagine reaching up gently...\nand lifting that memory from your mind.", duration: 8 },
    { text: "See it as a dark, smoky fragment resting in your hands.", duration: 7 },
    { text: "In front of you, a warm fire glows softly.", duration: 6 },
    { text: "When you're ready...\nplace the memory into the flames.", duration: 8 },
    { text: "Watch as it transforms ---\ndarkness dissolving into golden light...\nrising upward... gone.", duration: 12 },
    { text: "Feel your chest grow lighter.\nYour breath deepens.\nYour shoulders soften.", duration: 10 },
    { text: "You are not your past.\nYou are free to release.", duration: 8 },
    { text: "Take one final slow breath...\nand open your eyes.", duration: 8 }
];

const totalMeditationDuration = scriptBlocks.reduce((acc, curr) => acc + curr.duration, 0);

const ReleasingBadMemories: React.FC = () => {
    const [phase, setPhase] = useState<MeditationPhase>('idle');
    const [timeInPhase, setTimeInPhase] = useState(0);
    const [scriptHistory, setScriptHistory] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [translateY, setTranslateY] = useState(0);
    const timerRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pausedTimeRef = useRef(0);
    const [isListenMode, setIsListenMode] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const replayTimeoutRef = useRef<number | null>(null);
    const [isVideoReplayTransition, setIsVideoReplayTransition] = useState(false);
    const [affirmationIndex, setAffirmationIndex] = useState(0);
    const [meditationSpeed, setMeditationSpeed] = useState(1);
    const [replayCount, setReplayCount] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const storedCount = window.localStorage.getItem(REPLAY_STORAGE_KEY);
        const parsedCount = Number.parseInt(storedCount ?? '', 10);
        return Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : 0;
    });

    const OCEAN_WAVES_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-beach-waves-loop-1196.mp3';

    const {
        isPlaying,
        currentTime,
        duration,
        play: playAudio,
        pause: pauseAudio,
        setPlaybackRate,
    } = useMeditationAudio(OCEAN_WAVES_URL);

    useEffect(() => {
        audioRef.current = new Audio(tibetanBellSound);
    }, []);

    const { triggerInteraction, updateMascotStreak } = useMascot();

    const startMeditation = () => {
        setPhase('meditation');
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
            setError("ElevenLabs API Key is missing in .env");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setTimeInPhase(0);
        triggerInteraction('meditation', 'start');

        // Create script with explicit long pauses between lines
        const dynamicContent = scriptBlocks.map(block => block.text + "\n...\n...\n...\n").join('\n');
        const fullScript = ElevenLabsService.prepareFullScript(dynamicContent);

        try {
            const url = await ElevenLabsService.textToSpeech(fullScript);
            setIsListenMode(true);
            setPhase('meditation');
            playAudio(url);
            setError(null);
        } catch (err: any) {
            console.error("Failed to generate voice:", err);
            setError(err.message || "Failed to generate audio.");
            setIsListenMode(false);
            setPhase('idle');
        } finally {
            setIsGenerating(false);
        }
    };

    const resetMeditation = () => {
        if (replayTimeoutRef.current) {
            clearTimeout(replayTimeoutRef.current);
            replayTimeoutRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
        setPhase('idle');
        setTimeInPhase(0);
        setScriptHistory(['A guided journey to release bad memories and let go of the past.']);
        pausedTimeRef.current = 0;
        setIsListenMode(false);
        setIsVideoReplayTransition(false);
        setAffirmationIndex(0);
        pauseAudio();
    };

    const finishMeditation = () => {
        setPhase('video');
        triggerInteraction('meditation', 'complete');
        updateMascotStreak(true);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    // Progression mechanics based on time
    useEffect(() => {
        if (!isListenMode || !isPlaying) return;

        // In listen mode, map the ElevenLabs audio time to the script blocks relative to completion.
        // It's usually easier to just let standard timeInPhase map similarly, but normalized to ElevenLabs duration
        if (duration > 0 && currentTime > 0) {
            const progressRatio = currentTime / duration;
            const mappedTime = Math.floor(progressRatio * totalMeditationDuration);
            setTimeInPhase(mappedTime);

            if (currentTime >= duration - 1) {
                finishMeditation();
            }
        }
    }, [currentTime, duration, isListenMode, isPlaying]);

    // Timer logic for manual Reading mode
    useEffect(() => {
        if (phase === 'idle' || phase === 'paused' || phase === 'video' || isListenMode) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeInPhase(prev => {
                const nextTime = prev + (meditationSpeed * 0.25);
                if (nextTime >= totalMeditationDuration) {
                    finishMeditation();
                    return totalMeditationDuration;
                }
                return nextTime;
            });
        }, 250);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [phase, isListenMode, meditationSpeed]);

    const getScript = React.useCallback((): string => {
        if (phase === 'idle') return 'A guided journey to release what no longer serves you.';
        if (phase === 'paused') return 'Meditation paused. Take your time, and resume when ready.';
        if (phase === 'video') return 'Peace.';

        let elapsed = 0;
        for (let i = 0; i < scriptBlocks.length; i++) {
            if (timeInPhase >= elapsed && timeInPhase < elapsed + scriptBlocks[i].duration) {
                return scriptBlocks[i].text;
            }
            elapsed += scriptBlocks[i].duration;
        }

        return scriptBlocks[scriptBlocks.length - 1].text;
    }, [phase, timeInPhase]);

    // Update script history and handle auto-scroll
    useEffect(() => {
        const currentScript = getScript();
        if (currentScript && scriptHistory[scriptHistory.length - 1] !== currentScript) {
            setScriptHistory(prev => {
                const newHistory = [...prev, currentScript];
                return newHistory.slice(-10);
            });
        }
    }, [getScript, scriptHistory]);

    // Auto-scroll logic
    useEffect(() => {
        if (containerRef.current && wrapperRef.current && phase !== 'video') {
            const containerHeight = containerRef.current.clientHeight;
            const lastChild = wrapperRef.current.lastElementChild as HTMLElement;

            if (lastChild) {
                const childOffsetTop = lastChild.offsetTop;
                const childHeight = lastChild.clientHeight;
                const targetY = (containerHeight / 2) - (childOffsetTop + childHeight / 2);
                setTranslateY(targetY);
            }
        }
    }, [scriptHistory, phase]);

    // Wait until video phase to explicitly play it (in some browsers standard autoPlay works when muted but programmatic play is safer)
    useEffect(() => {
        if (phase === 'video' && videoRef.current) {
            setIsVideoReplayTransition(false);
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.error("Video playback failed:", e));
        }
    }, [phase]);

    useEffect(() => {
        setPlaybackRate(meditationSpeed);
    }, [meditationSpeed, setPlaybackRate]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(REPLAY_STORAGE_KEY, String(replayCount));
        }
    }, [replayCount]);

    useEffect(() => {
        return () => {
            if (replayTimeoutRef.current) {
                clearTimeout(replayTimeoutRef.current);
            }
        };
    }, []);

    const handleVideoEnded = () => {
        setIsVideoReplayTransition(true);
        if (replayTimeoutRef.current) {
            clearTimeout(replayTimeoutRef.current);
            replayTimeoutRef.current = null;
        }

        replayTimeoutRef.current = window.setTimeout(() => {
            setReplayCount(previous => previous + 1);
            setAffirmationIndex(previous => (previous + 1) % affirmationMessages.length);

            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(e => console.error("Video replay failed:", e));
            }
            setIsVideoReplayTransition(false);
        }, VIDEO_RESTART_DELAY_MS);
    };

    const activeAffirmationMessage = affirmationMessages[affirmationIndex];
    const isAffirmationVisible = phase === 'video' && !isVideoReplayTransition;


    const getProgress = (): number => {
        if (phase === 'idle') return 0;
        if (phase === 'video') return 100;
        return Math.min(100, (timeInPhase / totalMeditationDuration) * 100);
    };

    const formatTime = (seconds: number): string => {
        const roundedSeconds = Math.max(0, Math.floor(seconds));
        const mins = Math.floor(roundedSeconds / 60);
        const secs = roundedSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(1rem, 3vw, 2.5rem)',
            gap: '2.5rem',
            maxWidth: '1000px',
            width: '95%',
            margin: '0 auto',
            minHeight: '600px',
            position: 'relative'
        }}>

            <div
                className="glass-panel"
                style={{
                    width: '100%',
                    padding: 'clamp(1.5rem, 5vw, 3rem)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    alignItems: 'center',
                    opacity: phase === 'video' ? 0 : 1,
                    transition: 'opacity 3s ease-in-out',
                    pointerEvents: phase === 'video' ? 'none' : 'auto',
                    zIndex: 1
                }}
            >
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
                            {formatTime(timeInPhase)}
                        </p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem', width: '100%' }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' }}>
                        Session pace
                    </p>
                    <div style={{
                        display: 'inline-flex',
                        gap: '0.4rem',
                        padding: '0.3rem',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.14)'
                    }}>
                        {meditationPaceOptions.map((pace) => {
                            const isSelected = pace === meditationSpeed;
                            return (
                                <button
                                    key={pace}
                                    onClick={() => setMeditationSpeed(pace)}
                                    style={{
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '0.45rem 0.85rem',
                                        fontSize: '0.82rem',
                                        background: isSelected ? 'rgba(var(--primary-color-rgb), 0.9)' : 'transparent',
                                        color: isSelected ? '#111' : 'rgba(255,255,255,0.88)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {pace}x
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Text Scrolling UI */}
                <div
                    ref={containerRef}
                    style={{
                        height: 'clamp(250px, 50vh, 350px)',
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
                            const lines = text.split('\n');
                            return (
                                <div
                                    key={`${index}-${text.substring(0, 10)}`}
                                    style={{
                                        transition: 'all 1.5s ease-in-out',
                                        opacity: isLast ? 1 : 1,
                                        transform: isLast ? 'scale(1)' : 'scale(0.95)',
                                        filter: isLast ? 'none' : 'blur(0.5px)',
                                    }}
                                >
                                    {lines.map((line, lIndex) => (
                                        <p key={lIndex} style={{
                                            fontSize: isLast ? 'clamp(1.2rem, 5vw, 1.6rem)' : 'clamp(1rem, 4vw, 1.2rem)',
                                            lineHeight: '1.8',
                                            color: isLast ? 'var(--text-primary)' : 'rgba(255,255,255,0.2)',
                                            fontWeight: isLast ? 400 : 300,
                                            margin: 0,
                                        }}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

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
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                                    fontWeight: 500,
                                    marginTop: 'auto',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'var(--primary-color)';
                                        e.currentTarget.style.color = 'black';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--primary-color)';
                                    }}
                                >
                                    Start Reading
                                </button>
                            </div>

                            {/* Listen Card */}
                            <div
                                onClick={!isGenerating ? startListenMode : undefined}
                                style={{
                                    background: 'rgba(var(--primary-color-rgb), 0.1)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--primary-color)',
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
                                onMouseEnter={e => {
                                    if (!isGenerating) e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    if (!isGenerating) e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(var(--primary-color-rgb), 0.2)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary-color)'
                                }}>
                                    {isGenerating ? <div className="spinner" /> : <Play size={24} fill="currentColor" />}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Listen</h3>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {isGenerating ? 'Generating meditation...' : 'Close your eyes and follow the voice.'}
                                    </p>
                                </div>
                                <button style={{
                                    background: 'var(--primary-color)',
                                    border: 'none',
                                    color: 'black',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    marginTop: 'auto',
                                    cursor: isGenerating ? 'wait' : 'pointer',
                                    opacity: isGenerating ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}>
                                    {isGenerating ? 'Please wait...' : 'Start Listening'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <button
                                onClick={resetMeditation}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                End Session
                            </button>
                        </div>
                    )}

                    {error && (
                        <p style={{ color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {/* Cinematic Video Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                opacity: phase === 'video' ? 1 : 0,
                pointerEvents: phase === 'video' ? 'auto' : 'none',
                transition: 'opacity 3s ease-in-out',
                zIndex: phase === 'video' ? 1000 : -1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <video
                    ref={videoRef}
                    src="/videos/releasing-bad-memories.mp4"
                    muted // Highly recommended to avoid browser autoplay blocking
                    playsInline
                    onEnded={handleVideoEnded}
                    onPlay={() => setIsVideoReplayTransition(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
                <AffirmationOverlay
                    isVisible={isAffirmationVisible}
                    message={activeAffirmationMessage}
                    replayCount={replayCount}
                />
                {phase === 'video' && (
                    <button
                        onClick={resetMeditation}
                        style={{
                            position: 'absolute',
                            bottom: '40px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '24px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            backdropFilter: 'blur(5px)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        Return
                    </button>
                )}
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
                .rmb-affirmation-overlay {
                    position: absolute;
                    top: clamp(1.25rem, 10vh, 7rem);
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    width: min(92vw, 700px);
                    padding: 0 1rem;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 1.2s ease, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
                    z-index: 2;
                }
                .rmb-affirmation-overlay.is-visible {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                .rmb-affirmation-overlay-inner {
                    border-radius: 24px;
                    padding: clamp(0.8rem, 2.2vw, 1.35rem) clamp(0.95rem, 3vw, 1.8rem);
                    text-align: center;
                    background: linear-gradient(140deg, rgba(253, 248, 239, 0.2), rgba(245, 236, 223, 0.12));
                    border: 1px solid rgba(255, 245, 231, 0.26);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    animation: affirmationFloat 7s ease-in-out infinite;
                }
                .rmb-affirmation-message {
                    margin: 0;
                    color: rgba(255, 251, 244, 0.96);
                    font-size: clamp(1rem, 2.4vw, 1.35rem);
                    line-height: 1.6;
                    letter-spacing: 0.01em;
                    text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
                }
                .rmb-replay-counter {
                    margin: 0.65rem 0 0;
                    color: rgba(250, 240, 230, 0.9);
                    font-size: clamp(0.82rem, 2vw, 0.98rem);
                    line-height: 1.45;
                    text-shadow: 0 1px 12px rgba(0, 0, 0, 0.3);
                }
                .rmb-replay-count-number {
                    display: inline-block;
                    min-width: 1.1ch;
                    font-weight: 600;
                    animation: replayCountPulse 0.65s ease-out;
                }
                @keyframes affirmationFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes replayCountPulse {
                    0% { opacity: 0; transform: translateY(3px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 640px) {
                    .rmb-affirmation-overlay {
                        top: clamp(0.8rem, 7vh, 3rem);
                    }
                    .rmb-affirmation-overlay-inner {
                        border-radius: 20px;
                    }
                    .rmb-affirmation-message {
                        line-height: 1.5;
                    }
                    .rmb-replay-counter {
                        margin-top: 0.55rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ReleasingBadMemories;
