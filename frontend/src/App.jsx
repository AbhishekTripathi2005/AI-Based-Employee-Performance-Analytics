import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import AIRecommendation from './components/AIRecommendation';

const API_BASE = "https://ai-based-employee-performance-analytics.onrender.com/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar token={token} logout={logout} />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/employees" /> : <Navigate to="/login" />} />
          <Route path="/login" element={!token ? <Login setToken={setToken} API_BASE={API_BASE} /> : <Navigate to="/employees" />} />
          <Route path="/employees" element={token ? <EmployeeList API_BASE={API_BASE} token={token} /> : <Navigate to="/login" />} />
          <Route path="/add-employee" element={token ? <EmployeeForm API_BASE={API_BASE} token={token} /> : <Navigate to="/login" />} />
          <Route path="/ai-recommend" element={token ? <AIRecommendation API_BASE={API_BASE} token={token} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;