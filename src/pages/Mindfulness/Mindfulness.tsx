import { Routes, Route, useNavigate } from 'react-router-dom';
import { Wind, Scan, Sun, Sparkles, Brain, Flame } from 'lucide-react';
import BoxBreathing from './BoxBreathing/BoxBreathing';
import BodyScanMeditation from './BodyScan/BodyScan';
import Affirmations from './Affirmations/Affirmations';
import MindfulMoments from './MindfulMoments';
import Hypnosis from './Hypnosis/Hypnosis';
import ReleasingBadMemories from './ReleasingBadMemories/ReleasingBadMemories';
import CenterColumnLayout from '../../components/CenterColumnLayout';

interface MindfulnessPlaceholderProps {
    onBack: () => void;
}

const Mindfulness: React.FC<MindfulnessPlaceholderProps> = ({ onBack }) => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route index element={
                <CenterColumnLayout onBack={onBack}>
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }} className="animate-fade-in">
                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>Mindfulness Practice</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
                            Choose a practice to cultivate presence and awareness
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2.5rem',
                            width: '100%'
                        }}>
                            {/* Box Breathing Card */}
                            <div
                                onClick={() => navigate('box-breathing')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Wind size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Box Breathing</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    A simple 4-4-4-4 technique to find immediate calm
                                </p>
                            </div>

                            {/* Body Scan Card */}
                            <div
                                onClick={() => navigate('body-scan')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Scan size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Body Scan</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    A guided journey to connect with your physical self
                                </p>
                            </div>

                            {/* Affirmations Card */}
                            <div
                                onClick={() => navigate('affirmations')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Sun size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Affirmations</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    Ground yourself in calm, confidence, and clarity
                                </p>
                            </div>

                            {/* Mindful Moments Card */}
                            <div
                                onClick={() => navigate('moments')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Sparkles size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Mindful Moments</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    Gentle tips and practices for every situation
                                </p>
                            </div>

                            {/* Hypnosis Card */}
                            <div
                                onClick={() => navigate('hypnosis')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Brain size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Hypnosis</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    Personalized intake and therapeutic hypnosis script generation
                                </p>
                            </div>

                            {/* Releasing Memories Card */}
                            <div
                                onClick={() => navigate('releasing-memories')}
                                className="glass-panel"
                                style={{
                                    padding: '2.5rem 2rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem'
                                }}
                            >
                                <Flame size={48} strokeWidth={1.5} color="var(--primary-text)" style={{ filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }} />
                                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>Release Memories</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                    A guided journey to release what no longer serves you in fire
                                </p>
                            </div>
                        </div>
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="box-breathing" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Box Breathing</h1>
                        <BoxBreathing />
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="body-scan" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Body Scan Meditation</h1>
                        <BodyScanMeditation />
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="affirmations" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Daily Affirmations</h1>
                        <Affirmations />
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="moments" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <MindfulMoments />
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="hypnosis" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Therapeutic Hypnosis</h1>
                        <Hypnosis />
                    </div>
                </CenterColumnLayout>
            } />
            <Route path="releasing-memories" element={
                <CenterColumnLayout onBack={() => navigate('/mindfulness')} backText="Back">
                    <div style={{ marginTop: 'var(--section-spacing)', width: '100%' }}>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '2rem', textAlign: 'center' }}>Releasing Bad Memories</h1>
                        <ReleasingBadMemories />
                    </div>
                </CenterColumnLayout>
            } />
        </Routes>
    );
};

export default Mindfulness;
