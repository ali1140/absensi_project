// src/pages/student-dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix untuk ikon marker default Leaflet yang rusak dengan React
ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';
const WEB_BASE_URL = 'http://localhost/COBAK_REACT/src';

const Icon = ({ classes }) => <i className={classes}></i>;
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// PERUBAHAN: Komponen Materi Pembelajaran dengan tampilan kartu
const StudentMaterialsView = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null); // Menyimpan objek course, bukan hanya ID
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Ambil daftar mata pelajaran siswa
        fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?student_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const courseMap = new Map();
                    data.data.forEach(schedule => {
                        if (!courseMap.has(schedule.course_id)) {
                            courseMap.set(schedule.course_id, {
                                id: schedule.course_id,
                                name: schedule.course_name,
                                teacher: schedule.teacher_name
                            });
                        }
                    });
                    setCourses(Array.from(courseMap.values()));
                }
            });
    }, [user.id]);

    const handleCourseSelect = useCallback((course) => {
        setSelectedCourse(course);
        setIsLoading(true);
        fetch(`${API_BASE_URL}/get_materials.php?course_id=${course.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setMaterials(data.data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (selectedCourse) {
        // Tampilan detail materi untuk mata pelajaran yang dipilih
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <button onClick={() => setSelectedCourse(null)} className="btn-secondary mb-4">
                    <Icon classes="fas fa-arrow-left mr-2" /> Kembali ke Daftar Mapel
                </button>
                <h2 className="text-2xl font-bold mb-1">{selectedCourse.name}</h2>
                <p className="text-gray-600 mb-6">Daftar materi yang diunggah oleh guru.</p>
                
                {isLoading ? <div className="text-center py-5"><Icon classes="fas fa-spinner fa-spin"/></div> :
                <div className="space-y-3">
                    {materials.length > 0 ? materials.map(mat => (
                        <div key={mat.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg">{mat.title}</h3>
                            <p className="text-sm text-gray-600 my-1">{mat.description}</p>
                            <a href={`${WEB_BASE_URL}/${mat.file_path}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">
                                <Icon classes="fas fa-download mr-1"/> Unduh Berkas
                            </a>
                        </div>
                    )) : <p className="text-center text-gray-500 py-10">Belum ada materi untuk mata pelajaran ini.</p>}
                </div>
            }
            </div>
        );
    }

    // Tampilan daftar mata pelajaran dalam bentuk kartu
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Materi Pembelajaran</h2>
            <p className="text-gray-600 mb-6">Pilih mata pelajaran untuk melihat materi yang tersedia.</p>
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} onClick={() => handleCourseSelect(course)} className="p-5 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all transform hover:scale-105">
                            <div className="flex items-center mb-3">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
                                    <Icon classes="fas fa-book" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{course.name}</h3>
                                    <p className="text-sm text-gray-500">{course.teacher}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">Anda belum terdaftar di mata pelajaran manapun.</p>
            )}
        </div>
    );
};

// Komponen Pengaturan Akun Siswa
const SettingsView = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' });
            return;
        }
         if (newPassword.length < 6) {
            setMessage({ text: 'Password baru minimal 6 karakter.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/change_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ text: data.message, type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ text: data.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4">Ubah Password</h2>
            {message.text && (
                <div className={`p-3 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Password Saat Ini</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 w-full input-field" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password Baru</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 w-full input-field" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Konfirmasi Password Baru</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full input-field" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="btn-primary-attractive">
                        {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Komponen Rekap Presensi Visual
const AttendanceSummaryView = ({ studentId }) => {
    const [summaryData, setSummaryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/get_attendance_summary.php?student_id=${studentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSummaryData(data.data);
                }
            })
            .finally(() => setIsLoading(false));
    }, [studentId]);

    const chartOptions = {
        plugins: {
            legend: {
                position: 'top',
            },
        },
        maintainAspectRatio: false,
    };

    if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl" /></div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Rekapitulasi Presensi</h2>
            {summaryData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaryData.map(course => {
                        const data = {
                            labels: ['Hadir', 'Absen', 'Izin'],
                            datasets: [{
                                data: [course.summary.Present, course.summary.Absent, course.summary.Excused],
                                backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                                hoverBackgroundColor: ['#059669', '#DC2626', '#D97706'],
                            }]
                        };
                        const total = course.summary.Present + course.summary.Absent + course.summary.Excused;
                        return (
                            <div key={course.course_id} className="p-4 border rounded-lg">
                                <h3 className="font-bold text-center mb-2">{course.course_name}</h3>
                                <div className="h-48 w-full mx-auto">
                                   {total > 0 ? <Pie data={data} options={chartOptions} /> : <p className="text-center text-gray-500 pt-16">Belum ada data</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : <p className="text-center text-gray-500 py-5">Belum ada data rekapitulasi.</p>}
        </div>
    );
};

// Komponen Pengumuman untuk Siswa
const AnnouncementsViewStudent = ({ user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.student_class_level) {
            fetch(`${API_BASE_URL}/get_announcements.php?class_level=${encodeURIComponent(user.student_class_level)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setAnnouncements(data.data);
                })
                .finally(() => setIsLoading(false));
        } else if(user) {
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl" /></div>;

    return (
        <div className="space-y-4">
             <h2 className="text-xl font-semibold">Pengumuman</h2>
            {announcements.length > 0 ? announcements.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-500">Dari: {item.teacher_name} | Untuk: {item.class_level}</p>
                    <p className="mt-2">{item.content}</p>
                    <p className="text-xs text-gray-400 text-right mt-2">Dibuat pada: {new Date(item.created_at).toLocaleString()}</p>
                </div>
            )) : <p className="text-center text-gray-500 py-5 bg-white rounded-lg">Tidak ada pengumuman untuk kelas Anda saat ini.</p>}
        </div>
    );
};


// ... kode komponen lainnya yang tidak berubah ...
const VerificationCodeModal = ({ schedule, onClose, studentId, onAttendanceSuccess }) => {
    const [code, setCode] = useState(Array(6).fill(''));
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        if (schedule.class_type === 'Offline') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        setLocationError('');
                    },
                    (err) => {
                        setLocationError('Gagal mendapatkan lokasi. Pastikan izin lokasi telah diberikan pada browser Anda.');
                        console.error(err);
                    },
                    { enableHighAccuracy: true } // Opsi untuk akurasi lebih tinggi
                );
            } else {
                setLocationError('Browser Anda tidak mendukung Geolocation.');
            }
        }
    }, [schedule.class_type]);

    // PERBAIKAN: Memperbaiki cara handle input kode
    const handleCodeChange = (e, index) => {
        const { value } = e.target;
        if (/^[0-9]?$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5 && e.target.nextElementSibling) {
                e.target.nextElementSibling.focus();
            }
        }
    };
    
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0 && e.target.previousElementSibling) {
            e.target.previousElementSibling.focus();
        }
    };

    const handleSubmit = async () => {
        if (schedule.class_type === 'Offline' && !location) {
            setError('Lokasi Anda belum terdeteksi. Tidak dapat melanjutkan presensi.');
            return;
        }

        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Harap masukkan 6 digit kode.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        
        try {
            const payload = {
                student_id: studentId,
                schedule_id: schedule.schedule_id,
                code: fullCode,
                latitude: location?.lat,
                longitude: location?.lng,
            };

            const response = await fetch(`${API_BASE_URL}/submit_attendance_code.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                alert(`Presensi untuk ${schedule.course_name} berhasil!`);
                onAttendanceSuccess();
                onClose();
            } else {
                setError(data.message || 'Terjadi kesalahan.');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="modal-backdrop" className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="btn-close-modal"><Icon classes="fas fa-times" /></button>
                <h3 className="text-xl font-semibold text-gray-800">Input Kode Presensi</h3>
                <p className="text-gray-600 mb-2">Mata Pelajaran: <span className="font-bold">{schedule.course_name}</span></p>
                <p className="text-sm text-gray-500 mb-4">Tipe Kelas: <span className={`font-semibold ${schedule.class_type === 'Offline' ? 'text-red-600' : 'text-green-600'}`}>{schedule.class_type}</span></p>
                
                {schedule.class_type === 'Offline' && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Lokasi Anda Saat Ini:</h4>
                        {locationError && <p className="text-red-500 text-xs">{locationError}</p>}
                        <div className="h-40 w-full rounded-lg overflow-hidden border">
                            {location ? (
                                <MapContainer center={[location.lat, location.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[location.lat, location.lng]}></Marker>
                                </MapContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                    <p className="text-gray-500 text-sm">Mendeteksi lokasi...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p className="text-gray-600 mb-4">Masukkan 6 digit kode dari guru Anda.</p>
                <div className="flex justify-center space-x-2 mb-4">
                    {code.map((digit, index) => (
                        <input key={index} type="text" maxLength="1" value={digit} onChange={(e) => handleCodeChange(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} className="w-12 h-14 text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={isSubmitting} />
                    ))}
                </div>
                {error && <p className="text-red-500 text-center text-sm mb-4 p-2 bg-red-50 rounded-md">{error}</p>}
                <button onClick={handleSubmit} disabled={isSubmitting || (schedule.class_type === 'Offline' && !location)} className="w-full btn-primary-attractive">
                    {isSubmitting ? 'Mengirim...' : 'Kirim Presensi'}
                </button>
            </div>
        </div>
    );
};
const StudentScheduleCalendar = ({ schedules = [], isLoading }) => {
    const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const schedulesByDay = useMemo(() => daysOfWeek.reduce((acc, day) => {
        acc[day] = schedules.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase()).sort((a, b) => a.start_time.localeCompare(b.start_time));
        return acc;
    }, {}), [schedules, daysOfWeek]);

    if (isLoading) return <div className="text-center p-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /></div>;
    if (schedules.length === 0) return <div className="text-center text-gray-500 p-10">Tidak ada jadwal pelajaran yang ditemukan.</div>;

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="bg-gray-50 rounded-lg p-3 min-h-[150px]">
                        <h3 className="font-semibold text-center text-gray-700 border-b pb-2 mb-3">{day}</h3>
                        <div className="space-y-3">
                            {schedulesByDay[day] && schedulesByDay[day].length > 0 ? schedulesByDay[day].map(schedule => (
                                <div key={schedule.id} className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500 overflow-hidden">
                                    <p className="font-bold text-sm text-gray-800 break-words">{schedule.course_name}</p>
                                    <p className="text-xs text-gray-600 break-words">Guru: {schedule.teacher_name}</p>
                                    <p className="text-xs text-gray-500 mt-1"><Icon classes="far fa-clock mr-1" />{schedule.start_time_formatted} - {schedule.end_time_formatted}</p>
                                    {schedule.room_number && <p className="text-xs text-gray-500"><Icon classes="fas fa-map-marker-alt mr-1" />Ruang {schedule.room_number}</p>}
                                </div>
                            )) : <p className="text-xs text-gray-400 text-center py-4">Libur</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const UpcomingClasses = ({ schedules, isLoading }) => {
    const { upcomingSchedules, title } = useMemo(() => {
        if (!schedules || schedules.length === 0) {
            return { upcomingSchedules: [], title: "Jadwal Berikutnya" };
        }

        const now = new Date();
        const daysOrder = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const todayDayName = daysOrder[now.getDay()];

        const remainingToday = schedules
            .filter(s => {
                if (s.day_of_week.toLowerCase() !== todayDayName.toLowerCase()) return false;
                const endTime = new Date(`${now.toDateString()} ${s.end_time}`);
                return now < endTime;
            })
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        if (remainingToday.length > 0) {
            return { upcomingSchedules: remainingToday, title: "Sisa Jadwal Hari Ini" };
        }

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowDayName = daysOrder[tomorrow.getDay()];
        
        const tomorrowSchedules = schedules
            .filter(s => s.day_of_week.toLowerCase() === tomorrowDayName.toLowerCase())
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        return { upcomingSchedules: tomorrowSchedules, title: `Jadwal untuk Besok (${tomorrowDayName})` };

    }, [schedules]);

    if (isLoading) return <div className="text-center py-5"><Icon classes="fas fa-spinner fa-spin"/></div>;
    
    return (
        <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
            
            {upcomingSchedules.length > 0 ? (
                <div className="space-y-3">
                    {upcomingSchedules.map(item => (
                        <div key={item.id || item.schedule_id} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="p-3 bg-blue-100 text-blue-800 rounded-lg mr-4">
                                <Icon classes="far fa-clock" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-gray-800 text-sm break-words">{item.course_name}</h4>
                                <p className="text-xs text-gray-600 font-medium">{item.start_time_formatted} - {item.end_time_formatted}</p>
                                <p className="text-xs text-gray-500 break-words">Guru: {item.teacher_name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-10">Tidak ada jadwal berikutnya.</p>
            )}
        </>
    );
};
const AttendanceInputView = ({ studentId }) => {
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const fetchTodaySchedules = useCallback(() => {
        if (!studentId) return;
        fetch(`${API_BASE_URL}/get_todays_classes_status.php?student_id=${studentId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTodaySchedules(data.data);
                } else {
                    console.error("Error from backend:", data.message);
                    setTodaySchedules([]);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [studentId]);

    useEffect(() => {
        setIsLoading(true);
        fetchTodaySchedules();
        const interval = setInterval(fetchTodaySchedules, 15000);
        return () => clearInterval(interval);
    }, [fetchTodaySchedules]);

    if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl" /></div>;

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-2">Input Presensi Hari Ini</h2>
                <p className="text-sm text-gray-600 mb-6">Pilih mata pelajaran yang sesi presensinya telah dibuka oleh guru (kartu berwarna biru).</p>
                {todaySchedules.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Tidak ada jadwal pelajaran untuk hari ini.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaySchedules.map(schedule => {
                            const buttonDisabled = !schedule.is_active || schedule.has_attended;
                            let buttonText = 'Belum Dibuka';
                            if (schedule.has_attended) buttonText = 'Sudah Presensi';
                            else if (schedule.is_active) buttonText = 'Input Presensi';

                            return (
                                <div key={schedule.schedule_id} className={`rounded-lg shadow-md border flex flex-col transition-all duration-300 ${schedule.is_active ? 'bg-blue-50 border-blue-300' : 'bg-gray-100 border-gray-200'}`}>
                                    <div className="p-5 flex-grow">
                                        <h3 className="font-bold text-gray-800 truncate">{schedule.course_name}</h3>
                                        <p className="text-sm text-gray-600">{schedule.teacher_name}</p>
                                        <p className="text-sm text-gray-500 mt-2"><Icon classes="far fa-clock mr-1" />{schedule.start_time_formatted} - {schedule.end_time_formatted}</p>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-3 gap-2 text-xs">
                                            <div className="flex items-center"><Icon classes="fas fa-check-circle text-green-500 mr-2" /> Hadir: <span className="font-semibold ml-1">{schedule.present_count}</span></div>
                                            <div className="flex items-center"><Icon classes="fas fa-times-circle text-red-500 mr-2" /> Absen: <span className="font-semibold ml-1">{schedule.absent_count}</span></div>
                                            <div className="flex items-center"><Icon classes="fas fa-info-circle text-orange-500 mr-2" /> Izin: <span className="font-semibold ml-1">{schedule.excused_count}</span></div>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white border-t rounded-b-lg">
                                        <button onClick={() => setSelectedSchedule(schedule)} disabled={buttonDisabled} className={`w-full text-white font-medium py-2 px-4 rounded-lg transition 
                                            ${schedule.has_attended ? 'bg-green-500 cursor-not-allowed' : schedule.is_active ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                                            <Icon classes={`fas ${schedule.has_attended ? 'fa-check' : 'fa-user-check'} mr-2`} />
                                            {buttonText}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {selectedSchedule && (
                <VerificationCodeModal 
                    schedule={selectedSchedule} 
                    onClose={() => setSelectedSchedule(null)}
                    studentId={studentId}
                    onAttendanceSuccess={fetchTodaySchedules}
                />
            )}
        </>
    );
};

// Komponen Utama Dasbor Siswa
export default function StudentDashboard({ onLogout, user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState({ schedule: true });
  // PERBAIKAN: Menggunakan state untuk studentInfo agar bisa diperbarui
  const [studentInfo, setStudentInfo] = useState(user);

  useEffect(() => {
    const studentId = user?.id;
    if (!studentId) return;

    setIsLoading(p => ({...p, schedule: true}));

    // Ambil data lengkap siswa untuk memastikan data selalu terbaru
    fetch(`${API_BASE_URL}/get_users.php?id=${studentId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                setStudentInfo(data.data[0]); // Perbarui state dengan data dari DB
            }
        });

    // Ambil jadwal siswa
    fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?student_id=${studentId}`)
        .then(res => res.json())
        .then(data => { if (data.success) setScheduleData(data.data); })
        .catch(console.error)
        .finally(() => setIsLoading(p => ({ ...p, schedule: false })));
  }, [user?.id]);

  const studentUser = {
    ...studentInfo,
    avatarUrl: `https://placehold.co/50x50/7C3AED/FFFFFF?text=${(studentInfo?.name || user.name)?.substring(0,2).toUpperCase() || 'SW'}`,
  };

  const studentNavItems = [
    { name: 'Dashboard', icon: 'fas fa-home', view: 'dashboard' },
    { name: 'Input Presensi', icon: 'fas fa-user-check', view: 'verify-attendance' },
    { name: 'Rekap Presensi', icon: 'fas fa-chart-pie', view: 'my-summary' },
    { name: 'Pengumuman', icon: 'fas fa-bullhorn', view: 'announcements' },
    { name: 'Materi Pelajaran', icon: 'fas fa-book-reader', view: 'materials' },
    { name: 'Pengaturan', icon: 'fas fa-cog', view: 'settings' },
  ];

  const handleNavigate = (viewName) => {
    setActiveView(viewName);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const renderContent = () => {
      switch(activeView) {
          case 'dashboard':
              return (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Jadwal Pelajaran Minggu Ini</h2>
                            <StudentScheduleCalendar schedules={scheduleData} isLoading={isLoading.schedule} />
                        </div>
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6">
                            <UpcomingClasses schedules={scheduleData} isLoading={isLoading.schedule} />
                        </div>
                    </div>
                </div>
              );
          case 'verify-attendance':
              return <AttendanceInputView studentId={user.id} />;
          case 'my-summary':
              return <AttendanceSummaryView studentId={user.id} />;
          case 'announcements':
              return <AnnouncementsViewStudent user={studentUser} />;
          case 'materials':
              return <StudentMaterialsView user={user} />;
          case 'settings':
              return <SettingsView user={user} />;
          default:
              return <div>Pilih Menu</div>;
      }
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <div className={`sidebar bg-white w-64 min-h-screen shadow-lg transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40`}>
        <div className="p-4">
            <div className="flex items-center space-x-3 mb-6"><img src={studentUser.avatarUrl} alt="User" className="h-12 w-12 rounded-full" /><div><p className="font-medium">{studentUser.name}</p><p className="text-sm text-gray-500">{studentUser.role}</p></div></div>
            <nav className="space-y-2">{studentNavItems.map(item => <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); handleNavigate(item.view); }} className={`flex items-center space-x-3 p-3 rounded-lg ${activeView === item.view ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}><Icon classes={`${item.icon} w-5 text-center`} /><span>{item.name}</span></a>)}</nav>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t"><button onClick={onLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 w-full"><Icon classes="fas fa-sign-out-alt w-5 text-center" /><span>Logout</span></button></div>
      </div>
      <div className="main-content flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{studentNavItems.find(item => item.view === activeView)?.name || 'Dashboard'}</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} id="sidebar-toggle" className="p-2 rounded-lg hover:bg-gray-200 md:hidden"><Icon classes="fas fa-bars" /></button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
