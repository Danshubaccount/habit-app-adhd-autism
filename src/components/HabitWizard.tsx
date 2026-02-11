import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext';
import type { HabitCategory } from '../types';

const HabitWizard: React.FC = () => {
    const { addHabit, categories, addCategory } = useHabitContext();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const [title, setTitle] = useState('');
    const [cue, setCue] = useState('');
    const [routine, setRoutine] = useState('');
    const [reward, setReward] = useState('');
    const [category, setCategory] = useState<HabitCategory>('Health');
    const [frequency, setFrequency] = useState(1);
    const [isCritical, setIsCritical] = useState(false);

    const reset = () => {
        setTitle('');
        setCue('');
        setRoutine('');
        setReward('');
        setCategory(categories[0] || 'Health');
        setIsAddingCategory(false);
        setNewCategory('');
        setFrequency(1);
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
            frequency,
            isCritical
        });
        handleClose();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);



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
                            <label className="form-label">Weekly Target (Times per week)</label>
                            <input
                                type="number"
                                min="1"
                                max="7"
                                value={frequency}
                                onChange={e => setFrequency(parseInt(e.target.value))}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            {!isAddingCategory ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="form-select"
                                        style={{ flex: 1 }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(true)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0 0.75rem', fontSize: '1.25rem', lineHeight: 1 }}
                                        title="Add New Category"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        placeholder="New Category Name"
                                        className="form-input"
                                        style={{ flex: 1 }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newCategory.trim()) {
                                                const formattedCategory = newCategory.trim();
                                                addCategory(formattedCategory);
                                                setCategory(formattedCategory);
                                                setNewCategory('');
                                                setIsAddingCategory(false);
                                            }
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '0 0.75rem' }}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setNewCategory('');
                                        }}
                                        className="btn btn-secondary"
                                        style={{ padding: '0 0.75rem' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
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
                            <p><strong>Target:</strong> {frequency} / week</p>
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
