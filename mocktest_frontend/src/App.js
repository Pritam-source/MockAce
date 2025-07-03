import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MockTestList from './pages/MockTestList';
import TestPage from './pages/TestPage';
import ScorePage from './pages/ScorePage';
import ReviewPage from './pages/ReviewPage';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  if (!token) {
    return (
      <div>
        {showRegister ? (
          <Register onShowLogin={() => setShowRegister(false)} />
        ) : (
          <Login setToken={setToken} onShowRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/package/:packageId" element={<MockTestList />} />
        <Route path="/mocktest/:mockTestId" element={<TestPage token={token} />} />
        <Route path="/score/:mockTestId" element={<ScorePage token={token} />} />
        <Route path="/mocktest/:mockTestId/review" element={<ReviewPage token={token} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
