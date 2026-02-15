import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Wind, Cloud, Heart, Flame, Layers, Sparkles, Moon, Eye, Users, Smartphone, Star } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

interface TipCategory {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    tips: string[];
    specialNote?: string;
    isSpecial?: boolean;
}

const categories: TipCategory[] = [
    {
        id: 'doom-scrolling',
        title: 'Doom Scrolling',
        icon: <Smartphone size={24} />,
        description: 'Hey — let\'s break this loop together.',
        isSpecial: true,
        tips: [
            'Try putting your phone face-down for just three breaths. See how you feel after.',
            'Ask yourself: "Am I learning, or am I just looping?" If it\'s looping, you can stop.',
            'Pick something with an ending — one article, one song. Give your brain a finish line.',
            'Look up and find the farthest point you can see. Let your eyes rest there for a bit.',
            'What if you deleted the app for just 24 hours? You might be surprised what fills that space.',
            'Text someone real instead. Turn that urge to scroll into a moment of connection.',
            'Try leaving your phone in another room and doing something with your hands.',
            'Tell yourself: "I\'ll scroll after I eat / walk / shower." Your body gets to go first.'
        ],
        specialNote: "Hey — the fact that you noticed you were scrolling? That's already the first step out."
    },
    {
        id: 'stress',
        title: 'Stress',
        icon: <Wind size={24} />,
        description: 'Let\'s slow things down a notch.',
        tips: [
            'Go for a quick walk outside — even five minutes can reset everything.',
            'Put one hand on your chest, one on your belly. Breathe slowly into your hands.',
            'Try this: name 5 things you see, 4 you hear, 3 you can touch. It brings you back.',
            'Check your shoulders right now — you\'re probably holding them up. Let them drop.'
        ]
    },
    {
        id: 'anxiety',
        title: 'Anxiety',
        icon: <Cloud size={24} />,
        description: 'Let\'s get you grounded.',
        tips: [
            'Write down what\'s worrying you, then fold the paper up and put it away. Seriously — try it.',
            'Ask yourself: "What do I actually know right now?" Stay with what\'s real.',
            'Press your feet firmly into the floor. Feel how the ground is holding you up.',
            'Try breathing in for 4, hold for 4, out for 6. Keep going until you feel yourself soften.'
        ]
    },
    {
        id: 'sadness',
        title: 'Sadness',
        icon: <Heart size={24} />,
        description: 'It\'s okay to feel this.',
        tips: [
            'You don\'t have to fix this feeling. Let it be here — tears are a kind of release.',
            'Wrap yourself in something cozy — a blanket, your favourite sweater, some gentle music.',
            'Reach out to someone you trust. You don\'t need to explain anything — just connect.',
            'Move your body gently. Stretch, sway, curl up — whatever feels right.'
        ]
    },
    {
        id: 'anger',
        title: 'Anger',
        icon: <Flame size={24} />,
        description: 'Let\'s move this energy somewhere.',
        tips: [
            'Your body wants to move — walk fast, shake your arms out, or dance it off.',
            'Write down everything you want to say, no filter. You can decide later what to share.',
            'Try splashing cold water on your face or holding something cold. It resets your nervous system.',
            'It\'s okay to say "I need a moment." That\'s a complete sentence — use it.'
        ]
    },
    {
        id: 'overwhelm',
        title: 'Overwhelm',
        icon: <Layers size={24} />,
        description: 'You don\'t have to do it all right now.',
        tips: [
            'Just pick the tiniest next step. Do that one thing, then pause. That\'s enough.',
            'Take three slow breaths. Everything can wait that long — really.',
            'Ask yourself: "What matters most right now?" Let everything else blur for a minute.',
            'Picture yourself placing each task on a shelf. You\'ll come back to them — but not all at once.'
        ]
    },
    {
        id: 'joy',
        title: 'Joy',
        icon: <Sparkles size={24} />,
        description: 'Don\'t rush past this one.',
        tips: [
            'Pause and really notice what you\'re feeling. Joy gets bigger when you pay attention to it.',
            'Share this with someone who\'ll be happy for you. It doubles when you do.',
            'Capture it somehow — a photo, a quick note, a quiet "thank you" to yourself.',
            'Let yourself be fully here with this. Good feelings matter just as much as hard ones.'
        ]
    },
    {
        id: 'restlessness',
        title: 'Restlessness',
        icon: <Moon size={24} />,
        description: 'Let\'s give that energy somewhere to go.',
        tips: [
            'Grab a pen and just write — no goal, no purpose. Let it wander.',
            'Switch up your environment, even a little. Different room, different light, some fresh air.',
            'Do something with your hands — doodle, tidy a space, make something.',
            'Check in with your body: does it want movement? Stillness? Food? Listen to it.'
        ]
    },
    {
        id: 'fog',
        title: 'Mental Fog',
        icon: <Eye size={24} />,
        description: 'Let\'s clear some space in your head.',
        tips: [
            'Step away from the screen and look at something far away for 20 seconds. Your eyes need it.',
            'Drink some cold water slowly — you\'d be amazed how much it wakes you up.',
            'Do something completely different for 10 minutes. Your brain needs a scene change.',
            'Sometimes the fog is your body asking for rest. That\'s okay — listen to it.'
        ]
    },
    {
        id: 'loneliness',
        title: 'Loneliness',
        icon: <Users size={24} />,
        description: 'You\'re less alone than it feels right now.',
        tips: [
            'Send someone a quick message — even just "hey, thinking of you." It counts.',
            'Go somewhere people are — a café, a park, a shop. You don\'t have to talk, just be near.',
            'Put your hand on your heart. You\'re here, with you. That\'s real.',
            'Make something to share later — a playlist, a recipe, a photo. Connection doesn\'t have to be instant.'
        ]
    }
];

const MindfulMoments: React.FC = () => {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [favouriteIds, setFavouriteIds] = useLocalStorage<string[]>('mindful-moments-favourites', []);

    const toggleCategory = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleFavourite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavouriteIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const sortedCategories = useMemo(() => {
        const favs = categories.filter(c => favouriteIds.includes(c.id));
        const rest = categories.filter(c => !favouriteIds.includes(c.id));
        // Preserve the order favourites were added
        favs.sort((a, b) => favouriteIds.indexOf(a.id) - favouriteIds.indexOf(b.id));
        return [...favs, ...rest];
    }, [favouriteIds]);

    return (
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                    Mindful Moments
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                    Pick what you're feeling. I've got a few ideas for you.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sortedCategories.map((category) => {
                    const isFavourited = favouriteIds.includes(category.id);
                    return (
                        <div
                            key={category.id}
                            className="glass-panel"
                            style={{
                                overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: isFavourited
                                    ? '1px solid rgba(255, 193, 7, 0.4)'
                                    : category.isSpecial
                                        ? '1px solid rgba(255, 255, 255, 0.4)'
                                        : '1px solid var(--border-color)',
                                boxShadow: isFavourited
                                    ? '0 4px 20px -4px rgba(255, 193, 7, 0.15), var(--shadow-md)'
                                    : category.isSpecial
                                        ? '0 10px 30px -5px rgba(255, 255, 255, 0.1), var(--shadow-lg)'
                                        : 'var(--shadow-md)',
                                background: category.isSpecial
                                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)'
                                    : 'var(--glass-bg)',
                                borderLeft: isFavourited ? '3px solid rgba(255, 193, 7, 0.7)' : undefined
                            }}
                        >
                            <button
                                onClick={() => toggleCategory(category.id)}
                                style={{
                                    width: '100%',
                                    padding: '1.5rem 2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: category.isSpecial
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            marginBottom: '0.25rem',
                                            letterSpacing: category.isSpecial ? '0.02em' : 'normal'
                                        }}>
                                            {category.title}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)',
                                            opacity: 0.8
                                        }}>
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button
                                        onClick={(e) => toggleFavourite(e, category.id)}
                                        aria-label={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '6px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.25s ease',
                                            color: isFavourited ? 'rgba(255, 193, 7, 1)' : 'var(--text-secondary)',
                                            opacity: isFavourited ? 1 : 0.5,
                                            transform: isFavourited ? 'scale(1.15)' : 'scale(1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.opacity = isFavourited ? '1' : '0.5';
                                            (e.currentTarget as HTMLButtonElement).style.transform = isFavourited ? 'scale(1.15)' : 'scale(1)';
                                        }}
                                    >
                                        <Star size={20} fill={isFavourited ? 'rgba(255, 193, 7, 1)' : 'none'} />
                                    </button>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {expandedIds.includes(category.id) ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                    </div>
                                </div>
                            </button>

                            <div style={{
                                maxHeight: expandedIds.includes(category.id) ? '1000px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ padding: '0 2rem 1.5rem 6rem' }}>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {category.tips.map((tip, index) => {
                                            const firstDot = tip.indexOf('.');
                                            const boldPart = firstDot > 0 ? tip.slice(0, firstDot + 1) : null;
                                            const rest = firstDot > 0 ? tip.slice(firstDot + 1) : tip;
                                            return (
                                                <li
                                                    key={index}
                                                    style={{
                                                        padding: '0.85rem 0',
                                                        borderTop: index === 0 ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                                                        color: 'var(--text-primary)',
                                                        lineHeight: '1.7',
                                                        fontSize: '1.05rem',
                                                        letterSpacing: '0.01em'
                                                    }}
                                                >
                                                    <span style={{ marginRight: '0.6rem', color: 'var(--primary-text)', fontWeight: 700, fontSize: '1.1rem' }}>•</span>
                                                    {boldPart ? (
                                                        <><strong style={{ fontWeight: 600 }}>{boldPart}</strong>{rest}</>
                                                    ) : (
                                                        <strong style={{ fontWeight: 600 }}>{tip}</strong>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {category.specialNote && (
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            background: 'rgba(0, 0, 0, 0.03)',
                                            borderLeft: '3px solid var(--primary-text)',
                                            fontStyle: 'italic',
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.6',
                                            fontSize: '1rem',
                                            fontWeight: 500
                                        }}>
                                            {category.specialNote}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MindfulMoments;
