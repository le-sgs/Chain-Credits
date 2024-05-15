import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserHomePage.css';

const UserHomePage = () => {
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/latest-news');
        setLatestNews(response.data); // assuming response.data is the array of articles
      } catch (error) {
        console.error('Failed to fetch latest news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="user-home-container">
        <div className="col-md-12">
          <Link to="/" className="btn btn-secondary mb-3">Home</Link> {/* Home button */}
        </div>
      <h1>Welcome to Chain Credits!</h1>
      <div className="user-links">
        <Link to="/trading" className="btn user-btn">Go to Trading</Link>
        <Link to="/submit-activity" className="btn user-btn">Submit Activity</Link>
        <Link to="/user-dashboard" className="btn user-btn">User Dashboard</Link>
        <Link to="/minting-events" className="btn user-btn">Minting Events</Link>
      </div>
      <div className="latest-news">
      <h2>‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎ ‎ ‎ ‎ ‎Latest on Carbon Credits‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  </h2>
  {latestNews.slice(0, 3).map((article, index) => ( // Only take the first three articles
    <div key={index} className="news-article">
      <h3>{article.title}</h3>
      <p>{article.description}</p>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">Read More</a>
      <img src={article.image} alt="Article" />
    </div>
  ))}
  
</div>
    </div>
  );
};

export default UserHomePage;
