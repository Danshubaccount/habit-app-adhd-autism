import React from 'react';
import { LogOut, AlertTriangle, CheckCircle2, Trophy, Zap } from 'lucide-react';
import { useHabitContext } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import HabitList from './components/HabitList';
import HabitWizard from './components/HabitWizard';
import Confetti from '../../components/Confetti';
import DailyReward from '../../components/DailyReward';
import CenterColumnLayout from '../../components/CenterColumnLayout';
import './Goals.css';

interface GoalsDashboardProps {
    onBack: () => void;
}

const Goals: React.FC<GoalsDashboardProps> = ({ onBack }) => {
    const { isEmergencyMode, toggleEmergencyMode, habits, xp, level } = useHabitContext();
    const { currentUser, logout } = useAuth();
    const [showConfetti, setShowConfetti] = React.useState(false);
    const [editingHabitId, setEditingHabitId] = React.useState<string | undefined>(undefined);

    const today = new Date().toISOString().split('T')[0];
    const completedCount = habits.filter(h => h.completedDates.includes(today)).length;
    const totalCount = habits.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    const handleEditHabit = (id: string) => {
        setEditingHabitId(id);
    };

    const handleCloseWizard = () => {
        setEditingHabitId(undefined);
    };

    return (
        <CenterColumnLayout onBack={onBack} className={isEmergencyMode ? 'mode-emergency' : ''}>
            {showConfetti && <Confetti />}
            <div className="goals-top-controls">
                <div className="glass-panel goals-chip">
                    <span className="goals-chip__username">{currentUser?.name}</span>
                    <button
                        onClick={logout}
                        className="btn-premium btn-premium-secondary"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                <div
                    className={`glass-panel goals-chip ${isEmergencyMode ? 'goals-chip--emergency' : ''}`}
                    style={isEmergencyMode ? { borderColor: 'rgba(239, 68, 68, 0.75)' } : undefined}
                >
                    {isEmergencyMode ? <AlertTriangle size={16} color="var(--danger-color)" /> : <CheckCircle2 size={16} color="var(--success-color)" />}
                    <span className="goals-chip__label">Emergency Mode</span>
                    <label className="switch">
                        <input type="checkbox" checked={isEmergencyMode} onChange={toggleEmergencyMode} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <div className="goals-page-content">
                <header className="glass-panel goals-hero-panel">
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            Hello, <span style={{ color: 'var(--primary-text)' }}>Friend</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                            {isEmergencyMode
                                ? "Take a deep breath. Just the essentials today."
                                : "You are becoming 1% better every day."}
                        </p>
                    </div>

                    <div className="goals-metrics">
                        <div className="goals-metric">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-text)' }}>
                                <Trophy size={20} />
                                {level || 1}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Level
                            </div>
                        </div>
                        <div className="goals-metric">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-text)' }}>
                                <Zap size={20} />
                                {xp || 0}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                XP
                            </div>
                        </div>
                    </div>

                    <div className="progress-track goals-progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%`, background: 'var(--success-color)', borderRadius: 'var(--radius-full)' }}
                        ></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {progress}% Complete
                    </p>
                </header>

                <div className="glass-panel goals-meaning-panel">
                    <h4 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>What this means to you</h4>
                    <p style={{ fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                        Every habit you complete is a vote for the person you wish to become.
                        You aren't just ticking a box; you are proving to yourself that you can trust your own intentions.
                    </p>
                </div>
                <HabitList
                    onHabitComplete={() => {
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 5000);
                    }}
                    onEdit={handleEditHabit}
                />
                <DailyReward />
                <HabitWizard habitId={editingHabitId} onClose={handleCloseWizard} />
            </div>
        </CenterColumnLayout>
    );
};

export default Goals;
