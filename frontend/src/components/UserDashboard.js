import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './UserDashboard.css';  // Make sure to include this CSS file in your project
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [userData, setUserData] = useState({
        userProfile: {},
        activities: [],
        mintEvents: [],
        notifications: [],
        resources: [],
        tokensMintedOverTime: [],
        activitiesOverTime: [],
        trades: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/user/dashboard', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUserData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user dashboard data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
                            <div className="col-md-12">
                    <Link to="/user-home" className="btn btn-secondary mb-3">Home</Link> {/* Home button */}
                </div>
            <h1>User Dashboard</h1>
            <div className="profile section">
                <h2>Profile</h2>
                <p>Username: {userData.userProfile.username}</p>
                <p>CCT Balance: {userData.userProfile.cctBalance}</p>
                <p>Carbon Credits: {userData.userProfile.carbonCredits}</p>
            </div>
            <div className="activities section scroll-section">
                <h2>Recent Activities</h2>
                <ul>
                    {userData.activities.map((activity, index) => (
                        <li key={index} className="list-item">
                            <p>Activity Details: {activity.activityDetails}</p>
                            <p>Status: {activity.status}</p>
                            <p>Impact: {activity.expectedImpact}</p>
                            <p>Admin Comment: {activity.adminComment}</p>
                            <p>Timestamp: {new Date(activity.createdAt).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mint-events section scroll-section">
                <h2>Minting Events</h2>
                <ul>
                    {userData.mintEvents.map((event, index) => (
                        <li key={index} className="list-item">
                            <p>Amount: {event.amount}</p>
                            <p>Date: {new Date(event.timestamp).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="trades section scroll-section">
                <h2>Trading History</h2>
                <ul>
                    {userData.trades.map((trade, index) => (
                        <li key={index} className="list-item">
                            <p>Buyer: {trade.buyer.username}</p>
                            <p>Seller: {trade.seller.username}</p>
                            <p>Quantity: {trade.quantity}</p>
                            <p>Price Per Credit: {trade.pricePerCredit}</p>
                            <p>Date: {new Date(trade.timestamp).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="chart-section">
                <h2>Activities Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userData.activitiesOverTime}>
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-section">
                <h2>Tokens Minted Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userData.tokensMintedOverTime}>
                        <Line type="monotone" dataKey="totalMinted" stroke="#82ca9d" />
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UserDashboard;
