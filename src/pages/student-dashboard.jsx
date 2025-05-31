import React from 'react';
import '/src/styles.css';

function StudentDashboard() {
  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">My Courses</div>
        <div className="card">Progress Tracking</div>
        <div className="card">Support Tickets</div>
      </div>
    </div>
  );
}

export default StudentDashboard;
