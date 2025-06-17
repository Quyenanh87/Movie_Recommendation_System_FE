import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from "./pages/LoginPage";
import WatchPage from "./pages/WatchPage";
import Chatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/watch/:movieName" element={<WatchPage />} />
      </Routes>
      {isLoggedIn && !isLoginPage && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
