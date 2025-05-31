import React, { useState } from 'react';
import '/src/styles.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setErrorMessage('All fields are required');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('http://localhost/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });


      const data = await response.json();
      if (data.success) {
        window.location.href = '/login';
      } else {
        setErrorMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage('Registration error');
    }
  };

  return (
    <div id="register-page" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div class="text-center mb-8">
                <img src="https://via.placeholder.com/80" alt="Logo" class="mx-auto h-20 w-20"/>
                <h1 class="text-3xl font-bold text-gray-800 mt-4">Create Account</h1>
                <p class="text-gray-600">Register to access the system</p>
            </div>
            
            <form id="register-form" class="space-y-4">
                <div>
                    <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="reg-email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="your@email.com" required/>
                    <div id="reg-email-error" class="error-message hidden"></div>
                </div>
                
                <div>
                    <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" id="reg-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" required/>
                    <div id="reg-password-error" class="error-message hidden"></div>
                </div>
                
                <div>
                    <label for="reg-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input type="password" id="reg-confirm-password" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" required/>
                    <div id="confirm-password-error" class="error-message hidden"></div>
                </div>
                
                <div class="pt-2">
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Register
                    </button>
                </div>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-gray-600">Already have an account? <a href="/" onclick="showLoginPage()" class="text-blue-600 hover:text-blue-800 font-medium">Sign in here</a></p>
            </div>
        </div>
    </div>
  );
}

export default Register;
