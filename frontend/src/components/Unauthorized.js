import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Unauthorized Access</h1>
            <p>You do not have permission to view this page.</p>
            <Link to="/">Go Back Home</Link>
        </div>
    );
}

export default Unauthorized;
