import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ganacheAccount, setGanacheAccount] = useState('');
  const navigate = useNavigate();

  const handleFetchAccount = async () => {
    try {
      const response = await axios.post('http://localhost:3001/fetch-account', { username, password });
      setGanacheAccount(response.data.account);
    } catch (error) {
      alert('Failed to fetch account: ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert("Login successful. Please make sure you have added your Ganache account to MetaMask and connected to the site.");
      navigate('/user-home');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  return (
    <div className="login-container">
      <h2 className="text-center">Log In to Your Account</h2>
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="button" 
            className="btn btn-info btn-block mb-3" 
            onClick={handleFetchAccount}
          >
            Fetch Account
          </button>
          {ganacheAccount && (
            <div className="form-group">
              <label>Your Ganache Account Details:</label>
              <input type="text" className="form-control" value={ganacheAccount} readOnly />
            </div>
          )}
          <button type="submit" className="btn btn-success btn-block">Log In</button>
        </form>
      </div>
      <p className="text-center">
        Don't have an account? 
        <span className="register-link" onClick={() => navigate('/register')}> Register Now</span>
      </p>
    </div>
  );
};

export default LoginPage;

// Add the corresponding CSS for better styling
