import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMascot } from '../../context/MascotContext';
import CenterColumnLayout from '../../components/CenterColumnLayout';
import type { MascotType } from '../../types';
import { Check } from 'lucide-react';
import Mascot from '../../components/Mascot/Mascot';

const ANIMALS: { type: MascotType; label: string }[] = [
    { type: 'puppy', label: 'Puppy' },
    { type: 'kitten', label: 'Kitten' },
    { type: 'bird', label: 'Bird' },
    { type: 'fox', label: 'Fox' },
    { type: 'bunny', label: 'Bunny' },
];

const COLORS = [
    { value: '#C8A24E', name: 'Golden' },
    { value: '#6B3A2A', name: 'Chocolate' },
    { value: '#8E8E93', name: 'Silver' },
    { value: '#F5E6D3', name: 'Cream' },
    { value: '#B8612A', name: 'Tawny' },
    { value: '#3C3C3E', name: 'Charcoal' },
];

const OUTFITS = [
    { value: 'none', label: 'Natural' },
    { value: 'scarf', label: 'Scarf' },
    { value: 'hat', label: 'Tiny Hat' },
    { value: 'bow', label: 'Bow Tie' },
];

const MascotBuilder: React.FC = () => {
    const navigate = useNavigate();
    const { mascot, setMascot } = useMascot();

    const [selectedType, setSelectedType] = useState<MascotType>(mascot?.type || 'puppy');
    const [selectedColor, setSelectedColor] = useState(mascot?.customization.color || COLORS[0].value);
    const [selectedOutfit, setSelectedOutfit] = useState(mascot?.customization.outfit || 'none');
    const [name, setName] = useState(mascot?.name || '');

    const handleSave = () => {
        if (!name.trim()) return;
        setMascot(selectedType, { color: selectedColor, outfit: selectedOutfit }, name);
        navigate('/');
    };

    return (
        <CenterColumnLayout onBack={() => navigate('/')} showBackButton={!!mascot}>
            <div style={{ marginTop: 'var(--section-spacing)', width: '100%', maxWidth: '800px' }} className="animate-fade-in">
                <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                    {mascot ? 'Customize Your Companion' : 'Choose Your Spirit Animal'}
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                    "Look after yourself like you would a friend. This is your friend."
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '3rem' }}>
                    {/* Preview Panel */}
                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                        <div style={{ transform: 'scale(1.5)' }}>
                            {/* We hijack the context temporarily for preview or just pass props to Mascot if we modify it to accept direct props */}
                            {/* For now, I'll use a hacky way or just update the Mascot component to accept props */}
                            <div style={{
                                width: '150px',
                                height: '150px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {/* Using the standardized Mascot component for preview */}
                                <Mascot
                                    type={selectedType}
                                    color={selectedColor}
                                    outfit={selectedOutfit}
                                    currentEmotion="calm"
                                    size={150}
                                />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name your companion..."
                            className="glass-panel"
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.1)',
                                textAlign: 'center',
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-serif)'
                            }}
                        />
                    </div>

                    {/* Selection Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Animal Types */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Choose Animal</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                                {ANIMALS.map(animal => (
                                    <button
                                        key={animal.type}
                                        onClick={() => setSelectedType(animal.type)}
                                        className={`glass-panel ${selectedType === animal.type ? 'active' : ''}`}
                                        style={{
                                            padding: '0.5rem',
                                            border: selectedType === animal.type ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem',
                                            background: selectedType === animal.type ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {animal.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Coat Color</h3>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: color.value,
                                            border: selectedColor === color.value ? '2px solid white' : 'none',
                                            boxShadow: 'var(--shadow-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {selectedColor === color.value && <Check size={20} color="white" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Outfits (MVP placeholder) */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Outfit Style</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {OUTFITS.map(outfit => (
                                    <button
                                        key={outfit.value}
                                        onClick={() => setSelectedOutfit(outfit.value)}
                                        className="glass-panel"
                                        style={{
                                            padding: '0.8rem',
                                            border: selectedOutfit === outfit.value ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                                            cursor: 'pointer',
                                            background: selectedOutfit === outfit.value ? 'rgba(255,255,255,0.2)' : 'transparent',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {outfit.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn-premium"
                            onClick={handleSave}
                            disabled={!name.trim()}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            Start Your Journey
                        </button>
                    </div>
                </div>
            </div>
        </CenterColumnLayout>
    );
};

export default MascotBuilder;
