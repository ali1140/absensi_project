import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';


import Login from './pages/login.jsx'; 
import Register from './pages/register.jsx'; 
import AdminDashboard from './pages/admin-dashboard.jsx'; 
import StudentDashboard from './pages/student-dashboard.jsx'; 
import TeacherDashboard from './pages/teacher-dashboard.jsx';

const DashboardWrapper = ({ DashboardComponent }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
  
    console.log("Logout berhasil, mengarahkan ke halaman login...");
    navigate('/'); 
  };
  return <DashboardComponent onLogout={handleLogout} />;
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
