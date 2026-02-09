import React from 'react';
import { HabitProvider, useHabitContext } from './context/HabitContext';
import HabitList from './components/HabitList';
import HabitWizard from './components/HabitWizard';
import Confetti from './components/Confetti';
import './styles/main.css';

const Dashboard: React.FC = () => {
  const { isEmergencyMode, toggleEmergencyMode } = useHabitContext();

  return (
    <div className={`app-container ${isEmergencyMode ? 'mode-emergency' : ''}`}>
      <Confetti />
      <div className="emergency-toggle-container">
        <label className="switch">
          <input type="checkbox" checked={isEmergencyMode} onChange={toggleEmergencyMode} />
          <span className="slider round"></span>
        </label>
        <span className="toggle-label">Emergency Mode</span>
      </div>

      <HabitList />
      <HabitWizard />
    </div>
  );
};

function App() {
  return (
    <HabitProvider>
      <Dashboard />
    </HabitProvider>
  );
}

export default App;
