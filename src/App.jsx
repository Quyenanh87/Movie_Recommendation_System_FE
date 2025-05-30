import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from "./pages/LoginPage";
import WatchPage from "./pages/WatchPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/watch/:movieName" element={<WatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
