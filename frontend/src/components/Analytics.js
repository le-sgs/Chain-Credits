import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Analytics.css'; // Assuming you have a separate CSS file for styling
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics() {
    const [totals, setTotals] = useState({});
    const [activityOverTime, setActivityOverTime] = useState([]);
    const [tokensMintedOverTime, setTokensMintedOverTime] = useState([]);
    const [topOffsetters, setTopOffsetters] = useState([]);
    const [topTokenHolders, setTopTokenHolders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responses = await Promise.all([
                    axios.get('http://localhost:3001/api/analytics/tokens-minted'),
                    axios.get('http://localhost:3001/api/analytics/total-offset'),
                    axios.get('http://localhost:3001/api/analytics/total-users'),
                    axios.get('http://localhost:3001/api/analytics/total-activities'),
                    axios.get('http://localhost:3001/api/analytics/activities-over-time'),
                    axios.get('http://localhost:3001/api/analytics/tokens-minted-over-time'),
                    axios.get('http://localhost:3001/api/analytics/top-offsetters'),
                    axios.get('http://localhost:3001/api/analytics/top-token-holders')
                ]);
                setTotals({
                    totalTokensMinted: responses[0].data.totalTokensMinted,
                    totalCarbonOffset: responses[1].data.totalCarbonOffset,
                    totalUsers: responses[2].data.totalUsers,
                    totalActivities: responses[3].data.totalActivities
                });
                setActivityOverTime(responses[4].data);
                setTokensMintedOverTime(responses[5].data);
                setTopOffsetters(responses[6].data);
                setTopTokenHolders(responses[7].data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data for the dashboard:", error);
                setLoading(false);
            }
        };

        

        fetchData();
    }, []);


    const downloadReport = () => {
        window.open('http://localhost:3001/api/download-report');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="analytics-container">
            <h1>Analytics</h1>
            <button onClick={downloadReport} style={{ margin: '20px', padding: '10px' }}>Download Report</button>
            <div className="summary">
                <p>Total Tokens Minted: {totals.totalTokensMinted}</p>
                <p>Total Carbon Credits Offset: {totals.totalCarbonOffset}</p>
                <p>Total Users: {totals.totalUsers}</p>
                <p>Total Activities: {totals.totalActivities}</p>
            </div>
            <div className="charts-container">
                <div className="chart">
                    <h2>Activities Over Time</h2>
                    {/* Include chart component for activities over time */}
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={activityOverTime}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
                </div>
                <div className="chart">
                    <h2>Tokens Minted Over Time</h2>
                    {/* Include chart component for tokens minted over time */}
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tokensMintedOverTime}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalMinted" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>
            <div className="lists-container">
                <div className="list">
                    <h2>Top Offsetters</h2>
                    <ul>
                        {topOffsetters.map((offsetter, index) => (
                            <li key={index}>{offsetter.username}: {offsetter.totalImpact}</li>
                        ))}
                    </ul>
                </div>
                <div className="list">
                    <h2>Top Token Holders</h2>
                    <ul>
                        {topTokenHolders.map((holder, index) => (
                            <li key={index}>{holder.username}: {holder.cctBalance}</li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}

export default Analytics;
