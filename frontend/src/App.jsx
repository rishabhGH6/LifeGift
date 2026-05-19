import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './components/Login';
import DonorDashboard from './pages/DonorDashboard';
import DonorOnboarding from './pages/DonorOnboarding';
import RecipientOnboarding from './pages/RecipientOnboarding';
import RecipientDashboard from './pages/RecipientDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import About from './pages/About';
import Impact from './pages/Impact';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/donor-onboarding" element={<DonorOnboarding />} />
          <Route path="/recipient-onboarding" element={<RecipientOnboarding />} />
          <Route path="/recipient-dashboard" element={<RecipientDashboard />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
