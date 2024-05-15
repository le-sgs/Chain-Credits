// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  // Check for token presence
  return !!localStorage.getItem('token');
};

const userRole = () => {
  // Get user role from localStorage
  return localStorage.getItem('userRole');
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(userRole())) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
