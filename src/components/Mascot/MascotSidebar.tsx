import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMascot } from '../../context/MascotContext';
import Mascot from './Mascot';
import { X, ChevronLeft } from 'lucide-react';

const MascotSidebar: React.FC = () => {
    const { mascot, currentMessage, isMinimized, setIsMinimized, triggerInteraction } = useMascot();
    const location = useLocation();

    // Hide sidebar on pages where the mascot is rendered center-stage
    const hideOnRoutes = ['/mindfulness/box-breathing'];
    if (!mascot || hideOnRoutes.includes(location.pathname)) return null;

    const handlePet = () => {
        if (!isMinimized) {
            triggerInteraction('pet', 'complete');
        }
    };

    return (
        <div
            className={`mascot-sidebar ${isMinimized ? 'minimized' : ''}`}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: isMinimized ? '-60px' : '2rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                transition: 'right 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
            }}
        >
            {/* Speech Bubble */}
            {currentMessage && !isMinimized && (
                <div
                    className="glass-panel animate-fade-in mascot-speech-bubble"
                    style={{
                        padding: '1.25rem 2rem',
                        marginBottom: '1.5rem',
                        maxWidth: '280px',
                        borderRadius: '24px',
                        borderBottomRightRadius: '4px',
                        boxShadow: 'var(--shadow-xl)',
                        fontSize: '1.1rem',
                        lineHeight: '1.5',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        position: 'relative',
                        pointerEvents: 'auto',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    {currentMessage}
                    <div style={{
                        position: 'absolute',
                        bottom: '-12px',
                        right: '24px',
                        width: '0',
                        height: '0',
                        borderLeft: '12px solid transparent',
                        borderRight: '12px solid transparent',
                        borderTop: '12px solid rgba(255,255,255,0.2)',
                        filter: 'blur(0.5px)'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        right: '24px',
                        width: '0',
                        height: '0',
                        borderLeft: '12px solid transparent',
                        borderRight: '12px solid transparent',
                        borderTop: '12px solid var(--glass-background)',
                    }} />
                </div>
            )}

            {/* Mascot and Controls */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', pointerEvents: 'auto' }}>
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="glass-panel"
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        padding: 0,
                        marginBottom: '1.5rem',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'var(--glass-background)',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.2s ease',
                        color: 'var(--text-primary)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isMinimized ? <ChevronLeft size={22} /> : <X size={22} />}
                </button>

                {!isMinimized ? (
                    <div
                        className="mascot-sidebar-mascot"
                        onClick={handlePet}
                        title="Pet me!"
                    >
                        <Mascot size={160} />
                    </div>
                ) : (
                    <div
                        onClick={() => setIsMinimized(false)}
                        style={{
                            cursor: 'pointer',
                            width: '70px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--glass-background)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '50%',
                            boxShadow: 'var(--shadow-xl)',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) translateX(-10px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateX(0)'}
                    >
                        <Mascot size={50} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MascotSidebar;
