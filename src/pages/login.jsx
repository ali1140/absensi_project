import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ThemeToggleButton } from '../App.jsx'; // Impor tombol tema

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost/COBAK_REACT/SRC/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        Cookies.set('user_id', data.user_id, { expires: 1/24, sameSite: 'Lax' });
        Cookies.set('user_role', data.role, { expires: 1/24, sameSite: 'Lax' });
        Cookies.set('user_name', data.user_name, { expires: 1/24, sameSite: 'Lax' });

        if (data.role === 'admin') navigate('/admin-dashboard');
        else if (data.role === 'student') navigate('/student-dashboard');
        else if (data.role === 'teacher') navigate('/teacher-dashboard');
        else setErrorMessage('Peran pengguna tidak diketahui.');
      } else {
        setErrorMessage(data.message || 'Login gagal.');
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-sans">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="absolute top-4 right-4">
                <ThemeToggleButton />
            </div>
            <div className="text-center mb-8">
                <img src="src/assets/logo.png" alt="Logo" className="mx-auto h-20 w-20" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/3B82F6/FFFFFF?text=Logo"; }}/>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4">Attendance System</h1>
                <p className="text-gray-600 dark:text-gray-400">Silakan masuk untuk melanjutkan</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-800/30 dark:text-red-300 rounded-lg">{errorMessage}</div>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="email@anda.com" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="••••••••" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"/>
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Ingat saya</label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Lupa password?</Link>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                    Masuk
                </button>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Belum punya akun? <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300">Daftar di sini</Link></p>
            </div>
        </div>
    </div>
  );
}
