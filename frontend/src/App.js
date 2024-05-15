// App.js adjustments for ProtectedRoute usage
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import TradingPage from './components/TradingPage';
import SubmitActivity from './components/SubmitActivity';
import ReviewActivities from './components/ReviewActivities';
import MintingEvents from './components/MintingEvents';
import MintingReport from './components/MintingReport';
import Analytics from './components/Analytics';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserHomePage from './components/UserHomePage'; // Import the new component
import AdminLogin from './components/AdminLogin';
import AddAdmin from './components/AddAdmin';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserDashboard /></ProtectedRoute>} />
        <Route path="/user-home" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserHomePage /></ProtectedRoute>} />
        <Route path="/trading" element={<ProtectedRoute allowedRoles={['user', 'admin']}><TradingPage /></ProtectedRoute>} />
        <Route path="/submit-activity" element={<ProtectedRoute allowedRoles={['user', 'admin']}><SubmitActivity /></ProtectedRoute>} />
        <Route path="/minting-events" element={<ProtectedRoute allowedRoles={['user', 'admin']}><MintingEvents /></ProtectedRoute>} />
        <Route path="/review-activities" element={<ProtectedRoute allowedRoles={['admin']}><ReviewActivities /></ProtectedRoute>} />
        <Route path="/minting-report" element={<ProtectedRoute allowedRoles={['admin']}><MintingReport /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
        <Route path="/add-admin" element={<ProtectedRoute allowedRoles={['user', 'admin']}><AddAdmin /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;
