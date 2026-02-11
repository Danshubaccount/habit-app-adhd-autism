import React from 'react';
import { useHabitContext } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import HabitList from './HabitList';
import HabitWizard from './HabitWizard';
import Confetti from './Confetti';
import DailyReward from './DailyReward';

interface GoalsDashboardProps {
    onBack: () => void;
}

const GoalsDashboard: React.FC<GoalsDashboardProps> = ({ onBack }) => {
    const { isEmergencyMode, toggleEmergencyMode } = useHabitContext();
    const { currentUser, logout } = useAuth();

    return (
        <div className={`app-container ${isEmergencyMode ? 'mode-emergency' : ''}`}>
            <Confetti />
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '999px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Hi, {currentUser?.name}</span>
                    <button
                        onClick={logout}
                        style={{
                            border: 'none',
                            background: 'var(--secondary-color)',
                            color: 'var(--text-secondary)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger-color)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        Sign Out
                    </button>
                </div>

                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '999px' }}>
                    <label className="switch">
                        <input type="checkbox" checked={isEmergencyMode} onChange={toggleEmergencyMode} />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Emergency Mode</span>
                </div>
            </div>

            {/* Back to Home Button */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
                <button
                    onClick={onBack}
                    style={{
                        border: 'none',
                        background: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Back
                </button>
            </div>

            <DailyReward />
            <HabitList />
            <HabitWizard />
        </div>
    );
};

export default GoalsDashboard;
