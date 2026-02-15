import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHabitContext } from '../../../context/HabitContext';
import { Sun, Plus, Trash2, Play } from 'lucide-react';
import tibetanBellSound from '../../../assets/tibetan-bell.mp3';
import { useMascot } from '../../../context/MascotContext';
import type { Affirmation } from '../../../types';

type AffirmationPhase = 'theme-selection' | 'active' | 'paused' | 'completed' | 'manage-personal';
type AffirmationTheme = 'calm' | 'confidence' | 'healing' | 'clarity' | 'strength' | 'personal';

interface ThemeOption {
    id: AffirmationTheme;
    name: string;
    emoji: string;
    description: string;
    color: string;
}

const Affirmations: React.FC = () => {
    const location = useLocation();
    const { personalAffirmations, addPersonalAffirmation, deletePersonalAffirmation, habits } = useHabitContext();
    const { triggerInteraction, updateMascotStreak } = useMascot();
    const [phase, setPhase] = useState<AffirmationPhase>('theme-selection');
    const [selectedTheme, setSelectedTheme] = useState<AffirmationTheme | null>(null);
    const [affirmations, setAffirmations] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeInCurrent, setTimeInCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [newPersonalText, setNewPersonalText] = useState('');
    const [newPersonalTrigger, setNewPersonalTrigger] = useState('');
    const [newPersonalRepeats, setNewPersonalRepeats] = useState(3);
    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    const AFFIRMATION_DURATION = 10; // seconds per affirmation

    const themeOptions: ThemeOption[] = [
        {
            id: 'calm',
            name: 'Calm',
            emoji: '🌊',
            description: 'Find peace and tranquility',
            color: '#4A90E2'
        },
        {
            id: 'confidence',
            name: 'Confidence',
            emoji: '💪',
            description: 'Build self-assurance and courage',
            color: '#E94B3C'
        },
        {
            id: 'healing',
            name: 'Healing',
            emoji: '🌿',
            description: 'Nurture restoration and recovery',
            color: '#50C878'
        },
        {
            id: 'clarity',
            name: 'Clarity',
            emoji: '✨',
            description: 'Gain focus and understanding',
            color: '#FFD700'
        },
        {
            id: 'strength',
            name: 'Strength',
            emoji: '🦁',
            description: 'Cultivate resilience and power',
            color: '#9B59B6'
        },
        {
            id: 'personal',
            name: 'Personal',
            emoji: '👤',
            description: 'Your own custom affirmations',
            color: 'var(--primary-color)'
        }
    ];

    // Affirmation pools for each theme
    const affirmationPools = {
        calm: [
            "I am grounded in this moment and at peace with what is.",
            "I choose to respond with calm, not react with fear.",
            "I breathe deeply and release all tension from my body.",
            "Peace flows through me with every breath I take.",
            "I am centered, balanced, and completely at ease.",
            "Calmness is my natural state of being.",
            "I let go of what I cannot control and embrace serenity.",
            "My mind is quiet, my heart is peaceful.",
            "I am safe, I am calm, I am present.",
            "Tranquility surrounds me and fills me completely.",
            "I release anxiety and welcome peace into my life.",
            "Every breath brings me deeper into relaxation.",
            "I am still, I am calm, I am whole.",
            "Peace is my power, calm is my strength."
        ],
        confidence: [
            "I trust myself to make decisions that honor my well-being.",
            "I am worthy of confidence, compassion, and care.",
            "I believe in my abilities and trust my journey.",
            "I am capable of achieving anything I set my mind to.",
            "My confidence grows stronger every day.",
            "I trust my intuition and inner wisdom.",
            "I am enough exactly as I am right now.",
            "I speak my truth with courage and clarity.",
            "I deserve success and embrace my power.",
            "I am bold, brave, and becoming more confident.",
            "My voice matters and my presence is valuable.",
            "I step into my power with grace and certainty.",
            "I trust myself completely and act with confidence.",
            "I am worthy of all the good things coming my way."
        ],
        healing: [
            "I am healing, even in ways I cannot yet see.",
            "I allow my body and mind the time they need to restore.",
            "Every day, I am becoming healthier and stronger.",
            "I release what no longer serves me and welcome healing.",
            "My body knows how to heal, and I trust the process.",
            "I am gentle with myself as I heal and grow.",
            "Healing energy flows through every cell of my being.",
            "I forgive myself and others, freeing myself to heal.",
            "I am worthy of complete healing and restoration.",
            "Each breath brings healing light into my body.",
            "I honor my healing journey with patience and love.",
            "I am transforming pain into wisdom and strength.",
            "My past does not define me; I am healing and whole.",
            "I embrace the healing power within me."
        ],
        clarity: [
            "I see clearly what matters most and let go of the rest.",
            "I move through challenges with clarity and grace.",
            "My mind is clear, focused, and sharp.",
            "I trust my ability to see the truth in any situation.",
            "Clarity comes easily to me when I need it most.",
            "I release confusion and welcome clear understanding.",
            "I see my path forward with perfect clarity.",
            "My thoughts are organized and purposeful.",
            "I make decisions with clarity and confidence.",
            "I cut through complexity and see what is real.",
            "Mental clarity is my natural state of being.",
            "I focus on what truly matters and release the rest.",
            "I see situations clearly and respond wisely.",
            "Clarity illuminates my mind and guides my actions."
        ],
        strength: [
            "I carry strength within me, even when I feel uncertain.",
            "I am resilient, capable, and enough exactly as I am.",
            "I am stronger than any challenge I face.",
            "My strength comes from within and cannot be shaken.",
            "I rise above difficulties with courage and determination.",
            "I am powerful beyond measure.",
            "Every challenge makes me stronger and wiser.",
            "I have overcome so much, and I will overcome this too.",
            "My inner strength is limitless and unbreakable.",
            "I am a warrior, and I face life with courage.",
            "I draw on my inner reserves of strength and resilience.",
            "I am strong enough to handle whatever comes my way.",
            "My strength inspires others and empowers myself.",
            "I am rooted in strength and grounded in power."
        ]
    };

    // Initialize Web Audio API and load sound
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Load the Tibetan bell sound
        fetch(tibetanBellSound)
            .then(res => res.arrayBuffer())
            .then(data => ctx.decodeAudioData(data))
            .then(buffer => {
                audioBufferRef.current = buffer;
            })
            .catch(err => console.error("Error loading audio:", err));

        // Check for passed affirmation from goal
        if (location.state?.affirmation) {
            const passedAff = location.state.affirmation as Affirmation;
            startIndividualAffirmation(passedAff);
        }

        return () => {
            if (ctx) ctx.close();
        };
    }, [location.state]);

    const startIndividualAffirmation = (aff: Affirmation) => {
        const textToRepeat = aff.trigger ? `When I ${aff.trigger}, I will ${aff.text}` : aff.text;
        const repeatedLines = Array(aff.repeats).fill(textToRepeat);
        setAffirmations(repeatedLines);
        setPhase('active');
        setCurrentIndex(0);
        setTimeInCurrent(0);
        playPeacefulSound();
    };

    // Play peaceful bell sound
    const playPeacefulSound = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;

        const ctx = audioContextRef.current;
        const source = ctx.createBufferSource();
        source.buffer = audioBufferRef.current;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
    };

    // Generate 10 random affirmations from selected theme
    const generateAffirmations = (theme: AffirmationTheme) => {
        if (theme === 'personal') return [];
        const pool = affirmationPools[theme as keyof typeof affirmationPools];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 10);
    };

    const selectTheme = (theme: AffirmationTheme) => {
        setSelectedTheme(theme);
        if (theme === 'personal') {
            setPhase('manage-personal');
            return;
        }
        const generated = generateAffirmations(theme);
        setAffirmations(generated);
        setPhase('active');
        setCurrentIndex(0);
        setTimeInCurrent(0);
        playPeacefulSound();
    };

    const startPersonalSession = () => {
        // Aggregate personal affirmations and habit-specific affirmations
        const habitAffirmations = (habits || []).flatMap(h =>
            (h.affirmations || []).map(aff => ({ ...aff, trigger: aff.trigger || h.cue }))
        );

        const allAffirmations = [...personalAffirmations, ...habitAffirmations];
        if (allAffirmations.length === 0) return;

        // Combine all affirmations into a sequence
        const fullSequence: string[] = [];
        allAffirmations.forEach(aff => {
            const textToRepeat = aff.trigger ? `When I ${aff.trigger}, I will ${aff.text}` : aff.text;
            for (let i = 0; i < aff.repeats; i++) {
                fullSequence.push(textToRepeat);
            }
        });

        setAffirmations(fullSequence);
        setPhase('active');
        setCurrentIndex(0);
        setTimeInCurrent(0);
        playPeacefulSound();
    };

    // Timer logic
    useEffect(() => {
        if (phase !== 'active') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = window.setInterval(() => {
            setTimeInCurrent(prev => {
                if (prev >= AFFIRMATION_DURATION - 1) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setCurrentIndex(prevIndex => {
                            const nextIndex = prevIndex + 1;
                            if (nextIndex >= affirmations.length) {
                                setPhase('completed');
                                triggerInteraction('affirmation', 'complete');
                                updateMascotStreak(true);
                                return prevIndex;
                            }
                            return nextIndex;
                        });
                        playPeacefulSound();
                        setIsTransitioning(false);
                    }, 500);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [phase, affirmations.length]);

    const pauseAffirmations = () => {
        setPhase('paused');
    };

    const resumeAffirmations = () => {
        setPhase('active');
    };

    const resetToThemeSelection = () => {
        setPhase('theme-selection');
        setSelectedTheme(null);
        setAffirmations([]);
        setCurrentIndex(0);
        setTimeInCurrent(0);
    };

    const getProgress = (): number => {
        if (phase === 'theme-selection') return 0;
        if (phase === 'completed') return 100;
        const totalCompleted = currentIndex;
        const currentProgress = timeInCurrent / AFFIRMATION_DURATION;
        return ((totalCompleted + currentProgress) / affirmations.length) * 100;
    };

    // Theme Selection Screen
    if (phase === 'theme-selection') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '2rem',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Choose Your Focus
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.75rem' }}>
                        Select a theme for your affirmations today
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.5' }}>
                        Repeat each affirmation in your head. Feel it. Love yourself.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    {themeOptions.map(theme => (
                        <div
                            key={theme.id}
                            onClick={() => selectTheme(theme.id)}
                            style={{
                                background: 'var(--card-bg)',
                                padding: '2rem 1.5rem',
                                borderRadius: '16px',
                                boxShadow: 'var(--shadow-md)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid rgba(255,255,255,0.1)',
                                textAlign: 'center',
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
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
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                                {theme.emoji}
                            </div>
                            <h3 style={{
                                fontSize: '1.3rem',
                                fontWeight: 600,
                                marginBottom: '0.5rem',
                                color: theme.color
                            }}>
                                {theme.name}
                            </h3>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {theme.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', width: '100%', maxWidth: '500px' }}>
                    <button
                        onClick={() => setPhase('manage-personal')}
                        className="btn-premium btn-premium-secondary"
                        style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <Sun size={20} /> Manage Personal Affirmations
                    </button>
                </div>
            </div>
        );
    }

    // Manage Personal Affirmations
    if (phase === 'manage-personal') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Personal Affirmations</h2>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="I am worthy and capable..."
                            value={newPersonalText}
                            onChange={e => setNewPersonalText(e.target.value)}
                            className="form-input"
                            style={{ padding: '1rem' }}
                        />
                        <input
                            type="text"
                            placeholder="Trigger: When I... (optional)"
                            value={newPersonalTrigger}
                            onChange={e => setNewPersonalTrigger(e.target.value)}
                            className="form-input"
                            style={{ padding: '1rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Repeats: {newPersonalRepeats}</label>
                            <input
                                type="range"
                                min="3"
                                max="12"
                                value={newPersonalRepeats}
                                onChange={e => setNewPersonalRepeats(parseInt(e.target.value))}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (newPersonalText.trim()) {
                                    addPersonalAffirmation(newPersonalText.trim(), newPersonalRepeats, newPersonalTrigger.trim() || undefined);
                                    setNewPersonalText('');
                                    setNewPersonalTrigger('');
                                }
                            }}
                            className="btn-premium btn-premium-primary"
                            style={{ padding: '0.8rem' }}
                        >
                            <Plus size={18} /> Add Affirmation
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {personalAffirmations.map(aff => (
                            <div key={aff.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{aff.text}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {aff.trigger ? `When ${aff.trigger}` : 'No trigger'} • {aff.repeats} repeats
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => startIndividualAffirmation(aff)}
                                        style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Start session with this affirmation"
                                    >
                                        <Play size={18} />
                                    </button>
                                    <button onClick={() => deletePersonalAffirmation(aff.id)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <button onClick={resetToThemeSelection} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem' }}>Back</button>
                    <button onClick={startPersonalSession} disabled={personalAffirmations.length === 0} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1rem' }}>Start Session</button>
                </div>
            </div>
        );
    }

    // Completed Screen
    if (phase === 'completed') {
        const selectedThemeOption = themeOptions.find(t => t.id === selectedTheme);
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                gap: '2rem',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem' }}>
                    {selectedThemeOption?.emoji}
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>
                    Session Complete
                </h2>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    maxWidth: '500px'
                }}>
                    You've completed your {selectedThemeOption?.name.toLowerCase()} affirmations.
                    Take a moment to notice how you feel.
                </p>
                <button
                    onClick={resetToThemeSelection}
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
                    Choose Another Theme
                </button>
            </div>
        );
    }

    // Active/Paused Affirmation Display
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '2rem',
            maxWidth: '700px',
            margin: '0 auto',
            height: '100%'
        }}>
            {/* Progress Bar */}
            <div style={{ width: '100%', marginBottom: '1rem' }}>
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
                    {currentIndex + 1} of {affirmations.length}
                </p>
            </div>

            {/* Scrolling Affirmation Display */}
            <div style={{
                height: '350px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)'
            }}>
                <div style={{
                    transform: `translateY(${115 - (currentIndex * 120)}px)`,
                    transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'absolute',
                    top: 0,
                    width: '100%'
                }}>
                    {affirmations.map((text, index) => {
                        const isFocused = index === currentIndex;
                        const distance = Math.abs(index - currentIndex);

                        return (
                            <div
                                key={index}
                                style={{
                                    height: '120px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    padding: '0 1rem',
                                    opacity: isFocused ? 1 : Math.max(0, 0.3 - (distance - 1) * 0.1),
                                    transform: `scale(${isFocused ? 1 : 0.85})`,
                                    transition: 'opacity 1.5s ease, transform 1.5s ease',
                                    maxWidth: '600px',
                                    filter: isFocused ? 'none' : 'blur(1px)'
                                }}
                            >
                                <p style={{
                                    fontSize: isFocused ? '1.8rem' : '1.4rem',
                                    lineHeight: '1.6',
                                    color: 'var(--text-primary)',
                                    fontWeight: isFocused ? 400 : 300,
                                    margin: 0
                                }}>
                                    {text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Breathing Indicator and Instructional Text */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {phase === 'active' && !isTransitioning && (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary-color)',
                        opacity: 0.15,
                        animation: 'gentlePulse 4s ease-in-out infinite'
                    }} />
                )}

                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    opacity: 0.7
                }}>
                    Repeat in your head. Feel it. Love yourself.
                </p>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                <button
                    onClick={phase === 'paused' ? resumeAffirmations : pauseAffirmations}
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
                    onClick={resetToThemeSelection}
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
                    Change Theme
                </button>
            </div>

            <style>{`
                @keyframes gentlePulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.2;
                    }
                    50% { 
                        transform: scale(1.3);
                        opacity: 0.3;
                    }
                }
            `}</style>
        </div>
    );
};

export default Affirmations;
