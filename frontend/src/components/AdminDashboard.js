import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';  // Make sure to include this CSS file in your project

function AdminDashboard() {
    return (
        <div className="dashboard">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <div className="dashboard-menu">
                <Link to="/minting-report" className="dashboard-link">Minting Reports</Link>
                <Link to="/review-activities" className="dashboard-link">Review Activities</Link>
                <Link to="/analytics" className="dashboard-link">Analytics</Link>
            </div>
        </div>
    );
}

export default AdminDashboard;
