import React, { useEffect, useState } from 'react';

function Dashboard({ token, role, onLogout }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Error fetching dashboard'));
  }, [token]);

  return (
    <div style={{ maxWidth: 500, margin: 'auto', marginTop: 100 }}>
      <h2>Dashboard</h2>
      <div>{message}</div>
      <div>Your role: <b>{role}</b></div>
      <button onClick={onLogout}>Logout</button>
      {/* Placeholder for modules */}
      <div style={{ marginTop: 30 }}>
        <h3>Modules</h3>
        <div>Module system coming soon...</div>
      </div>
    </div>
  );
}

export default Dashboard;