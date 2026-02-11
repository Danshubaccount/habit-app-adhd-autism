import React, { useState, useEffect } from 'react';
import { HabitProvider } from './context/HabitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage, SignupPage } from './components/AuthPages';
import './styles/main.css';

import GoalsDashboard from './components/GoalsDashboard';
import MindfulnessPlaceholder from './components/MindfulnessPlaceholder';
import Journal from './components/Journal';
import HomeSelection from './components/HomeSelection';

import homeBg from './assets/home_bg.png';
import goalsBg from './assets/goals_bg.png';
import journalBg from './assets/journal_bg.png';

type View = 'home' | 'goals' | 'mindfulness' | 'journal';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    let bgImage = '';
    switch (currentView) {
      case 'home':
        bgImage = `url(${homeBg})`;
        break;
      case 'goals':
        bgImage = `url(${goalsBg})`;
        break;
      case 'journal':
      case 'mindfulness':
        bgImage = `url(${journalBg})`;
        break;
    }

    if (currentUser) {
      document.body.style.backgroundImage = bgImage;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.transition = 'background-image 0.5s ease-in-out';
    } else {
      document.body.style.backgroundImage = '';
    }

    return () => {
      // Cleanup if needed, though for spa usually we just overwrite
    };
  }, [currentView, currentUser]);

  if (!currentUser) {
    // Reset background for auth pages if needed, or keep it simple
    document.body.style.backgroundImage = '';
    return isLogin
      ? <LoginPage onSwitch={() => setIsLogin(false)} />
      : <SignupPage onSwitch={() => setIsLogin(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'goals':
        return <GoalsDashboard onBack={() => setCurrentView('home')} />;
      case 'mindfulness':
        return <MindfulnessPlaceholder onBack={() => setCurrentView('home')} />;
      case 'journal':
        return <Journal onBack={() => setCurrentView('home')} />;
      case 'home':
      default:
        return (
          <HomeSelection
            onSelectGoals={() => setCurrentView('goals')}
            onSelectMindfulness={() => setCurrentView('mindfulness')}
            onSelectJournal={() => setCurrentView('journal')}
          />
        );
    }
  };

  return (
    <HabitProvider>
      {renderView()}
    </HabitProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
