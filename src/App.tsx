import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store';
import { applyTheme } from './lib/utils';
import { isLiveMode } from './lib/api';
import Seo from './components/Seo';
import FullscreenGuard from './components/FullscreenGuard';

import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Quizzes from './pages/Quizzes';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import Notes from './pages/Notes';
import Videos from './pages/Videos';
import Articles from './pages/Articles';
import Comments from './pages/Comments';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import GuestSetup from './pages/GuestSetup';
import CompleteSignup from './pages/CompleteSignup';

function Root() {
  const { hasEnteredJourney, currentUser } = useStore();
  if (!hasEnteredJourney) return <Welcome />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  const { settings, theme, setTheme, hasEnteredJourney, syncFromSheets, syncAllFromLive } = useStore();

  // apply default theme once before journey starts
  useEffect(() => {
    if (!hasEnteredJourney) setTheme(settings.defaultTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On open: pull centralized data so the platform works the same for everyone.
  // Priority 1: full live sync via Apps Script (getAll) — settings, contestants, quizzes, questions.
  // Priority 2: lightweight CSV sync of questions/contestants sheets.
  useEffect(() => {
    if (isLiveMode()) {
      syncAllFromLive();
    } else if (settings.autoSyncOnOpen && (settings.questionsSheetUrl || settings.contestantsSheetUrl)) {
      syncFromSheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyTheme(settings, theme);
  }, [settings, theme]);

  return (
    <BrowserRouter>
      <Seo />
      <FullscreenGuard />
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/guest-setup" element={<GuestSetup />} />
        <Route path="/complete-signup" element={<CompleteSignup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
