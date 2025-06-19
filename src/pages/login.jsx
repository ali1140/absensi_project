// src/pages/login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Cookies from 'js-cookie'; // Import library js-cookie
import '/src/styles.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(''); // Bersihkan pesan error sebelumnya

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost/COBAK_REACT/SRC/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Set cookies setelah login berhasil
        Cookies.set('user_id', data.user_id, { expires: 1/24, sameSite: 'Lax' }); // Cookie berlaku 1 jam
        Cookies.set('user_role', data.role, { expires: 1/24, sameSite: 'Lax' });
        Cookies.set('user_name', data.user_name, { expires: 1/24, sameSite: 'Lax' });


        // Redirect berdasarkan role
        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.role === 'student') {
          navigate('/student-dashboard');
        } else if (data.role === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          setErrorMessage('Unknown user role.');
        }
      } else {
        setErrorMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div id="login-page" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
                <img src="src/assets/logo.png" alt="Logo" className="mx-auto h-20 w-20" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/3B82F6/FFFFFF?text=Logo"; }}/>
                <h1 className="text-3xl font-bold text-gray-800 mt-4">Attendance System</h1>
                <p className="text-gray-600">Please sign in to continue</p>
            </div>

            <form id="login-form" className="space-y-6" onSubmit={handleSubmit}>
                {errorMessage && <div className="error-message text-red-500 text-center">{errorMessage}</div>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div id="email-error" className="error-message hidden"></div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      id="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div id="password-error" className="error-message hidden"></div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                    </div>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-500">Forgot password?</a>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                    Sign In
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-600">Don't have an account? <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">Register here</a></p>
            </div>
        </div>
    </div>
  );
}

export default Login;
