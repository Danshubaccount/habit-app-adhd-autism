import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useMascot } from '../../context/MascotContext';
import type { MascotType } from '../../types';
import Mascot from '../../components/Mascot/Mascot';
import './MascotBuilder.css';

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

const MascotBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { mascot, setMascot } = useMascot();

  const [selectedType, setSelectedType] = useState<MascotType>(mascot?.type || 'puppy');
  const [selectedColor, setSelectedColor] = useState(mascot?.customization.color || COLORS[0].value);
  const [name, setName] = useState(mascot?.name || '');

  const canSubmit = name.trim().length > 0;

  const handleSave = () => {
    if (!canSubmit) return;
    setMascot(selectedType, { color: selectedColor }, name.trim());
    navigate('/');
  };

  return (
    <div className="spirit-builder">
      <div className="spirit-builder__lava" aria-hidden="true">
        <div className="lava-blob lava-blob-a" />
        <div className="lava-blob lava-blob-b" />
        <div className="lava-blob lava-blob-c" />
        <div className="lava-blob lava-blob-d" />
        <div className="lava-blob lava-blob-e" />
      </div>

      {mascot && (
        <button
          type="button"
          className="spirit-builder__back"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={18} />
          Back
        </button>
      )}

      <div className="spirit-builder__content">
        <header className="spirit-builder__header">
          <h1>{mascot ? 'Customize Your Companion' : 'Choose Your Spirit Animal'}</h1>
          <p>Look after yourself like you would a friend. This is your friend.</p>
        </header>

        <section className="spirit-builder__grid">
          <article className="glass-pane preview-pane">
            <div className="preview-orb">
              <Mascot
                type={selectedType}
                color={selectedColor}
                currentEmotion="calm"
                size={185}
              />
            </div>
            <label htmlFor="companion-name" className="group-label">Companion Name</label>
            <input
              id="companion-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name your companion..."
              className="companion-input"
            />
          </article>

          <article className="glass-pane controls-pane">
            <div className="control-group">
              <p className="group-label">Animal</p>
              <div className="pill-row">
                {ANIMALS.map((animal) => (
                  <button
                    key={animal.type}
                    type="button"
                    className={`pill-toggle ${selectedType === animal.type ? 'is-selected' : ''}`}
                    onClick={() => setSelectedType(animal.type)}
                  >
                    {animal.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <p className="group-label">Coat Color</p>
              <div className="pill-row">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`pill-toggle ${selectedColor === color.value ? 'is-selected' : ''}`}
                    onClick={() => setSelectedColor(color.value)}
                  >
                    <span
                      className="color-dot"
                      style={{ backgroundColor: color.value }}
                      aria-hidden="true"
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="journey-button journey-button--desktop"
              disabled={!canSubmit}
              onClick={handleSave}
            >
              Start Your Journey
            </button>
          </article>
        </section>
      </div>

      <div className="mobile-cta">
        <button
          type="button"
          className="journey-button"
          disabled={!canSubmit}
          onClick={handleSave}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
};

export default MascotBuilder;
