import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import React, { useEffect, useState, createContext, useContext } from 'react';

import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import AdminDashboard from './pages/admin-dashboard.jsx';
import StudentDashboard from './pages/student-dashboard.jsx';
import TeacherDashboard from './pages/teacher-dashboard.jsx';
import ForgotPassword from './pages/forgot-password.jsx';

const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';

// 1. Membuat Theme Context
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Tombol Toggle Dark Mode
export const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
        </button>
    );
};


const DashboardWrapper = ({ DashboardComponent }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const role = Cookies.get('user_role');
    const name = Cookies.get('user_name');
    const id = Cookies.get('user_id');

    if (role && name && id) {
      setIsAuthenticated(true);
      setUser({ id, name: decodeURIComponent(name), role });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = async () => {
    if (user?.id) {
      try {
        await fetch(`${API_BASE_URL}/logout_status.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        });
      } catch (error) {
        console.error("Error calling logout API:", error);
      }
    }
    Cookies.remove('user_role');
    Cookies.remove('user_id');
    Cookies.remove('user_name');
    navigate('/');
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Memuat...</div>;
  }

  return <DashboardComponent onLogout={handleLogout} user={user} />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin-dashboard" element={<DashboardWrapper DashboardComponent={AdminDashboard} />} />
          <Route path="/student-dashboard" element={<DashboardWrapper DashboardComponent={StudentDashboard} />} />
          <Route path="/teacher-dashboard" element={<DashboardWrapper DashboardComponent={TeacherDashboard} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;