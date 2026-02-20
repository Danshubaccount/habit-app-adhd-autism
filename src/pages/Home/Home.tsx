import React from 'react';
import './Home.css';

interface HomeSelectionProps {
  onSelectGoals: () => void;
  onSelectMindfulness: () => void;
  onSelectJournal: () => void;
}

const Home: React.FC<HomeSelectionProps> = ({
  onSelectGoals,
  onSelectMindfulness,
  onSelectJournal,
}) => {
  return (
    <div className="live-glass-home">
      <main className="live-glass-card" aria-label="Live glass home panel">
        <p className="live-eyebrow">Live Focus Mode</p>
        <h1>Build momentum with one tiny action.</h1>
        <p className="live-copy">
          Keep your next step obvious and your energy steady with an intentional,
          low-friction interface.
        </p>

        <div className="live-actions">
          <button
            type="button"
            className="live-primary-btn"
            onClick={onSelectMindfulness}
          >
            Start Mindfulness Sprint
          </button>
          <div className="live-secondary-row" aria-label="Quick links">
            <button type="button" className="live-secondary-btn" onClick={onSelectGoals}>
              Goals
            </button>
            <button type="button" className="live-secondary-btn" onClick={onSelectJournal}>
              Journal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
