import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';  // Ensure you have this CSS file in the same directory

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:3001/api/admin/login', { username, password });
            localStorage.setItem('adminToken', data.token); // Store the token in local storage
            localStorage.setItem('userRole', 'admin'); // Set user role as 'admin'
            navigate('/admin-dashboard'); // Navigate to admin dashboard
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed! Check console for more information.');
        }
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <h1>Admin Login</h1>
                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="text"
                        className="input-field"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                    <input
                        type="password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
