
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';

export default function ForgotPassword() {
    const [stage, setStage] = useState('enterEmail'); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/forgot_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(data.message);
                setStage('enterCode');
                setCountdown(300); // 5 menit
            } else {
                setError(data.message || 'Terjadi kesalahan.');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
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
                body: JSON.stringify({ email, token: code, password }),
            });
            const data = await response.json();
            if (data.success) {
                setMessage(data.message + " Anda akan diarahkan ke halaman login.");
                setStage('finished');
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError(data.message || 'Gagal mereset password.');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderEnterEmail = () => (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Lupa Password</h1>
                <p className="text-gray-600 dark:text-gray-400">Masukkan email Anda untuk menerima kode verifikasi.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-6">
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">{error}</div>}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="email@anda.com" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:bg-blue-400">
                    {isLoading ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
                </button>
            </form>
        </>
    );

    const renderEnterCode = () => (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Verifikasi Kode</h1>
                <p className="text-gray-600 dark:text-gray-400">Masukkan kode 6 digit dan password baru Anda.</p>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-4">
                {message && <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg">{message}</div>}
                {error && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">{error}</div>}
                
                <div className="p-3 text-sm text-center text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-lg">
                    <p>Kode akan hangus dalam: <strong className="font-mono">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong></p>
                </div>

                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Verifikasi</label>
                    <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} required maxLength="6" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" placeholder="123456" />
                </div>
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
        </>
    );

    const renderFinished = () => (
        <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Berhasil!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4">{message}</p>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
                {stage === 'enterEmail' && renderEnterEmail()}
                {stage === 'enterCode' && renderEnterCode()}
                {stage === 'finished' && renderFinished()}
                 
                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Kembali ke Login</Link>
                </div>
            </div>
        </div>
    );
}