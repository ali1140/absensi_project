import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggleButton } from '../App.jsx'; // Impor tombol tema

const MODULE_API_BASE_URL = `http://localhost/COBAK_REACT/SRC/penjadwalan`;

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      setErrorMessage('');
      try {
        const response = await fetch(`${MODULE_API_BASE_URL}/get_classes.php`);
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gagal mengambil daftar kelas: ${response.status} ${errText.substring(0,100)}`);
        }
        const data = await response.json();
        if (data.success) {
          setClassesList(data.data || []);
        } else {
          setClassesList([]);
          setErrorMessage("Tidak dapat memuat daftar kelas saat ini.");
        }
      } catch (error) {
        setClassesList([]);
        setErrorMessage(`Terjadi kesalahan saat memuat kelas: ${error.message}`);
      }
      setIsLoadingClasses(false);
    };
    fetchClasses();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!firstName || !email || !password || !confirmPassword || !selectedClass) {
      setErrorMessage('Semua kolom wajib diisi.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
        setErrorMessage('Password minimal harus 6 karakter.');
        return;
    }
    
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const response = await fetch('http://localhost/COBAK_REACT/SRC/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: fullName, 
            email, 
            password,
            student_class_level: selectedClass
        }), 
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const textResponse = await response.text();
        throw new Error(`Server response was not JSON: ${textResponse.substring(0,100)}...`);
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message || 'Pendaftaran berhasil! Anda akan diarahkan ke halaman login.');
        setTimeout(() => {
            window.location.href = '/'; 
        }, 2500);
      } else {
        setErrorMessage(data.message || 'Pendaftaran gagal.');
      }
    } catch (error) {
      setErrorMessage(`Terjadi kesalahan: ${error.message}. Silakan coba lagi.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 font-sans">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md">
            
            <div className="text-center mb-8">
                <img 
                    src="src/assets/logo.png" 
                    alt="Logo" 
                    className="mx-auto h-20 w-20"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/3B82F6/FFFFFF?text=Logo"; }}
                />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-4">Buat Akun Siswa</h1>
                <p className="text-gray-600 dark:text-gray-400">Daftar untuk mengakses sistem</p>
            </div>
            
            <form id="register-form" className="space-y-4" onSubmit={handleSubmit}>
                {errorMessage && <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-800/30 dark:text-red-300 rounded-lg">{errorMessage}</div>}
                {successMessage && <div className="p-3 text-sm text-green-700 bg-green-100 dark:bg-green-800/30 dark:text-green-300 rounded-lg">{successMessage}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="reg-firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Depan</label>
                        <input type="text" id="reg-firstname" className="w-full input-field-dark" placeholder="Nama Depan" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="reg-lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Belakang</label>
                        <input type="text" id="reg-lastname" className="w-full input-field-dark" placeholder="Nama Belakang" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="reg-class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelas</label>
                    <select id="reg-class" className="w-full input-field-dark" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required disabled={isLoadingClasses || classesList.length === 0}>
                        <option value="">{isLoadingClasses ? "Memuat kelas..." : (classesList.length === 0 ? "Tidak ada kelas" : "-- Pilih Kelas --")}</option>
                        {classesList.map(cls => <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" id="reg-email" className="w-full input-field-dark" placeholder="email@anda.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input type="password" id="reg-password" className="w-full input-field-dark" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konfirmasi Password</label>
                    <input type="password" id="reg-confirm-password" className="w-full input-field-dark" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                        Daftar
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sudah punya akun? <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300">Masuk di sini</Link></p>
            </div>
        </div>
    </div>
  );
}

export default Register;
