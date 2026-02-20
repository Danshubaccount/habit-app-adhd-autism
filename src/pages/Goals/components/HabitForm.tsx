import React, { useState } from 'react';
import { useHabitContext } from '../../../context/HabitContext';
import type { HabitCategory } from '../../../types';

const HabitForm: React.FC = () => {
    const { addHabit, categories, addCategory } = useHabitContext();
    const [title, setTitle] = useState('');
    const [cue, setCue] = useState('');
    const [routine, setRoutine] = useState('');
    const [reward, setReward] = useState('');
    const [category, setCategory] = useState<HabitCategory>('Health');
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [frequency, setFrequency] = useState(1);
    const [isCritical, setIsCritical] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !cue || !routine || !reward) return;

        addHabit({
            title,
            cue,
            routine,
            reward,
            category,
            frequency,
            isCritical,
            graceDays: 0,
            scaleLevel: 'standard'
        });

        // Reset form
        setTitle('');
        setCue('');
        setRoutine('');
        setReward('');
        setCategory(categories[0] || 'Health');
        setIsAddingCategory(false);
        setNewCategory('');
        setFrequency(1);
        setIsCritical(false);
        setIsOpen(false);
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
            <div className="modal-content">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>New Habit Loop</h2>
                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label className="form-label">Statement</label>
                        <input
                            type="text"
                            placeholder="I want to..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius)', marginBottom: '1rem', display: 'grid', gap: '0.75rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="detail-label">Cue (When...)</label>
                            <input
                                type="text"
                                placeholder="e.g. After I pour coffee"
                                value={cue}
                                onChange={e => setCue(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="detail-label">Routine (I will...)</label>
                            <input
                                type="text"
                                placeholder="e.g. Meditate for 1 min"
                                value={routine}
                                onChange={e => setRoutine(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="detail-label">Reward (Then I can...)</label>
                            <input
                                type="text"
                                placeholder="e.g. Check my phone"
                                value={reward}
                                onChange={e => setReward(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div style={{ flex: 1 }}>
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
                        <div style={{ flex: 1, marginLeft: '1rem' }}>
                            <label className="form-label">Weekly Target</label>
                            <input
                                type="number"
                                min="1"
                                max="7"
                                value={frequency}
                                onChange={e => setFrequency(parseInt(e.target.value))}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <input
                                type="checkbox"
                                checked={isCritical}
                                onChange={e => setIsCritical(e.target.checked)}
                                style={{ width: '1rem', height: '1rem' }}
                            />
                            <span style={{ fontWeight: 600, color: isCritical ? 'var(--danger-color)' : 'inherit' }}>
                                Critical / Emergency Mode?
                            </span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Create Loop
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HabitForm;
