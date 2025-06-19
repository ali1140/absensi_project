import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import library js-cookie
import React, { useEffect, useState } from 'react';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import AdminDashboard from './pages/admin-dashboard.jsx';
import StudentDashboard from './pages/student-dashboard.jsx';
import TeacherDashboard from './pages/teacher-dashboard.jsx';

// URL untuk endpoint logout status
const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';

const DashboardWrapper = ({ DashboardComponent }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const role = Cookies.get('user_role');
    const name = Cookies.get('user_name');
    const id = Cookies.get('user_id');

    if (role && name && id) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(decodeURIComponent(name)); // Decode nama pengguna
      setUserId(id);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserName(null);
      setUserId(null);
      navigate('/'); // Redirect ke login jika tidak ada cookie
    }
  }, [navigate]);

  const handleLogout = async () => {
    // Panggil API untuk memperbarui status pengguna menjadi 'inactive'
    if (userId) {
      try {
        const response = await fetch(`${API_BASE_URL}/logout_status.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        const data = await response.json();
        if (!data.success) {
          console.error("Gagal memperbarui status logout di backend:", data.message);
        }
      } catch (error) {
        console.error("Error saat memanggil API logout status:", error);
      }
    }

    // Hapus cookies dan redirect
    Cookies.remove('user_role');
    Cookies.remove('user_id');
    Cookies.remove('user_name');
    console.log("Logout berhasil, mengarahkan ke halaman login...");
    navigate('/');
  };

  // Tampilkan loading atau redirect jika belum terautentikasi
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-medium text-gray-700">Memuat...</div>;
  }

  // Render dashboard yang sesuai jika terautentikasi
  return <DashboardComponent onLogout={handleLogout} user={{ id: userId, name: userName, role: userRole }} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin-dashboard"
          element={<DashboardWrapper DashboardComponent={AdminDashboard} />}
        />
        <Route
          path="/student-dashboard"
          element={<DashboardWrapper DashboardComponent={StudentDashboard} />}
        />
        <Route
          path="/teacher-dashboard"
          element={<DashboardWrapper DashboardComponent={TeacherDashboard} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
