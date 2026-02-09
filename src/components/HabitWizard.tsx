import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext';
import type { HabitCategory } from '../types';

const HabitWizard: React.FC = () => {
    const { addHabit } = useHabitContext();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    const [title, setTitle] = useState('');
    const [cue, setCue] = useState('');
    const [routine, setRoutine] = useState('');
    const [reward, setReward] = useState('');
    const [category, setCategory] = useState<HabitCategory>('health');
    const [isCritical, setIsCritical] = useState(false);

    const reset = () => {
        setTitle('');
        setCue('');
        setRoutine('');
        setReward('');
        setCategory('health');
        setIsCritical(false);
        setStep(1);
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(reset, 300); // Reset after animation
    };

    const handleSubmit = () => {
        if (!title || !cue || !routine || !reward) return;
        addHabit({
            title,
            cue,
            routine,
            reward,
            category,
            isCritical
        });
        handleClose();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Quick Templates
    const applyTemplate = (tTitle: string, tCue: string, tRoutine: string, tReward: string, tCat: HabitCategory) => {
        setTitle(tTitle);
        setCue(tCue);
        setRoutine(tRoutine);
        setReward(tReward);
        setCategory(tCat);
        setStep(4); // Skip to review
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fab"
                aria-label="Add New Habit"
            >
                +
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '32rem' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} style={{
                            height: '4px',
                            flex: 1,
                            borderRadius: '2px',
                            backgroundColor: step >= s ? 'var(--primary-color)' : 'var(--border-color)',
                            transition: 'background-color 0.3s'
                        }} />
                    ))}
                </div>

                {/* Step 1: Identity & Templates */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="habit-title">What's the goal?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Start with identity. Who do you want to be?</p>

                        <div className="form-group">
                            <label className="form-label">I want to...</label>
                            <input
                                type="text"
                                placeholder="e.g. Be a runner"
                                value={title}
                                autoFocus
                                onChange={e => setTitle(e.target.value)}
                                className="form-input"
                                onKeyDown={e => e.key === 'Enter' && title && nextStep()}
                            />
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <p className="detail-label" style={{ marginBottom: '0.5rem' }}>Or choose a quick start:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button className="btn btn-secondary" onClick={() => applyTemplate("Drink Water", "When I sit at my desk", "Drink a glass of water", "Feel refreshed", "health")}>
                                    💧 Hydrate
                                </button>
                                <button className="btn btn-secondary" onClick={() => applyTemplate("Read", "Before bed", "Read 1 page", "Relax", "mindfulness")}>
                                    📚 Read
                                </button>
                                <button className="btn btn-secondary" onClick={() => applyTemplate("Walk", "After lunch", "Walk for 5 mins", "Listen to music", "health")}>
                                    yx Walk
                                </button>
                                <button className="btn btn-secondary" onClick={() => applyTemplate("Meds", "With morning coffee", "Take meds", "Check health app", "health")}>
                                    💊 Meds
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
                            <button onClick={nextStep} disabled={!title} className="btn btn-primary">Next</button>
                        </div>
                    </div>
                )}

                {/* Step 2: The Loop (Cue & Routine) */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <h2 className="habit-title">Build the Loop</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Make it obvious and easy.</p>

                        <div className="form-group">
                            <label className="form-label">Trigger (When...)</label>
                            <input
                                type="text"
                                placeholder="e.g. When I wake up"
                                value={cue}
                                autoFocus
                                onChange={e => setCue(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Action (I will...)</label>
                            <input
                                type="text"
                                placeholder="e.g. Do 1 pushup"
                                value={routine}
                                onChange={e => setRoutine(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button onClick={prevStep} className="btn btn-secondary">Back</button>
                            <button onClick={nextStep} disabled={!cue || !routine} className="btn btn-primary">Next</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Reward & Category */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <h2 className="habit-title">Make it Satisfying</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>What's the immediate payoff?</p>

                        <div className="form-group">
                            <label className="form-label">Reward</label>
                            <input
                                type="text"
                                placeholder="e.g. Scrolling time"
                                value={reward}
                                autoFocus
                                onChange={e => setReward(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value as HabitCategory)}
                                className="form-select"
                            >
                                <option value="health">Health</option>
                                <option value="work">Work</option>
                                <option value="mindfulness">Mindfulness</option>
                                <option value="social">Social</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button onClick={prevStep} className="btn btn-secondary">Back</button>
                            <button onClick={nextStep} disabled={!reward} className="btn btn-primary">Review</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <h2 className="habit-title">Ready to launch?</h2>

                        <div style={{ background: 'var(--secondary-color)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                            <p><strong>Goal:</strong> {title}</p>
                            <p><strong>When:</strong> {cue}</p>
                            <p><strong>Do:</strong> {routine}</p>
                            <p><strong>Get:</strong> {reward}</p>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isCritical}
                                onChange={e => setIsCritical(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem' }}
                            />
                            <span style={{ fontWeight: 600 }}>Mark as Critical (Emergency Mode)</span>
                        </label>

                        <div className="form-actions">
                            <button onClick={prevStep} className="btn btn-secondary">Back</button>
                            <button onClick={handleSubmit} className="btn btn-primary">Create System</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitWizard;
