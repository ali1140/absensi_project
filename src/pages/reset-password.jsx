import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/reset_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError(data.message || 'Terjadi kesalahan.');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Reset Password</h1>
                    <p className="text-gray-600 dark:text-gray-400">Masukkan password baru Anda.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg">{message}</div>}
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">{error}</div>}
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="••••••••" />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password Baru</label>
                        <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:bg-blue-400">
                        {isLoading ? 'Menyimpan...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}