import React, { useState } from 'react';
import axios from 'axios';

const AddAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Make a POST request to your backend endpoint to add a new admin
      const response = await axios.post('http://localhost:3001/api/admin/register', { username, password });
      console.log(response.data); // Log the response from the server
      // Optionally, you can handle success feedback to the user here
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin. Please try again.'); // Set error message
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Add New Admin</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={handlePasswordChange} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Admin'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default AddAdmin;
