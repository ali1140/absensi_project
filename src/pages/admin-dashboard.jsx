import React from 'react';
import '/src/styles.css';

function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">Manage Users</div>
        <div className="card">View Analytics</div>
        <div className="card">System Settings</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
