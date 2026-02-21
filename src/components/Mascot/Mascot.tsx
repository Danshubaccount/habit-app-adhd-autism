import { useMascot } from '../../context/MascotContext';
import type { MascotType } from '../../types';
import './Mascot.css';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'idle';

interface MascotProps {
    size?: number | string;
    className?: string;
    type?: MascotType;
    color?: string;
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
    currentEmotion: propEmotion,
    breathingPhase = 'idle',
    breathingDuration = 4
}) => {
    const mascotContext = useMascot();

    const type = propType || mascotContext.mascot?.type;
    const color = propColor || mascotContext.mascot?.customization?.color || '#C8A24E';
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
                </g>
            </svg>
            {currentEmotion === 'proud' && <div className="mascot-heart-overlay">❤️</div>}
            {currentEmotion === 'happy' && <div className="mascot-heart-overlay">✨</div>}
        </div>
    );
};

export default Mascot;
