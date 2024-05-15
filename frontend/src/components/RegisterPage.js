import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', { username, password });
      alert(`Registration successful. Your account is ${response.data.account}. Please remember to save your private key securely and use it to add your account to your wallet.`);
      navigate('/login');
    } catch (error) {
      alert('Registration failed. ' + (error.response?.data?.error || 'Please try again later.'));
    }
  };

  return (
    <div className="register-container">
      <h2 className="text-center">Create Your Account</h2>
      <div className="register-card">
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
          <button type="submit" className="btn btn-success btn-block">Register</button>
        </form>
      </div>
      <p className="text-center">
        Already have an account? 
        <span className="login-link" onClick={() => navigate('/login')}> Log In</span>
      </p>
    </div>
  );
};

export default RegisterPage;

// Add the corresponding CSS for better styling
