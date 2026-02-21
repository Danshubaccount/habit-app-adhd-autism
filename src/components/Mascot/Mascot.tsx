import { useMascot } from '../../context/MascotContext';
import type { MascotType } from '../../types';
import './Mascot.css';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

interface MascotProps {
    size?: number | string;
    className?: string;
    type?: MascotType;
    color?: string;
    outfit?: string;
    currentEmotion?: 'happy' | 'calm' | 'proud' | 'curious' | 'neutral';
    breathingPhase?: BreathPhase;
    breathingDuration?: number;
}

// Realistic coat palettes are no longer needed as we use 3D renders
const Mascot: React.FC<MascotProps> = ({
    size = 180,
    className = "",
    type: propType,
    color: propColor,
    outfit: propOutfit,
    currentEmotion: propEmotion,
    breathingPhase = 'idle',
    breathingDuration = 4
}) => {
    const mascotContext = useMascot();

    const type = propType || mascotContext.mascot?.type;
    const color = propColor || mascotContext.mascot?.customization?.color || '#C8A24E';
    const outfit = propOutfit || mascotContext.mascot?.customization?.outfit || 'none';
    const currentEmotion = propEmotion || mascotContext.currentEmotion;

    if (!type) return null;

    // Breathing transform helpers
    const isBreathing = breathingPhase !== 'idle';
    const isExpanded = breathingPhase === 'inhale' || breathingPhase === 'hold-in';
    const dur = `${breathingDuration}s`;
    const t = (prop: string) => `${prop} ${dur} ease-in-out`;

    const breathStyle = (transform: string, origin = '50% 50%'): React.CSSProperties => ({
        transform: isBreathing ? transform : 'none',
        transformOrigin: origin,
        transition: isBreathing ? t('transform') : 'transform 0.3s ease',
    });

    const renderWearable = () => {
        switch (outfit) {
            case 'scarf':
                return (
                    <g className="mascot-wearable" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
                        <path d="M33 56 Q50 62 67 56 Q69 62 67 68 Q50 72 33 68 Q31 62 33 56 Z" fill="#c0392b" />
                        <path d="M33 56 Q50 62 67 56 Q69 59 67 62 Q50 66 33 62 Q31 59 33 56 Z" fill="#e74c3c" />
                        <path d="M62 60 Q70 70 68 82" stroke="#c0392b" strokeWidth="7" strokeLinecap="round" fill="none" />
                        <path d="M62 60 Q72 68 70 78" stroke="#e74c3c" strokeWidth="5" strokeLinecap="round" fill="none" />
                    </g>
                );
            case 'hat':
                return (
                    <g className="mascot-wearable" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
                        <ellipse cx="50" cy="18" rx="14" ry="12" fill="#2c3e50" />
                        <ellipse cx="50" cy="18" rx="10" ry="8" fill="#34495e" />
                        <ellipse cx="50" cy="24" rx="18" ry="4" fill="#2c3e50" />
                        <rect x="38" y="14" width="24" height="3" rx="1" fill="#c0392b" />
                    </g>
                );
            case 'bow':
                return (
                    <g className="mascot-wearable" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
                        <ellipse cx="50" cy="56" rx="3" ry="3.5" fill="#8e44ad" />
                        <path d="M50 56 Q62 48 66 52 Q62 56 50 56" fill="#9b59b6" />
                        <path d="M50 56 Q38 48 34 52 Q38 56 50 56" fill="#9b59b6" />
                        <path d="M50 56 Q62 60 66 56 Q62 52 50 56" fill="#7d3c98" />
                        <path d="M50 56 Q38 60 34 56 Q38 52 50 56" fill="#7d3c98" />
                    </g>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`mascot-container mascot-${currentEmotion} ${className}`}
            style={{ width: size, height: size }}
        >
            <svg viewBox="0 0 100 100" className="mascot-svg">
                <defs>
                    <clipPath id="mascotClip">
                        <circle cx="50" cy="50" r="48" />
                    </clipPath>
                    <filter id="innerGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
                        <feFlood floodColor="black" floodOpacity="0.1" />
                        <feComposite in2="shadowDiff" operator="in" />
                        <feComposite in2="SourceGraphic" operator="over" />
                    </filter>
                </defs>
                <g style={breathStyle(isExpanded ? 'scale(1.04)' : 'scale(1)', '50% 50%')}>
                    <circle cx="50" cy="50" r="48" fill="#FDFBF7" />
                    <image
                        href={`/mascots/${type}.png`}
                        x="0"
                        y="0"
                        width="100"
                        height="100"
                        clipPath="url(#mascotClip)"
                        preserveAspectRatio="xMidYMid slice"
                        filter="url(#innerGlow)"
                    />
                    {color && (
                        <circle cx="50" cy="50" r="48" fill={color} style={{ mixBlendMode: 'color', opacity: 0.4 }} clipPath="url(#mascotClip)" />
                    )}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />
                    {renderWearable()}
                </g>
            </svg>
            {currentEmotion === 'proud' && <div className="mascot-heart-overlay">❤️</div>}
            {currentEmotion === 'happy' && <div className="mascot-heart-overlay">✨</div>}
        </div>
    );
};

export default Mascot;
