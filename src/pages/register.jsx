// src/pages/register.jsx
import React, { useState, useEffect } from 'react'; // Tambahkan useEffect
// import '/src/styles.css'; // Pastikan path ini benar jika Anda memiliki CSS global

// Definisikan base URL untuk API jika belum ada (sesuaikan jika perlu)
const MODULE_API_BASE_URL = `http://localhost/COBAK_REACT/SRC/penjadwalan`;

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State baru untuk daftar kelas dan level kelas yang dipilih
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  // Ambil daftar kelas saat komponen dimuat
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      setErrorMessage(''); // Reset error message
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
          console.error("Gagal mengambil daftar kelas:", data.message);
          setClassesList([]);
          setErrorMessage("Tidak dapat memuat daftar kelas saat ini.");
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
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

    if (!firstName || !email || !password || !confirmPassword) {
      setErrorMessage('Semua kolom wajib diisi (Nama Depan, Email, Password, Konfirmasi Password).'); //
      return;
    }
    
    // Untuk registrasi siswa, kelas wajib dipilih
    if (!selectedClass) {
        setErrorMessage('Kelas wajib dipilih.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Masukkan alamat email yang valid.'); //
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.'); //
      return;
    }

    if (password.length < 6) {
        setErrorMessage('Password minimal harus 6 karakter.'); //
        return;
    }
    
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const response = await fetch('http://localhost/COBAK_REACT/SRC/register.php', { //
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: fullName, 
            email, 
            password,
            student_class_level: selectedClass // Kirim kelas yang dipilih
        }), 
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         const textResponse = await response.text();
        throw new Error(`Server response was not JSON: ${textResponse.substring(0,100)}...`); //
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message || 'Pendaftaran berhasil! Anda akan diarahkan ke halaman login.'); //
        setTimeout(() => {
            window.location.href = '/'; 
        }, 2500);
      } else {
        setErrorMessage(data.message || 'Pendaftaran gagal.'); //
      }
    } catch (error) {
      console.error('Error during registration fetch:', error);
      setErrorMessage(`Terjadi kesalahan: ${error.message}. Silakan coba lagi.`); //
    }
  };

  return (
    <div id="register-page" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4 font-sans"> {/* */}
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"> {/* */}
            <div className="text-center mb-8"> {/* */}
                <img 
                    src="src/assets/logo.png" 
                    alt="Logo" 
                    className="mx-auto h-20 w-20" //
                    onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src="https://placehold.co/80x80/3B82F6/FFFFFF?text=Logo"; 
                        e.target.alt="Placeholder Logo"
                    }}
                />
                <h1 className="text-3xl font-bold text-gray-800 mt-4">Buat Akun Siswa</h1> {/* Judul disesuaikan */}
                <p className="text-gray-600">Daftar untuk mengakses sistem</p> {/* */}
            </div>
            
            <form id="register-form" className="space-y-4" onSubmit={handleSubmit}> {/* */}
                {errorMessage && (
                  <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert"> {/* */}
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg text-center" role="alert"> {/* */}
                    {successMessage}
                  </div>
                )}

                <div>
                    <label htmlFor="reg-firstname" className="block text-sm font-medium text-gray-700 mb-1">Nama Depan</label> {/* */}
                    <input 
                      type="text" 
                      id="reg-firstname" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" //
                      placeholder="Nama Depan Anda" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="reg-lastname" className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang <span className="text-xs text-gray-500">(Opsional)</span></label> {/* */}
                    <input 
                      type="text" 
                      id="reg-lastname" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" //
                      placeholder="Nama Belakang Anda" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                
                {/* Dropdown Kelas untuk Siswa */}
                <div>
                    <label htmlFor="reg-class" className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <select
                        id="reg-class"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                        disabled={isLoadingClasses || classesList.length === 0}
                    >
                        <option value="">
                            {isLoadingClasses ? "Memuat kelas..." : (classesList.length === 0 ? "Tidak ada kelas tersedia" : "-- Pilih Kelas --")}
                        </option>
                        {classesList.map(cls => (
                            <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                        ))}
                    </select>
                    {classesList.length === 0 && !isLoadingClasses && <p className="text-xs text-red-500 mt-1">Tidak ada pilihan kelas. Hubungi admin.</p>}
                </div>

                <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label> {/* */}
                    <input 
                      type="email" 
                      id="reg-email" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" //
                      placeholder="email@anda.com" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label> {/* */}
                    <input 
                      type="password" 
                      id="reg-password" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" //
                      placeholder="••••••••" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label> {/* */}
                    <input 
                      type="password" 
                      id="reg-confirm-password" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" //
                      placeholder="••••••••" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"> {/* */}
                        Daftar
                    </button>
                </div>
            </form>
            <div className="mt-6 text-center"> {/* */}
                <p className="text-gray-600">Sudah punya akun? <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">Masuk di sini</a></p> {/* */}
            </div>
        </div>
    </div>
  );
}

export default Register;