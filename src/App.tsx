import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HabitProvider } from './context/HabitContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/main.css';

import Home from './pages/Home/Home';
import Goals from './pages/Goals/Goals';
import Mindfulness from './pages/Mindfulness/Mindfulness';
import Journal from './pages/Journal/Journal';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import MascotSidebar from './components/Mascot/MascotSidebar';
import MascotBuilder from './pages/MascotBuilder/MascotBuilder';
import { useMascot } from './context/MascotContext';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { mascot } = useMascot();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.body.style.setProperty('--mouse-x', `${x}%`);
      document.body.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let themeClass = '';
    const path = location.pathname;

    if (path === '/' || path === '/home') {
      themeClass = 'theme-home';
    } else if (path.startsWith('/goals')) {
      themeClass = 'theme-goals';
    } else if (path.startsWith('/journal')) {
      themeClass = 'theme-journal';
    } else if (path.startsWith('/mindfulness')) {
      themeClass = 'theme-mindfulness';
    }

    if (currentUser && themeClass) {
      document.body.className = themeClass;
    } else if (!currentUser) {
      document.body.className = '';
    }
  }, [location.pathname, currentUser]);

  // Redirect to Mascot Builder if logged in but no mascot
  useEffect(() => {
    if (currentUser && !mascot && location.pathname !== '/mascot-builder') {
      navigate('/mascot-builder');
    }
  }, [currentUser, mascot, location.pathname, navigate]);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <HabitProvider>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home
            onSelectGoals={() => navigate('/goals')}
            onSelectMindfulness={() => navigate('/mindfulness')}
            onSelectJournal={() => navigate('/journal')}
          />} />
          <Route path="/goals" element={<Goals onBack={() => navigate('/')} />} />
          <Route path="/mindfulness/*" element={<Mindfulness onBack={() => navigate('/')} />} />
          <Route path="/journal" element={<Journal onBack={() => navigate('/')} />} />
          <Route path="/mascot-builder" element={<MascotBuilder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <MascotSidebar />
      </div>
    </HabitProvider>
  );
};

import { MascotProvider } from './context/MascotContext';

function App() {
  return (
    <AuthProvider>
      <MascotProvider>
        <Router>
          <AppContent />
        </Router>
      </MascotProvider>
    </AuthProvider>
  );
}

export default App;
