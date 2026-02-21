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
import VideoHub from './pages/Videos/VideoHub';
import { useMascot } from './context/MascotContext';

const VIDEO_BACKGROUND_ROUTES = ['/mindfulness/releasing-memories', '/mascot-builder'];

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { mascot } = useMascot();
  const location = useLocation();
  const navigate = useNavigate();
  const isMascotBuilderRoute = location.pathname.startsWith('/mascot-builder');

  const hideAbstractBackground = VIDEO_BACKGROUND_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // Redirect to Mascot Builder if logged in but no mascot
  // Exclude certain routes from the redirect
  const MASCOT_BYPASS_ROUTES = ['/mascot-builder', '/videos'];
  useEffect(() => {
    const isBypassed = MASCOT_BYPASS_ROUTES.some((r) => location.pathname.startsWith(r));
    if (currentUser && !mascot && !isBypassed) {
      navigate('/mascot-builder');
    }
  }, [currentUser, mascot, location.pathname, navigate]);

  if (!currentUser) {
    return (
      <>
        {!hideAbstractBackground && (
          <div className="abstract-flow-bg" aria-hidden="true">
            <div className="abstract-flow-bg__layer abstract-flow-bg__layer--base" />
            <div className="abstract-flow-bg__layer abstract-flow-bg__layer--orb" />
            <div className="abstract-flow-bg__layer abstract-flow-bg__layer--pink" />
            <div className="abstract-flow-bg__layer abstract-flow-bg__layer--warm" />
          </div>
        )}
        <div className="route-layer">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </>
    );
  }

  return (
    <>
      {!hideAbstractBackground && (
        <div className="abstract-flow-bg" aria-hidden="true">
          <div className="abstract-flow-bg__layer abstract-flow-bg__layer--base" />
          <div className="abstract-flow-bg__layer abstract-flow-bg__layer--orb" />
          <div className="abstract-flow-bg__layer abstract-flow-bg__layer--pink" />
          <div className="abstract-flow-bg__layer abstract-flow-bg__layer--warm" />
        </div>
      )}
      <div className="route-layer">
        <HabitProvider>
          <div className={`app-container ${isMascotBuilderRoute ? 'app-container--full-bleed' : ''}`}>
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
              <Route path="/videos" element={<VideoHub onBack={() => navigate('/')} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {!isMascotBuilderRoute && <MascotSidebar />}
          </div>
        </HabitProvider>
      </div>
    </>
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
