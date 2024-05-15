import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Ensure your CSS file is properly linked


const HomePage = () => {
  return (
    <div className="home-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/cclogo.png" alt="Chain Credits Logo" className="logo" />
          <h1 style={{ marginLeft: '20px' }}>Chain Credits</h1>
        </div>
        <Link to="/admin-login" className="admin-login-link">Admin Login</Link>
      </header>
      
      <main className="main-content">
        <p>Welcome to Chain Credits!</p>
      
         <p>Your gateway to blockchain-based carbon credits trading.</p>
        <div className="buttons">
          <Link to="/register" className="btn btn-primary">Register</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
        
        <section className="features">
        <h2>‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ </h2>
          <div className="feature-cards">
            <div className="feature-card">
              <h3>Trade Credits</h3>
              <p>Buy and sell carbon credits with ease and transparency on our secure platform.</p>
            </div>
            <div className="feature-card">
              <h3>Submit Activities</h3>
              <p>Earn credits by submitting eco-friendly activities for verification.</p>
            </div>
            <div className="feature-card">
              <h3>Analyze Impact</h3>
              <p>Access detailed reports and analytics to understand your environmental impact.</p>
            </div>
          </div>
        </section>
        
        <section className="how-it-works">
          <h2>How It Works</h2>
          <p>Submit carbon offset activities and earn CCT. Upon approval, trade CCT for Carbon Credits. Powered by Web3 and blockchain technology.</p>
        </section>
      </main>
      
      <footer className="footer">
        <p>&copy; 2024 Chain Credits</p>
      </footer>
    </div>
  );
};

export default HomePage;
