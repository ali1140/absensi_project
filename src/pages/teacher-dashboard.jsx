// StudentDashboard.jsx
// Pastikan Tailwind CSS dan Font Awesome sudah terkonfigurasi di proyek Anda

import React, { useState, useEffect } from 'react';

// Komponen Helper untuk Ikon (bisa diimpor dari file terpisah)
const Icon = ({ classes }) => <i className={classes}></i>;

// Komponen Sidebar (bisa diimpor dari file terpisah jika sudah ada)
const Sidebar = ({ user, navItems, onNavigate, activeView, onLogout, isSidebarOpen, logoText = "Attendance" }) => {
  return (
    <div className={`sidebar bg-white text-gray-800 w-64 min-h-screen shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static fixed md:z-40`}>
      <div className="p-4 flex items-center space-x-3 border-b border-gray-200">
        <img 
          src={user.logoUrl || `https://placehold.co/40x40/3B82F6/FFFFFF?text=${logoText.substring(0,1)}S`} 
          alt="Logo" 
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/cccccc/ffffff?text=L"; }}
        />
        <span className="logo-text font-bold text-xl text-gray-800">{logoText}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <img 
            src={user.avatarUrl || `https://placehold.co/50x50/E2E8F0/A0AEC0?text=${user.name ? user.name.substring(0,2).toUpperCase() : 'AU'}`} 
            alt="User" 
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/ffffff?text=U"; }}
          />
          <div>
            <p className="font-medium text-gray-800">{user.name || "Nama Pengguna"}</p>
            <p className="text-sm text-gray-500">{user.role || "Peran Pengguna"}</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map(item => (
            <a 
              key={item.name} 
              href={item.href || "#"} 
              onClick={(e) => { 
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick(item.view); 
                } else if (onNavigate) {
                  e.preventDefault();
                  onNavigate(item.view);
                }
              }}
              className={`nav-item flex items-center space-x-3 p-3 rounded-lg ${activeView === item.view ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              {item.icon && <Icon classes={`${item.icon} w-5 text-center`} />}
              <span className="sidebar-text">{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        {/* Tombol Logout sekarang memanggil prop onLogout */}
        <button onClick={onLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 w-full">
          <Icon classes="fas fa-sign-out-alt w-5 text-center" />
          <span className="sidebar-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Terima prop onLogout dari DashboardWrapper (via App.jsx)
export default function StudentDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
  const [verificationResult, setVerificationResult] = useState('');
  const [showVerificationUI, setShowVerificationUI] = useState(false);

  const studentUser = {
    name: "liakbar", 
    role: "Student",
    avatarUrl: "https://placehold.co/50x50/7C3AED/FFFFFF?text=LA", 
    logoUrl: "https://placehold.co/40x40/10B981/FFFFFF?text=S" 
  };

  const studentNavItems = [
    { name: 'Dashboard', icon: 'fas fa-home', view: 'dashboard' },
    { name: 'My Attendance', icon: 'fas fa-calendar-check', view: 'my-attendance', onClick: () => { setActiveView('my-attendance'); setShowVerificationUI(true); } },
    { name: 'My Courses', icon: 'fas fa-book', view: 'my-courses' },
    { name: 'Statistics', icon: 'fas fa-chart-bar', view: 'statistics' },
    { name: 'Settings', icon: 'fas fa-cog', view: 'settings' },
  ];
  
  const handleNavigate = (viewName) => {
    setActiveView(viewName);
    if (viewName !== 'my-attendance') {
        setShowVerificationUI(false);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fungsi handleStudentLogout akan memanggil onLogout dari props
  const handleStudentLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.error("Fungsi onLogout tidak ditemukan di props StudentDashboard.");
    }
  };

  const handleVerificationCodeChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) { 
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 5 && e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
      }
    }
  };
  
  const handleVerificationKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0 && e.target.previousElementSibling) {
      e.target.previousElementSibling.focus();
    }
  };

  const handleSubmitAttendance = () => {
    const code = verificationCode.join('');
    if (code.length === 6) {
      console.log("Kode Verifikasi Absensi Siswa:", code);
      setVerificationResult("Absensi berhasil diverifikasi!"); 
      setVerificationCode(Array(6).fill('')); 
    } else {
      setVerificationResult("Harap masukkan 6 digit kode verifikasi.");
    }
  };
  
  useEffect(() => {
    if (activeView === 'dashboard' || activeView === 'statistics') {
        const canvas = document.getElementById('studentAttendanceChart'); 
        if (canvas) {
          const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#E9E9E9';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#60A5FA'; 
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Placeholder Student Attendance Chart", canvas.width / 2, canvas.height / 2);
            }
        }
    }
  }, [activeView]);

  const recentAttendanceData = [
    { date: "May 15, 2023", course: "Mathematics", status: "Present", time: "09:00 AM", statusClass: "attendance-dot present" },
    { date: "May 14, 2023", course: "Physics", status: "Late", time: "10:15 AM", statusClass: "attendance-dot late" },
    { date: "May 12, 2023", course: "Chemistry", status: "Present", time: "08:30 AM", statusClass: "attendance-dot present" },
    { date: "May 10, 2023", course: "Biology", status: "Absent", time: "11:00 AM", statusClass: "attendance-dot absent" },
  ];

  const upcomingClassesData = [
    { name: "Mathematics", details: "Tomorrow, 09:00 AM - Room 203", icon: "fas fa-book", color: "blue" },
    { name: "Chemistry Lab", details: "May 17, 02:00 PM - Lab 5", icon: "fas fa-flask", color: "green" },
    { name: "Physics", details: "May 18, 10:00 AM - Room 105", icon: "fas fa-atom", color: "purple" },
  ];
  
  const colorClasses = {
    blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-800' },
    green: { iconBg: 'bg-green-100', iconText: 'text-green-800' },
    purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-800' },
  };

  return (
    <div className="flex min-h-screen font-sans antialiased text-gray-900">
      <Sidebar 
        user={studentUser} 
        navItems={studentNavItems} 
        onNavigate={handleNavigate} 
        activeView={activeView} 
        onLogout={handleStudentLogout} // Teruskan fungsi logout yang benar
        isSidebarOpen={isSidebarOpen}
        logoText="Student Portal"
      />
      <div className="main-content flex-1 p-4 sm:p-8 bg-gray-100 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <button onClick={toggleSidebar} id="sidebar-toggle" className="p-2 rounded-lg hover:bg-gray-200 md:hidden">
            <Icon classes="fas fa-bars text-gray-700" />
          </button>
        </div>

        {showVerificationUI && activeView === 'my-attendance' && (
          <div id="student-verification-section" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Verify Attendance</h2>
            <p className="text-gray-600 mb-4">Enter the 6-digit verification code provided by your teacher to mark your attendance.</p>
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-6">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleVerificationCodeChange(e, index)}
                    onKeyDown={(e) => handleVerificationKeyDown(e, index)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 verification-input"
                  />
                ))}
              </div>
              <button 
                onClick={handleSubmitAttendance} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                Submit Attendance
              </button>
            </div>
            {verificationResult && (
              <div id="verification-result" className={`mt-4 text-center p-3 rounded-md ${verificationResult.includes("berhasil") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <p className="font-medium">
                  <Icon classes={`fas ${verificationResult.includes("berhasil") ? 'fa-check-circle' : 'fa-times-circle'} mr-2`} />
                  {verificationResult}
                </p>
              </div>
            )}
          </div>
        )}
        
        {(activeView === 'dashboard' && !showVerificationUI) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Total Classes</p><h3 className="text-2xl font-bold mt-1 text-gray-800">24</h3></div>
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600"><Icon classes="fas fa-calendar-alt text-xl" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Present</p><h3 className="text-2xl font-bold mt-1 text-gray-800">20</h3></div>
                  <div className="p-3 rounded-full bg-green-50 text-green-600"><Icon classes="fas fa-check-circle text-xl" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Attendance Rate</p><h3 className="text-2xl font-bold mt-1 text-gray-800">83%</h3></div>
                  <div className="p-3 rounded-full bg-purple-50 text-purple-600"><Icon classes="fas fa-chart-line text-xl" /></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Attendance</h2>
                <button className="text-blue-600 hover:text-blue-800">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAttendanceData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.course}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${item.status === 'Present' ? 'bg-green-500' : item.status === 'Late' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                          {item.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Overview</h2>
                <div className="h-64"><canvas id="studentAttendanceChart"></canvas></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Classes</h2>
                <div className="space-y-4">
                  {upcomingClassesData.map((item, index) => (
                     <div key={index} className="flex items-start p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className={`${colorClasses[item.color]?.iconBg || 'bg-gray-100'} ${colorClasses[item.color]?.iconText || 'text-gray-800'} p-2 rounded-lg mr-3`}>
                            <Icon classes={item.icon} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.details}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {activeView === 'my-courses' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Mata Kuliah Saya (Belum Diimplementasikan)</div>}
        {activeView === 'statistics' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Statistik Detail (Belum Diimplementasikan) <div className="h-64 mt-4"><canvas id="studentAttendanceChart"></canvas></div></div>}
        {activeView === 'settings' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Pengaturan Akun (Belum Diimplementasikan)</div>}
      </div>
    </div>
  );
}
