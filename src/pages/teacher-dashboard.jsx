// TeacherDashboard.jsx
// Pastikan Tailwind CSS dan Font Awesome sudah terkonfigurasi di proyek Anda

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import library js-cookie

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
export default function TeacherDashboard({ onLogout, user }) { // Terima prop user
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
  const [verificationResult, setVerificationResult] = useState('');
  const [showVerificationUI, setShowVerificationUI] = useState(false);

  // Gunakan data user dari props
  const teacherUser = {
    name: user.name,
    role: user.role,
    avatarUrl: `https://placehold.co/50x50/7C3AED/FFFFFF?text=${user.name ? user.name.substring(0,2).toUpperCase() : 'TA'}`,
    logoUrl: "https://placehold.co/40x40/10B981/FFFFFF?text=T"
  };

  const teacherNavItems = [
    { name: 'Dashboard', icon: 'fas fa-home', view: 'dashboard' },
    { name: 'Manage Attendance', icon: 'fas fa-calendar-check', view: 'manage-attendance', onClick: () => { setActiveView('manage-attendance'); setShowVerificationUI(true); } },
    { name: 'My Courses', icon: 'fas fa-book', view: 'my-courses' },
    { name: 'Statistics', icon: 'fas fa-chart-bar', view: 'statistics' },
    { name: 'Settings', icon: 'fas fa-cog', view: 'settings' },
  ];

  const handleNavigate = (viewName) => {
    setActiveView(viewName);
    if (viewName !== 'manage-attendance') {
        setShowVerificationUI(false);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fungsi handleTeacherLogout akan memanggil onLogout dari props
  const handleTeacherLogout = () => {
    // onLogout sudah menangani penghapusan cookie dan pembaruan status di backend melalui App.jsx
    if (onLogout) {
      onLogout();
    } else {
      console.error("Fungsi onLogout tidak ditemukan di props TeacherDashboard.");
    }
  };

  const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit number
    setVerificationCode(code.split(''));
    setVerificationResult(`Kode verifikasi baru: ${code}`);
    // Ideally, this code would be sent to a backend and associated with a specific class/session
  };

  useEffect(() => {
    if (activeView === 'dashboard' || activeView === 'statistics') {
        const canvas = document.getElementById('teacherAttendanceChart');
        if (canvas) {
          const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#E9E9E9';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#60A5FA';
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Placeholder Teacher Attendance Chart", canvas.width / 2, canvas.height / 2);
            }
        }
    }
  }, [activeView]);

  const recentAttendanceData = [
    { date: "May 15, 2023", course: "Mathematics", class: "X IPA 1", present: 28, absent: 2 },
    { date: "May 14, 2023", course: "Physics", class: "XI IPS 2", present: 25, absent: 5 },
    { date: "May 12, 2023", course: "Chemistry", class: "XII Bahasa 1", present: 20, absent: 0 },
  ];

  const upcomingClassesData = [
    { name: "Mathematics", details: "Today, 10:00 AM - Room 203 (X IPA 1)", icon: "fas fa-book", color: "blue" },
    { name: "Physics", details: "Tomorrow, 09:00 AM - Lab 3 (XI IPS 2)", icon: "fas fa-flask", color: "green" },
  ];

  const colorClasses = {
    blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-800' },
    green: { iconBg: 'bg-green-100', iconText: 'text-green-800' },
    purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-800' },
  };


  return (
    <div className="flex min-h-screen font-sans antialiased text-gray-900">
      <Sidebar
        user={teacherUser}
        navItems={teacherNavItems}
        onNavigate={handleNavigate}
        activeView={activeView}
        onLogout={handleTeacherLogout}
        isSidebarOpen={isSidebarOpen}
        logoText="Teacher Portal"
      />
      <div className="main-content flex-1 p-4 sm:p-8 bg-gray-100 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <button onClick={toggleSidebar} id="sidebar-toggle" className="p-2 rounded-lg hover:bg-gray-200 md:hidden">
            <Icon classes="fas fa-bars text-gray-700" />
          </button>
        </div>

        {showVerificationUI && activeView === 'manage-attendance' && (
          <div id="teacher-attendance-management" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Attendance Codes</h2>
            <p className="text-gray-600 mb-4">Generate and distribute unique 6-digit codes for students to verify their attendance.</p>
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-6">
                {verificationCode.map((digit, index) => (
                  <span
                    key={index}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl font-bold border border-blue-300 bg-blue-50 text-blue-800 rounded-lg"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <button
                onClick={generateVerificationCode}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
              >
                Generate New Code
              </button>
            </div>
            {verificationResult && (
              <div id="verification-result" className={`mt-4 text-center p-3 rounded-md bg-green-100 text-green-700`}>
                <p className="font-medium">
                  <Icon classes={`fas fa-check-circle mr-2`} />
                  {verificationResult}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-3 text-center">Bagikan kode ini kepada siswa di kelas Anda.</p>
          </div>
        )}

        {(activeView === 'dashboard' && !showVerificationUI) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Total Classes Taught</p><h3 className="text-2xl font-bold mt-1 text-gray-800">5</h3></div>
                  <div className="p-3 rounded-full bg-blue-50 text-blue-600"><Icon classes="fas fa-chalkboard-teacher text-xl" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Total Courses</p><h3 className="text-2xl font-bold mt-1 text-gray-800">3</h3></div>
                  <div className="p-3 rounded-full bg-green-50 text-green-600"><Icon classes="fas fa-book-open text-xl" /></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500">Avg. Attendance Rate</p><h3 className="text-2xl font-bold mt-1 text-gray-800">92%</h3></div>
                  <div className="p-3 rounded-full bg-purple-50 text-purple-600"><Icon classes="fas fa-chart-line text-xl" /></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Attendance Records</h2>
                <button className="text-blue-600 hover:text-blue-800">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAttendanceData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.course}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{item.present}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{item.absent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Trends</h2>
                <div className="h-64"><canvas id="teacherAttendanceChart"></canvas></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Classes to Teach</h2>
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
        {activeView === 'my-courses' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Mata Pelajaran Saya (Belum Diimplementasikan)</div>}
        {activeView === 'statistics' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Statistik Detail (Belum Diimplementasikan) <div className="h-64 mt-4"><canvas id="teacherAttendanceChart"></canvas></div></div>}
        {activeView === 'settings' && <div className="text-gray-700 bg-white p-6 rounded-xl shadow-sm">Tampilan Pengaturan Akun (Belum Diimplementasikan)</div>}
      </div>
    </div>
  );
}
