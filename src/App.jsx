import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import '/src/styles.css';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import AdminDashboard from './pages/admin-dashboard.jsx';
import StudentDashboard from './pages/student-dashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
