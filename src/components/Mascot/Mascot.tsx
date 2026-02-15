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

// Realistic coat palettes keyed by the user's chosen color swatch
// Each swatch maps to a natural coat: { base, dark, light, belly, nose, earInner }
const COAT_PALETTES: Record<string, {
    base: string; dark: string; light: string;
    belly: string; nose: string; earInner: string;
}> = {
    // Golden Retriever / Ginger tabby / Red fox / etc.
    '#C8A24E': { base: '#C8A24E', dark: '#9B7A2F', light: '#E8CFA0', belly: '#F5E6C8', nose: '#3D2B1F', earInner: '#D4A76A' },
    // Chocolate / Dark brown
    '#6B3A2A': { base: '#6B3A2A', dark: '#4A2318', light: '#8B5E3C', belly: '#C4A882', nose: '#2C1810', earInner: '#9B7A5C' },
    // Silver / Grey
    '#8E8E93': { base: '#8E8E93', dark: '#636366', light: '#B0B0B5', belly: '#D1D1D6', nose: '#48484A', earInner: '#C7C7CC' },
    // Cream / White
    '#F5E6D3': { base: '#F5E6D3', dark: '#D4C4A8', light: '#FCF5ED', belly: '#FFFFFF', nose: '#3D2B1F', earInner: '#F0D5BC' },
    // Tawny / Reddish
    '#B8612A': { base: '#B8612A', dark: '#8B4513', light: '#D4884A', belly: '#F0D5BC', nose: '#2C1810', earInner: '#CC7A3F' },
    // Charcoal / Black
    '#3C3C3E': { base: '#3C3C3E', dark: '#1C1C1E', light: '#5A5A5E', belly: '#8E8E93', nose: '#1C1C1E', earInner: '#636366' },
};

const DEFAULT_COAT = { base: '#C8A24E', dark: '#9B7A2F', light: '#E8CFA0', belly: '#F5E6C8', nose: '#3D2B1F', earInner: '#D4A76A' };

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
    const color = propColor || mascotContext.mascot?.customization.color;
    const outfit = propOutfit || mascotContext.mascot?.customization.outfit || 'none';
    const currentEmotion = propEmotion || mascotContext.currentEmotion;

    if (!type || !color) return null;

    const coat = COAT_PALETTES[color] || DEFAULT_COAT;

    // Breathing transform helpers
    const isBreathing = breathingPhase !== 'idle';
    const isExpanded = breathingPhase === 'inhale' || breathingPhase === 'hold-in';
    const dur = `${breathingDuration}s`;
    const t = (prop: string) => `${prop} ${dur} linear`;

    // Per-animal body expansion values
    const bellyScale = isExpanded ? 'scale(1.15, 1.25)' : 'scale(1, 1)';
    const chestScale = isExpanded ? 'scale(1.1, 1.2)' : 'scale(1, 1)';
    const earUp = isExpanded ? 'translateY(-4px)' : 'translateY(0)';
    const cheekPuff = isExpanded ? 'scale(1.6)' : 'scale(1)';
    const tailWag = isExpanded ? 'rotate(8deg)' : 'rotate(-4deg)';
    const wingLift = isExpanded ? 'rotate(-12deg)' : 'rotate(0deg)';
    const featherPuff = isExpanded ? 'scale(1.12, 1.2)' : 'scale(1, 1)';
    const bunnyEarStretch = isExpanded ? 'scaleY(1.15) translateY(-3px)' : 'scaleY(1) translateY(0)';

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
                    <radialGradient id="bodyShading" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="black" stopOpacity="0.08" />
                    </radialGradient>
                    <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffb6c1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffb6c1" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="eyeShine" cx="35%" cy="30%" r="50%">
                        <stop offset="0%" stopColor="#4A3728" stopOpacity="1" />
                        <stop offset="100%" stopColor="#1a0e08" stopOpacity="1" />
                    </radialGradient>
                </defs>

                {/* ═══════════════ PUPPY ═══════════════ */}
                {type === 'puppy' && (
                    <>
                        {/* Body — breathing: chest expands */}
                        <g style={breathStyle(chestScale, '50% 68%')}>
                            <ellipse cx="50" cy="68" rx="28" ry="24" fill={coat.base} />
                            <ellipse cx="50" cy="68" rx="28" ry="24" fill="url(#bodyShading)" />
                        </g>
                        <g style={breathStyle(bellyScale, '50% 72%')}>
                            <ellipse cx="50" cy="72" rx="16" ry="12" fill={coat.belly} />
                        </g>

                        {/* Front paws */}
                        <ellipse cx="35" cy="88" rx="8" ry="5" fill={coat.base} />
                        <ellipse cx="65" cy="88" rx="8" ry="5" fill={coat.base} />
                        <ellipse cx="35" cy="89" rx="6" ry="3" fill={coat.belly} />
                        <ellipse cx="65" cy="89" rx="6" ry="3" fill={coat.belly} />

                        {/* Tail — breathing: wags */}
                        <g style={breathStyle(tailWag, '22% 72%')}>
                            <path className="mascot-tail" d="M22 72 Q12 60 18 55" stroke={coat.base} strokeWidth="7" strokeLinecap="round" fill="none" />
                            <path className="mascot-tail" d="M18 55 Q16 52 20 50" stroke={coat.light} strokeWidth="4" strokeLinecap="round" fill="none" />
                        </g>

                        {/* Head */}
                        <ellipse cx="50" cy="40" rx="26" ry="22" fill={coat.base} />
                        <ellipse cx="50" cy="40" rx="26" ry="22" fill="url(#bodyShading)" />

                        {/* Floppy ears — breathing: perk up */}
                        <g style={breathStyle(earUp, '28% 32%')}>
                            <path d="M28 32 Q16 26 18 52 Q22 50 30 42" fill={coat.dark} />
                            <path d="M29 34 Q20 30 21 48 Q24 46 30 40" fill={coat.earInner} />
                        </g>
                        <g style={breathStyle(earUp, '72% 32%')}>
                            <path d="M72 32 Q84 26 82 52 Q78 50 70 42" fill={coat.dark} />
                            <path d="M71 34 Q80 30 79 48 Q76 46 70 40" fill={coat.earInner} />
                        </g>

                        {/* Muzzle / snout area */}
                        <ellipse cx="50" cy="48" rx="14" ry="10" fill={coat.light} />
                        <ellipse cx="50" cy="46" rx="10" ry="6" fill={coat.belly} />

                        {/* Eyes */}
                        <g className="mascot-eye">
                            <ellipse cx="40" cy="37" rx="4.5" ry="5" fill="white" />
                            <circle cx="40" cy="37" r="3.2" fill="url(#eyeShine)" />
                            <circle cx="40" cy="37" r="2" fill="#0D0D0D" />
                            <circle cx="38.5" cy="35.5" r="1.2" fill="white" />
                            <circle cx="41" cy="36" r="0.5" fill="white" fillOpacity="0.6" />
                        </g>
                        <g className="mascot-eye">
                            <ellipse cx="60" cy="37" rx="4.5" ry="5" fill="white" />
                            <circle cx="60" cy="37" r="3.2" fill="url(#eyeShine)" />
                            <circle cx="60" cy="37" r="2" fill="#0D0D0D" />
                            <circle cx="58.5" cy="35.5" r="1.2" fill="white" />
                            <circle cx="61" cy="36" r="0.5" fill="white" fillOpacity="0.6" />
                        </g>

                        {/* Eyebrows */}
                        <path d="M35 31 Q40 29 45 31" stroke={coat.dark} strokeWidth="1" fill="none" strokeLinecap="round" />
                        <path d="M55 31 Q60 29 65 31" stroke={coat.dark} strokeWidth="1" fill="none" strokeLinecap="round" />

                        {/* Nose */}
                        <path d="M46 46 Q50 43 54 46 Q52 49 50 50 Q48 49 46 46 Z" fill={coat.nose} />
                        <ellipse cx="49" cy="45" rx="1.5" ry="0.8" fill="white" fillOpacity="0.3" />

                        {/* Mouth */}
                        <path d="M50 50 L50 53" stroke={coat.nose} strokeWidth="0.8" />
                        <path d="M44 53 Q50 57 56 53" stroke={coat.nose} strokeWidth="1" fill="none" strokeLinecap="round" />

                        {/* Cheek blush — breathing: puff up */}
                        <g style={breathStyle(cheekPuff, '33% 44%')}>
                            <circle cx="33" cy="44" r="4" fill="url(#cheekGlow)" />
                        </g>
                        <g style={breathStyle(cheekPuff, '67% 44%')}>
                            <circle cx="67" cy="44" r="4" fill="url(#cheekGlow)" />
                        </g>

                        {/* Markings */}
                        <path d="M55 28 Q65 25 68 35 Q65 40 58 38 Q55 34 55 28 Z" fill={coat.dark} fillOpacity="0.3" />
                    </>
                )}

                {/* ═══════════════ KITTEN ═══════════════ */}
                {type === 'kitten' && (
                    <>
                        {/* Body — breathing: rounds out */}
                        <g style={breathStyle(chestScale, '50% 68%')}>
                            <ellipse cx="50" cy="68" rx="26" ry="22" fill={coat.base} />
                            <ellipse cx="50" cy="68" rx="26" ry="22" fill="url(#bodyShading)" />
                        </g>
                        <g style={breathStyle(bellyScale, '50% 72%')}>
                            <ellipse cx="50" cy="72" rx="14" ry="10" fill={coat.belly} />
                        </g>

                        {/* Front paws */}
                        <ellipse cx="36" cy="87" rx="7" ry="4.5" fill={coat.base} />
                        <ellipse cx="64" cy="87" rx="7" ry="4.5" fill={coat.base} />
                        <ellipse cx="36" cy="88" rx="5" ry="2.5" fill={coat.belly} />
                        <ellipse cx="64" cy="88" rx="5" ry="2.5" fill={coat.belly} />

                        {/* Tail — breathing: curls tighter on inhale */}
                        <g style={breathStyle(tailWag, '23% 68%')}>
                            <path className="mascot-tail" d="M23 68 Q8 58 12 45 Q18 38 24 45" stroke={coat.base} strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M24 45 Q26 42 24 40" stroke={coat.dark} strokeWidth="4" strokeLinecap="round" fill="none" />
                        </g>

                        {/* Tabby stripes on body */}
                        <g style={breathStyle(chestScale, '50% 62%')}>
                            <path d="M38 60 Q42 58 46 62" stroke={coat.dark} strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
                            <path d="M42 65 Q46 63 50 67" stroke={coat.dark} strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
                            <path d="M54 60 Q58 58 62 62" stroke={coat.dark} strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeLinecap="round" />
                        </g>

                        {/* Head */}
                        <ellipse cx="50" cy="38" rx="24" ry="20" fill={coat.base} />
                        <ellipse cx="50" cy="38" rx="24" ry="20" fill="url(#bodyShading)" />

                        {/* Pointy ears — breathing: perk up */}
                        <g style={breathStyle(earUp, '30% 28%')}>
                            <path d="M30 28 L20 6 L44 22 Z" fill={coat.base} />
                            <path d="M31 27 L24 12 L40 22 Z" fill={coat.earInner} fillOpacity="0.6" />
                        </g>
                        <g style={breathStyle(earUp, '70% 28%')}>
                            <path d="M70 28 L80 6 L56 22 Z" fill={coat.base} />
                            <path d="M69 27 L76 12 L60 22 Z" fill={coat.earInner} fillOpacity="0.6" />
                        </g>

                        {/* Tabby M marking */}
                        <path d="M40 26 L44 22 L50 28 L56 22 L60 26" stroke={coat.dark} strokeWidth="1.5" fill="none" strokeOpacity="0.4" strokeLinecap="round" />

                        {/* Face patch */}
                        <ellipse cx="50" cy="44" rx="12" ry="8" fill={coat.light} />

                        {/* Eyes */}
                        <g className="mascot-eye">
                            <ellipse cx="40" cy="36" rx="4.5" ry="4" fill="#C8D96F" />
                            <ellipse cx="40" cy="36" rx="4.5" ry="4" fill="url(#bodyShading)" />
                            <ellipse cx="40" cy="36" rx="1.5" ry="3.5" fill="#0D0D0D" />
                            <circle cx="38.5" cy="34.5" r="1" fill="white" />
                            <circle cx="41" cy="35.5" r="0.4" fill="white" fillOpacity="0.5" />
                        </g>
                        <g className="mascot-eye">
                            <ellipse cx="60" cy="36" rx="4.5" ry="4" fill="#C8D96F" />
                            <ellipse cx="60" cy="36" rx="4.5" ry="4" fill="url(#bodyShading)" />
                            <ellipse cx="60" cy="36" rx="1.5" ry="3.5" fill="#0D0D0D" />
                            <circle cx="58.5" cy="34.5" r="1" fill="white" />
                            <circle cx="61" cy="35.5" r="0.4" fill="white" fillOpacity="0.5" />
                        </g>

                        {/* Nose */}
                        <path d="M48 43 Q50 41 52 43 Q51 45 50 46 Q49 45 48 43 Z" fill="#e8a0a0" />

                        {/* Mouth */}
                        <path d="M50 46 L50 48" stroke="#c48080" strokeWidth="0.7" />
                        <path d="M46 48 Q50 51 54 48" stroke="#c48080" strokeWidth="0.8" fill="none" strokeLinecap="round" />

                        {/* Whiskers — breathing: spread wider on inhale */}
                        <g style={breathStyle(isExpanded ? 'scaleX(1.2)' : 'scaleX(1)', '36% 44%')}>
                            <path d="M36 42 L18 38" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                            <path d="M36 44 L18 44" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                            <path d="M36 46 L18 50" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                        </g>
                        <g style={breathStyle(isExpanded ? 'scaleX(1.2)' : 'scaleX(1)', '64% 44%')}>
                            <path d="M64 42 L82 38" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                            <path d="M64 44 L82 44" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                            <path d="M64 46 L82 50" stroke={coat.dark} strokeWidth="0.5" strokeOpacity="0.3" />
                        </g>

                        {/* Cheek blush — breathing: puff */}
                        <g style={breathStyle(cheekPuff, '32% 42%')}>
                            <circle cx="32" cy="42" r="4" fill="url(#cheekGlow)" />
                        </g>
                        <g style={breathStyle(cheekPuff, '68% 42%')}>
                            <circle cx="68" cy="42" r="4" fill="url(#cheekGlow)" />
                        </g>
                    </>
                )}

                {/* ═══════════════ BIRD ═══════════════ */}
                {type === 'bird' && (
                    <>
                        {/* Body — breathing: chest puffs out */}
                        <g style={breathStyle(featherPuff, '48% 62%')}>
                            <ellipse cx="48" cy="62" rx="24" ry="28" fill={coat.base} />
                            <ellipse cx="48" cy="62" rx="24" ry="28" fill="url(#bodyShading)" />
                        </g>
                        <g style={breathStyle(bellyScale, '48% 70%')}>
                            <ellipse cx="48" cy="70" rx="16" ry="16" fill={coat.belly} />
                        </g>

                        {/* Wing — breathing: lifts on inhale */}
                        <g style={breathStyle(wingLift, '38% 70%')}>
                            <path d="M30 52 Q18 48 20 72 Q28 78 38 70 Q42 62 30 52 Z" fill={coat.dark} />
                            <path d="M30 54 Q22 52 22 66 Q28 72 35 66 Q38 60 30 54 Z" fill={coat.base} fillOpacity="0.6" />
                            <path d="M24 58 Q28 56 32 60" stroke={coat.light} strokeWidth="0.5" fill="none" strokeOpacity="0.5" />
                            <path d="M22 64 Q26 62 30 66" stroke={coat.light} strokeWidth="0.5" fill="none" strokeOpacity="0.5" />
                        </g>

                        {/* Tail feathers — breathing: fan out */}
                        <g style={breathStyle(isExpanded ? 'rotate(-8deg)' : 'rotate(0deg)', '34% 80%')}>
                            <path d="M32 82 Q22 90 18 88 Q24 82 28 76 Z" fill={coat.dark} />
                            <path d="M36 84 Q28 94 24 92 Q30 86 34 78 Z" fill={coat.base} />
                        </g>

                        {/* Head */}
                        <circle cx="62" cy="38" r="20" fill={coat.base} />
                        <circle cx="62" cy="38" r="20" fill="url(#bodyShading)" />

                        {/* Crown feather — breathing: perks up */}
                        <g style={breathStyle(earUp, '62% 18%')}>
                            <path d="M58 20 Q60 14 64 18 Q62 12 68 16" stroke={coat.dark} strokeWidth="2" fill="none" strokeLinecap="round" />
                        </g>

                        {/* Cheek patch — breathing: puffs */}
                        <g style={breathStyle(cheekPuff, '68% 42%')}>
                            <circle cx="68" cy="42" r="6" fill={coat.light} fillOpacity="0.5" />
                        </g>

                        {/* Eye */}
                        <g className="mascot-eye">
                            <circle cx="68" cy="34" r="5" fill="white" />
                            <circle cx="68" cy="34" r="3.5" fill="#2c1810" />
                            <circle cx="68" cy="34" r="2" fill="#0D0D0D" />
                            <circle cx="66.5" cy="32.5" r="1.2" fill="white" />
                            <circle cx="69" cy="33.5" r="0.5" fill="white" fillOpacity="0.5" />
                        </g>

                        {/* Beak */}
                        <path d="M76 36 L90 40 L76 44 Q78 40 76 36 Z" fill="#e8a020" />
                        <path d="M76 40 L90 40 L76 44 Z" fill="#c88818" />
                        <circle cx="80" cy="39" r="0.8" fill="#c88818" />

                        {/* Feet */}
                        <path d="M42 88 L38 96 M42 88 L42 96 M42 88 L46 96" stroke="#c88818" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M54 88 L50 96 M54 88 L54 96 M54 88 L58 96" stroke="#c88818" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                )}

                {/* ═══════════════ FOX ═══════════════ */}
                {type === 'fox' && (
                    <>
                        {/* Body — breathing: chest expands */}
                        <g style={breathStyle(chestScale, '50% 68%')}>
                            <ellipse cx="50" cy="68" rx="28" ry="22" fill={coat.base} />
                            <ellipse cx="50" cy="68" rx="28" ry="22" fill="url(#bodyShading)" />
                        </g>
                        <g style={breathStyle(bellyScale, '50% 72%')}>
                            <ellipse cx="50" cy="72" rx="16" ry="14" fill={coat.belly} />
                        </g>

                        {/* Front legs */}
                        <rect x="32" y="80" width="10" height="12" rx="4" fill={coat.base} />
                        <rect x="58" y="80" width="10" height="12" rx="4" fill={coat.base} />
                        <rect x="32" y="86" width="10" height="6" rx="4" fill={coat.dark} />
                        <rect x="58" y="86" width="10" height="6" rx="4" fill={coat.dark} />

                        {/* Bushy tail — breathing: bushes out */}
                        <g style={breathStyle(isExpanded ? 'scale(1.15)' : 'scale(1)', '78% 68%')}>
                            <path className="mascot-tail" d="M78 62 Q96 42 92 60 Q98 70 88 80 Q80 78 78 68" fill={coat.base} />
                            <path d="M88 78 Q92 76 94 72 Q90 74 86 75 Z" fill={coat.belly} />
                        </g>

                        {/* Head */}
                        <path d="M50 16 L22 42 L50 54 L78 42 Z" fill={coat.base} />
                        <path d="M50 16 L22 42 L50 54 L78 42 Z" fill="url(#bodyShading)" />

                        {/* White face markings */}
                        <path d="M38 42 L50 32 L62 42 L50 52 Z" fill={coat.belly} />
                        <path d="M42 42 L50 35 L58 42 L50 50 Z" fill="white" fillOpacity="0.5" />

                        {/* Ears — breathing: perk up */}
                        <g style={breathStyle(earUp, '32% 28%')}>
                            <path d="M32 28 L22 6 L42 22 Z" fill={coat.base} />
                            <path d="M30 25 L24 10 L38 21 Z" fill={coat.dark} />
                            <path d="M33 26 L28 16 L38 22 Z" fill={coat.earInner} fillOpacity="0.4" />
                        </g>
                        <g style={breathStyle(earUp, '68% 28%')}>
                            <path d="M68 28 L78 6 L58 22 Z" fill={coat.base} />
                            <path d="M70 25 L76 10 L62 21 Z" fill={coat.dark} />
                            <path d="M67 26 L72 16 L62 22 Z" fill={coat.earInner} fillOpacity="0.4" />
                        </g>

                        {/* Eyes */}
                        <g className="mascot-eye">
                            <ellipse cx="40" cy="36" rx="4" ry="3.5" fill="#D4A520" />
                            <ellipse cx="40" cy="36" rx="2" ry="3" fill="#0D0D0D" />
                            <circle cx="38.5" cy="35" r="1" fill="white" />
                        </g>
                        <g className="mascot-eye">
                            <ellipse cx="60" cy="36" rx="4" ry="3.5" fill="#D4A520" />
                            <ellipse cx="60" cy="36" rx="2" ry="3" fill="#0D0D0D" />
                            <circle cx="58.5" cy="35" r="1" fill="white" />
                        </g>

                        {/* Eyeliner */}
                        <path d="M34 35 Q36 33 38 34" stroke={coat.dark} strokeWidth="0.8" fill="none" />
                        <path d="M66 35 Q64 33 62 34" stroke={coat.dark} strokeWidth="0.8" fill="none" />

                        {/* Nose */}
                        <path d="M48 44 Q50 42 52 44 Q51 46 50 47 Q49 46 48 44 Z" fill={coat.nose} />

                        {/* Mouth */}
                        <path d="M50 47 L50 49" stroke={coat.nose} strokeWidth="0.7" />
                        <path d="M46 49 Q50 52 54 49" stroke={coat.nose} strokeWidth="0.8" fill="none" strokeLinecap="round" />
                    </>
                )}

                {/* ═══════════════ BUNNY ═══════════════ */}
                {type === 'bunny' && (
                    <>
                        {/* Body — breathing: belly puffs round */}
                        <g style={breathStyle(chestScale, '50% 68%')}>
                            <ellipse cx="50" cy="68" rx="26" ry="22" fill={coat.base} />
                            <ellipse cx="50" cy="68" rx="26" ry="22" fill="url(#bodyShading)" />
                        </g>
                        <g style={breathStyle(bellyScale, '50% 72%')}>
                            <ellipse cx="50" cy="72" rx="14" ry="12" fill={coat.belly} />
                        </g>

                        {/* Hind paws */}
                        <ellipse cx="34" cy="86" rx="9" ry="5" fill={coat.base} />
                        <ellipse cx="66" cy="86" rx="9" ry="5" fill={coat.base} />
                        <ellipse cx="34" cy="87" rx="6" ry="3" fill={coat.belly} />
                        <ellipse cx="66" cy="87" rx="6" ry="3" fill={coat.belly} />

                        {/* Cottontail — breathing: puffs */}
                        <g style={breathStyle(cheekPuff, '76% 72%')}>
                            <circle cx="76" cy="72" r="6" fill={coat.belly} />
                            <circle cx="76" cy="72" r="4" fill="white" fillOpacity="0.5" />
                        </g>

                        {/* Head */}
                        <ellipse cx="50" cy="40" rx="22" ry="20" fill={coat.base} />
                        <ellipse cx="50" cy="40" rx="22" ry="20" fill="url(#bodyShading)" />

                        {/* Long ears — breathing: stretch tall on inhale */}
                        <g className="mascot-wiggle-part" style={breathStyle(bunnyEarStretch, '38% 32%')}>
                            <ellipse cx="38" cy="12" rx="7" ry="20" fill={coat.base} />
                            <ellipse cx="38" cy="12" rx="4" ry="16" fill={coat.earInner} fillOpacity="0.5" />
                        </g>
                        <g className="mascot-wiggle-part" style={breathStyle(bunnyEarStretch, '62% 32%')}>
                            <ellipse cx="62" cy="12" rx="7" ry="20" fill={coat.base} />
                            <ellipse cx="62" cy="12" rx="4" ry="16" fill={coat.earInner} fillOpacity="0.5" />
                        </g>

                        {/* Face */}
                        <ellipse cx="50" cy="44" rx="10" ry="8" fill={coat.light} />

                        {/* Eyes */}
                        <g className="mascot-eye">
                            <ellipse cx="42" cy="36" rx="4" ry="4.5" fill="#2C1810" />
                            <circle cx="42" cy="36" r="2.5" fill="#0D0D0D" />
                            <circle cx="40.5" cy="34.5" r="1.3" fill="white" />
                            <circle cx="43" cy="35.5" r="0.5" fill="white" fillOpacity="0.5" />
                        </g>
                        <g className="mascot-eye">
                            <ellipse cx="58" cy="36" rx="4" ry="4.5" fill="#2C1810" />
                            <circle cx="58" cy="36" r="2.5" fill="#0D0D0D" />
                            <circle cx="56.5" cy="34.5" r="1.3" fill="white" />
                            <circle cx="59" cy="35.5" r="0.5" fill="white" fillOpacity="0.5" />
                        </g>

                        {/* Nose */}
                        <ellipse cx="50" cy="43" rx="2.5" ry="2" fill="#e8a0a0" />
                        <path d="M50 45 L50 47" stroke="#c48080" strokeWidth="0.6" />
                        <path d="M48 47 Q50 49 52 47" stroke="#c48080" strokeWidth="0.7" fill="none" strokeLinecap="round" />

                        {/* Whiskers */}
                        <path d="M38 44 L22 40" stroke={coat.dark} strokeWidth="0.4" strokeOpacity="0.25" />
                        <path d="M38 46 L22 46" stroke={coat.dark} strokeWidth="0.4" strokeOpacity="0.25" />
                        <path d="M62 44 L78 40" stroke={coat.dark} strokeWidth="0.4" strokeOpacity="0.25" />
                        <path d="M62 46 L78 46" stroke={coat.dark} strokeWidth="0.4" strokeOpacity="0.25" />

                        {/* Cheek blush — breathing: puffs */}
                        <g style={breathStyle(cheekPuff, '34% 42%')}>
                            <circle cx="34" cy="42" r="4" fill="url(#cheekGlow)" />
                        </g>
                        <g style={breathStyle(cheekPuff, '66% 42%')}>
                            <circle cx="66" cy="42" r="4" fill="url(#cheekGlow)" />
                        </g>
                    </>
                )}

                {renderWearable()}
            </svg>
            {currentEmotion === 'proud' && <div className="mascot-heart-overlay">❤️</div>}
            {currentEmotion === 'happy' && <div className="mascot-heart-overlay">✨</div>}
        </div>
    );
};

export default Mascot;
