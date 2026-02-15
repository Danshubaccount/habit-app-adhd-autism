import React, { useState, useEffect } from 'react';
import { Plus, Check, X, ChevronRight, ChevronLeft, Target, Zap, Gift, ShieldAlert, Sun } from 'lucide-react';
import { useHabitContext } from '../../../context/HabitContext';
import type { HabitCategory, Affirmation } from '../../../types/index';

interface HabitWizardProps {
    habitId?: string;
    onClose?: () => void;
}

const HabitWizard: React.FC<HabitWizardProps> = ({ habitId, onClose }) => {
    const { addHabit, updateHabit, habits, categories, addCategory, personalAffirmations, addPersonalAffirmation } = useHabitContext();
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
    const [scaleLevel, setScaleLevel] = useState<'mini' | 'standard' | 'ideal'>('standard');

    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [subtaskInput, setSubtaskInput] = useState('');
    const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
    const [affirmationInput, setAffirmationInput] = useState('');
    const [affirmationRepeats, setAffirmationRepeats] = useState(3);
    const [shouldSaveToPersonal, setShouldSaveToPersonal] = useState(false);
    const [graceDays, setGraceDays] = useState(1);

    // Load habit data if in edit mode
    useEffect(() => {
        if (habitId) {
            const habit = habits.find(h => h.id === habitId);
            if (habit) {
                setTitle(habit.title);
                setCue(habit.cue);
                setRoutine(habit.routine);
                setReward(habit.reward);
                setCategory(habit.category);
                setFrequency(habit.frequency || 7);
                setGraceDays(habit.graceDays);
                setSubtasks(habit.subtasks.map(s => s.title));
                setAffirmations(habit.affirmations || []);
                setScaleLevel(habit.scaleLevel);
                setIsCritical(habit.isCritical);
                setIsOpen(true);
            }
        }
    }, [habitId, habits]);

    const reset = () => {
        setTitle('');
        setCue('');
        setRoutine('');
        setReward('');
        setCategory(categories[0] || 'Health');
        setIsAddingCategory(false);
        setNewCategory('');
        setFrequency(1);
        setGraceDays(1);
        setSubtasks([]);
        setSubtaskInput('');
        setIsCritical(false);
        setScaleLevel('standard');
        setAffirmations([]);
        setAffirmationInput('');
        setAffirmationRepeats(3);
        setStep(1);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
        setTimeout(reset, 300); // Reset after animation
    };

    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            setSubtasks([...subtasks, subtaskInput.trim()]);
            setSubtaskInput('');
        }
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleAddAffirmation = (text?: string, isPersonal = true, theme?: string) => {
        const affirmationText = text || affirmationInput.trim();
        if (affirmationText) {
            if (shouldSaveToPersonal && !text) {
                addPersonalAffirmation(affirmationText, affirmationRepeats, cue);
            }
            const newAff: Affirmation = {
                id: crypto.randomUUID(),
                text: affirmationText,
                repeats: affirmationRepeats,
                isPersonal,
                theme
            };
            setAffirmations([...affirmations, newAff]);
            if (!text) {
                setAffirmationInput('');
                setShouldSaveToPersonal(false);
            }
        }
    };

    const handleRemoveAffirmation = (id: string) => {
        setAffirmations(affirmations.filter(a => a.id !== id));
    };

    const handleSubmit = () => {
        if (!title || !cue || !routine || !reward) return;
        const habitData = {
            title,
            cue,
            routine,
            reward,
            category,
            frequency,
            isCritical,
            graceDays,
            subtasks,
            affirmations,
            scaleLevel
        };

        if (habitId) {
            updateHabit(habitId, {
                ...habitData,
                subtasks: subtasks.map(title => ({
                    id: crypto.randomUUID(),
                    title,
                    completed: false
                }))
            });
        } else {
            addHabit(habitData);
        }
        handleClose();
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fab"
                style={{
                    width: '4rem',
                    height: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary-color)',
                    boxShadow: '0 8px 32px rgba(235, 126, 95, 0.4)'
                }}
                aria-label="Add New Habit"
            >
                <Plus size={32} color="white" />
            </button>
        );
    }

    return (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '36rem', padding: '3rem', borderRadius: '32px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(s => (
                        <div key={s} style={{
                            height: '6px',
                            flex: 1,
                            borderRadius: '3px',
                            backgroundColor: step >= s ? 'var(--primary-color)' : 'var(--border-color)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: step >= s ? 1 : 0.3
                        }} />
                    ))}
                </div>

                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Target size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>What's the goal?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Start with identity. Who do you want to be?</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>I want to be...</label>
                            <input
                                type="text"
                                placeholder="e.g. A runner, A dedicated writer"
                                value={title}
                                autoFocus
                                onChange={e => setTitle(e.target.value)}
                                style={{
                                    fontSize: '1.2rem',
                                    padding: '1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onKeyDown={e => e.key === 'Enter' && title && nextStep()}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button onClick={handleClose} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1.25rem' }}>Cancel</button>
                            <button onClick={nextStep} disabled={!title} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Cue & Routine */}
                {step === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Zap size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Build the Loop</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Make it obvious and effortless.</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Trigger (When...)</label>
                            <input
                                type="text"
                                placeholder="e.g. After I pour my morning coffee"
                                value={cue}
                                autoFocus
                                onChange={e => setCue(e.target.value)}
                                className="form-input"
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    fontSize: '1.1rem'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Action (I will...)</label>
                            <input
                                type="text"
                                placeholder="e.g. Write for 10 minutes"
                                value={routine}
                                onChange={e => setRoutine(e.target.value)}
                                className="form-input"
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    fontSize: '1.1rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={nextStep} disabled={!cue || !routine} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Reward, Frequency, Grace Days, Category */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Gift size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Make it Satisfying</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>What's the immediate payoff?</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Immediate Reward</label>
                            <input
                                type="text"
                                placeholder="e.g. A piece of dark chocolate"
                                value={reward}
                                autoFocus
                                onChange={e => setReward(e.target.value)}
                                className="form-input"
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    fontSize: '1.1rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Times Per Week</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={frequency}
                                    onChange={e => setFrequency(parseInt(e.target.value))}
                                    className="form-input"
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)',
                                        width: '100%',
                                        fontSize: '1.1rem'
                                    }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Grace Days</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="3"
                                    value={graceDays}
                                    onChange={e => setGraceDays(parseInt(e.target.value))}
                                    className="form-input"
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--border-color)',
                                        width: '100%',
                                        fontSize: '1.1rem'
                                    }}
                                />
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Misses before streak ends.</p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Category</label>
                            {!isAddingCategory ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as HabitCategory)}
                                        style={{
                                            flex: 1,
                                            padding: '1rem 1.25rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '1.1rem'
                                        }}
                                    >
                                        {categories.map((cat: string) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(true)}
                                        className="btn-premium btn-premium-secondary"
                                        style={{ padding: '0 1rem' }}
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        className="form-input"
                                        style={{ flex: 1, padding: '1rem 1.25rem' }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newCategory.trim()) {
                                                const formatted = newCategory.trim();
                                                addCategory(formatted);
                                                setCategory(formatted as HabitCategory);
                                                setNewCategory('');
                                                setIsAddingCategory(false);
                                            }
                                        }}
                                        className="btn-premium btn-premium-primary"
                                        style={{ padding: '0 1rem' }}
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingCategory(false)}
                                        className="btn-premium btn-premium-secondary"
                                        style={{ padding: '0 1rem' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={nextStep} disabled={!reward} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                Next Step <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Subtasks */}
                {step === 4 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Plus size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Break it Down</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Micro-tasks reduce the "Wall of Awful".</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Add a tiny step..."
                                    value={subtaskInput}
                                    onChange={e => setSubtaskInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                                    className="form-input"
                                    style={{ flex: 1, padding: '1rem 1.25rem' }}
                                />
                                <button onClick={handleAddSubtask} className="btn-premium btn-premium-primary" style={{ padding: '0 1.25rem' }}>Add</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {subtasks.map((st, index) => (
                                <div key={index} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                                    <span>{st}</span>
                                    <button onClick={() => handleRemoveSubtask(index)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={nextStep} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem' }}>Next: Affirmations <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Step 5: Affirmations */}
                {step === 5 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Sun size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Power of Affirmation</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Rewire your brain with positive self-talk.</p>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a personal affirmation..."
                                        value={affirmationInput}
                                        onChange={e => setAffirmationInput(e.target.value)}
                                        className="form-input"
                                        style={{ flex: 1, padding: '1rem 1.25rem' }}
                                    />
                                    <button onClick={() => handleAddAffirmation()} className="btn-premium btn-premium-primary" style={{ padding: '0 1.25rem' }}>Add</button>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Repeats:</label>
                                        <input
                                            type="range"
                                            min="3"
                                            max="12"
                                            value={affirmationRepeats}
                                            onChange={e => setAffirmationRepeats(parseInt(e.target.value))}
                                            style={{ flex: 1 }}
                                        />
                                        <span style={{ fontWeight: 800, color: 'var(--primary-color)', minWidth: '1.5rem' }}>{affirmationRepeats}</span>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: '1.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={shouldSaveToPersonal}
                                            onChange={e => setShouldSaveToPersonal(e.target.checked)}
                                            style={{ accentColor: 'var(--primary-color)' }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Save to Personal</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {personalAffirmations && personalAffirmations.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>From Your Personal Bank</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {personalAffirmations.map(aff => {
                                        const alreadyAdded = affirmations.some(a => a.text === aff.text);
                                        return (
                                            <button
                                                key={aff.id}
                                                type="button"
                                                onClick={() => !alreadyAdded && handleAddAffirmation(aff.text, true)}
                                                disabled={alreadyAdded}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid var(--border-color)',
                                                    background: alreadyAdded ? 'var(--primary-soft)' : 'transparent',
                                                    color: alreadyAdded ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                    fontSize: '0.85rem',
                                                    cursor: alreadyAdded ? 'default' : 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {aff.text}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {affirmations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                                    No affirmations added yet.
                                </div>
                            ) : (
                                affirmations.map((aff) => (
                                    <div key={aff.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '12px', borderLeft: aff.isPersonal ? '4px solid var(--primary-color)' : '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.9rem' }}>{aff.text}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{aff.repeats} repeats • {aff.isPersonal ? 'Personal' : (aff.theme || 'Generic')}</span>
                                        </div>
                                        <button onClick={() => handleRemoveAffirmation(aff.id)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={nextStep} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem' }}>Next: Scaling <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Step 6: Scaling */}
                {step === 6 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Zap size={48} color="var(--primary-text)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Adjust the Scale</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Start small to build momentum, or aim high on good days.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { id: 'mini', title: 'Mini', desc: 'The minimum viable version (e.g., 2 mins). Unskippable.', icon: '🌱' },
                                { id: 'standard', title: 'Standard', desc: 'Your target effort (e.g., 20 mins). The baseline.', icon: '⭐' },
                                { id: 'ideal', title: 'Ideal', desc: 'The "perfect day" version (e.g., 1 hour). Aim high!', icon: '🏆' }
                            ].map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => setScaleLevel(level.id as 'mini' | 'standard' | 'ideal')}
                                    className={`glass-panel ${scaleLevel === level.id ? 'active' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        padding: '1.5rem',
                                        textAlign: 'left',
                                        border: scaleLevel === level.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        background: scaleLevel === level.id ? 'var(--primary-soft)' : 'transparent',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>{level.icon}</span>
                                    <div>
                                        <h4 style={{ fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>{level.title}</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{level.desc}</p>
                                    </div>
                                    {scaleLevel === level.id && <Check size={24} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={nextStep} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem' }}>Review Plan <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* Step 7: Review */}
                {step === 7 && (
                    <div className="animate-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Check size={48} color="var(--success-color)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>Ready to launch?</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Review your new system architected for success.</p>
                        </div>

                        <div style={{ background: 'var(--primary-soft)', padding: '2rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid var(--primary-color)', opacity: 0.9 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                <p style={{ margin: 0 }}><strong>Identity:</strong> {title}</p>
                                <p style={{ margin: 0 }}><strong>Trigger:</strong> {cue}</p>
                                <p style={{ margin: 0 }}><strong>System:</strong> {routine}</p>
                                <p style={{ margin: 0 }}><strong>Reward:</strong> {reward}</p>
                                <p style={{ margin: 0 }}><strong>Commitment:</strong> {frequency} / week ({graceDays} grace days)</p>
                                <p style={{ margin: 0 }}><strong>Initial Scale:</strong> <span style={{ textTransform: 'capitalize' }}>{scaleLevel}</span></p>
                                {subtasks.length > 0 && (
                                    <p style={{ margin: 0 }}><strong>Micro-tasks:</strong> {subtasks.length} subtasks defined</p>
                                )}
                                {affirmations.length > 0 && (
                                    <p style={{ margin: 0 }}><strong>Affirmations:</strong> {affirmations.length} defined</p>
                                )}
                            </div>
                        </div>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '2.5rem',
                            cursor: 'pointer',
                            padding: '1rem',
                            borderRadius: '16px',
                            background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            transition: 'all 0.3s'
                        }}>
                            <input
                                type="checkbox"
                                checked={isCritical}
                                onChange={e => setIsCritical(e.target.checked)}
                                style={{ width: '1.5rem', height: '1.5rem', accentColor: 'var(--danger-color)' }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isCritical && <ShieldAlert size={18} color="var(--danger-color)" />}
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: isCritical ? 'var(--danger-color)' : 'var(--text-primary)' }}>Mark as Critical (Emergency Mode)</span>
                            </div>
                        </label>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevStep} className="btn-premium btn-premium-secondary" style={{ flex: 1, padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <ChevronLeft size={18} /> Back
                            </button>
                            <button onClick={handleSubmit} className="btn-premium btn-premium-primary" style={{ flex: 2, padding: '1.25rem', fontWeight: 800 }}>
                                Create System
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitWizard;
