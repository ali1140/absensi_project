// src/pages/teacher-dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC';
const WEB_BASE_URL = 'http://localhost/COBAK_REACT/src'; 

const Icon = ({ classes }) => <i className={classes}></i>;

// Modal Generate Kode dengan pilihan Tipe Kelas
const GenerateCodeModal = ({ schedule, onClose, onCodeGenerated }) => {
    const [durationType, setDurationType] = useState('schedule_end');
    const [customMinutes, setCustomMinutes] = useState(5);
    const [classType, setClassType] = useState('Offline');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/create_attendance_session.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule_id: schedule.id,
                    duration_type: durationType,
                    custom_minutes: customMinutes,
                    class_type: classType
                }),
            });
            const data = await response.json();
            if (data.success) {
                onCodeGenerated(schedule.id, data);
                onClose();
            } else {
                setError(data.message || 'Gagal membuat kode.');
            }
        } catch (error) {
            setError('Terjadi kesalahan saat membuat kode.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="modal-backdrop" className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 dark:bg-opacity-70">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="btn-close-modal-dark"><Icon classes="fas fa-times" /></button>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Buat Sesi Presensi</h3>
                {error && <p className="text-red-500 text-sm mb-2 p-3 bg-red-100 dark:bg-red-800/30 dark:text-red-300 rounded-md">{error}</p>}
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Tipe Kelas untuk Sesi Ini</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="classType" value="Offline" checked={classType === 'Offline'} onChange={() => setClassType('Offline')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Offline (Wajib GPS)</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="classType" value="Online" checked={classType === 'Online'} onChange={() => setClassType('Online')} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Online (Tanpa GPS)</span>
                            </label>
                        </div>
                    </div>

                    <hr className="dark:border-gray-600"/>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Durasi Kode</label>
                        <div className="flex items-center p-3 border dark:border-gray-600 rounded-lg">
                            <input type="radio" id="duration_schedule" name="duration" value="schedule_end" checked={durationType === 'schedule_end'} onChange={() => setDurationType('schedule_end')} />
                            <label htmlFor="duration_schedule" className="ml-3">
                                <p className="font-medium dark:text-gray-200">Sesuai Jam Pelajaran</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Kode akan aktif hingga jam pelajaran berakhir ({schedule.end_time_formatted})</p>
                            </label>
                        </div>
                        <div className="flex items-center p-3 border dark:border-gray-600 rounded-lg mt-2">
                            <input type="radio" id="duration_custom" name="duration" value="custom" checked={durationType === 'custom'} onChange={() => setDurationType('custom')} />
                            <label htmlFor="duration_custom" className="ml-3 flex-grow">
                                <p className="font-medium dark:text-gray-200">Atur Sendiri</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tentukan masa berlaku kode dalam menit.</p>
                            </label>
                            <input type="number" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} disabled={durationType !== 'custom'} className="w-20 p-1 border rounded-md text-center input-field-dark"/>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="btn-secondary-dark">Batal</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary-attractive">
                        {isSubmitting ? 'Membuat...' : 'Buat Kode'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MaterialsView = ({ user }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const courseMap = new Map();
                    data.data.forEach(schedule => {
                        if (!courseMap.has(schedule.course_id)) {
                            courseMap.set(schedule.course_id, {
                                id: schedule.course_id,
                                name: schedule.course_name
                            });
                        }
                    });
                    setCourses(Array.from(courseMap.values()));
                }
            });
    }, [user.id]);

    const fetchMaterials = useCallback(() => {
        if (!selectedCourse) {
            setMaterials([]);
            return;
        };
        setIsLoading(true);
        fetch(`${API_BASE_URL}/get_materials.php?course_id=${selectedCourse}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setMaterials(data.data);
            })
            .finally(() => setIsLoading(false));
    }, [selectedCourse]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus materi ini?")) {
            await fetch(`${API_BASE_URL}/delete_material.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchMaterials();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Materi Pembelajaran</h2>
            <div className="flex justify-between items-center mb-4">
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="input-field-dark w-1/3">
                    <option value="">Pilih Mata Pelajaran</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={() => setIsModalOpen(true)} disabled={!selectedCourse} className="btn-primary-attractive">
                    <Icon classes="fas fa-upload mr-2" /> Unggah Materi Baru
                </button>
            </div>
            
            {selectedCourse && (
                isLoading ? <div className="text-center py-5"><Icon classes="fas fa-spinner fa-spin"/></div> :
                <div className="space-y-3">
                    {materials.length > 0 ? materials.map(mat => (
                        <div key={mat.id} className="p-3 border dark:border-gray-600 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold dark:text-white">{mat.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{mat.description}</p>
                                <a href={`${WEB_BASE_URL}/${mat.file_path}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                    <Icon classes="fas fa-download mr-1"/> Unduh Berkas
                                </a>
                            </div>
                            <button onClick={() => handleDelete(mat.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-4"><Icon classes="fas fa-trash"/></button>
                        </div>
                    )) : <p className="text-center text-gray-500 dark:text-gray-400 py-5">Belum ada materi untuk mata pelajaran ini.</p>}
                </div>
            )}

            {isModalOpen && <UploadMaterialModal courseId={selectedCourse} teacherId={user.id} onClose={() => setIsModalOpen(false)} onUploaded={fetchMaterials} />}
        </div>
    );
};

const UploadMaterialModal = ({ courseId, teacherId, onClose, onUploaded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Harap pilih berkas untuk diunggah.");
            return;
        }
        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('teacher_id', teacherId);
        formData.append('course_id', courseId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('material_file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload_material.php`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                onUploaded();
                onClose();
            } else {
                setError(data.message || "Gagal mengunggah.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div id="modal-backdrop" className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 dark:bg-opacity-70">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="btn-close-modal-dark"><Icon classes="fas fa-times" /></button>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Unggah Materi Baru</h3>
                {error && <p className="text-red-500 text-sm mb-2 p-2 bg-red-100 dark:bg-red-800/30 dark:text-red-300 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Judul Materi</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full input-field-dark" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Deskripsi Singkat</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="mt-1 w-full input-field-dark"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Pilih Berkas</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} required className="mt-1 w-full text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/50" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary-dark">Batal</button>
                        <button type="submit" disabled={isUploading} className="btn-primary-attractive">
                            {isUploading ? 'Mengunggah...' : 'Unggah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Ubah Password</h2>
            {message.text && (
                <div className={`p-3 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Password Saat Ini</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 w-full input-field-dark" />
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Password Baru</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 w-full input-field-dark" />
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Konfirmasi Password Baru</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full input-field-dark" />
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

const AttendanceReportView = ({ teacherId }) => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?teacher_id=${teacherId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const uniqueClasses = [...new Set(data.data.map(item => item.student_class_level))];
                    setClasses(uniqueClasses);
                }
            });
    }, [teacherId]);

    const handleGenerateReport = async () => {
        if (!selectedClass || !startDate || !endDate) {
            alert("Harap pilih kelas dan rentang tanggal.");
            return;
        }
        setIsLoading(true);
        setReportData([]);
        try {
            const response = await fetch(`${API_BASE_URL}/get_attendance_history.php?teacher_id=${teacherId}&class_level=${encodeURIComponent(selectedClass)}&start_date=${startDate}&end_date=${endDate}`);
            const data = await response.json();
            if (data.success) {
                setReportData(data.data);
            } else {
                alert(`Gagal mengambil laporan: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Gagal mengambil laporan: Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const exportToPDF = () => {
        if (reportData.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }
        try {
            const doc = new jsPDF();
            doc.text(`Laporan Presensi Kelas: ${selectedClass}`, 14, 16);
            doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 22);
            
            const tableColumn = ["Tanggal", "Nama Siswa", "Mata Pelajaran", "Status"];
            const tableRows = [];

            reportData.forEach(item => {
                const row = [
                    item.attendance_date,
                    item.student_name,
                    item.course_name,
                    item.status,
                ];
                tableRows.push(row);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 30,
            });
            doc.save(`laporan_presensi_${selectedClass}_${startDate}_${endDate}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Gagal mengekspor ke PDF. Periksa konsol untuk detail.");
        }
    };
    
    const statusStyle = {
        'Present': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 
        'Absent': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'Excused': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Laporan Presensi</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Kelas</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mt-1 w-full input-field-dark">
                        <option value="">Pilih Kelas</option>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Tanggal Mulai</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full input-field-dark" />
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Tanggal Selesai</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full input-field-dark" />
                </div>
                <button onClick={handleGenerateReport} disabled={isLoading} className="btn-primary-attractive h-10">
                    {isLoading ? "Memuat..." : "Tampilkan Laporan"}
                </button>
            </div>

            {reportData.length > 0 && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={exportToPDF} className="btn-success-attractive">
                            <Icon classes="fas fa-file-pdf mr-2" /> Ekspor ke PDF
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="th-cell-dark">Tanggal</th>
                                    <th className="th-cell-dark">Nama Siswa</th>
                                    <th className="th-cell-dark">Mata Pelajaran</th>
                                    <th className="th-cell-dark">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reportData.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td className="td-cell-dark">{item.attendance_date}</td>
                                        <td className="td-cell-dark">{item.student_name}</td>
                                        <td className="td-cell-dark">{item.course_name}</td>
                                        <td className="td-cell-dark">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle[item.status] || 'bg-gray-100'}`}>{item.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

const AnnouncementsView = ({ user }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classes, setClasses] = useState([]);

    const fetchAnnouncements = useCallback(() => {
        fetch(`${API_BASE_URL}/get_announcements.php?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setAnnouncements(data.data);
            });
    }, [user.id]);

    useEffect(() => {
        fetchAnnouncements();
        fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?teacher_id=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const uniqueClasses = [...new Set(data.data.map(item => item.student_class_level))];
                    setClasses(uniqueClasses);
                }
            });
    }, [fetchAnnouncements, user.id]);

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus pengumuman ini?")) {
            await fetch(`${API_BASE_URL}/delete_announcement.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchAnnouncements();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold dark:text-white">Pengumuman Saya</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary-attractive">
                    <Icon classes="fas fa-plus mr-2" /> Buat Pengumuman
                </button>
            </div>
            <div className="space-y-4">
                {announcements.length > 0 ? announcements.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold dark:text-white">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Untuk Kelas: {item.class_level}</p>
                                <p className="mt-2 dark:text-gray-300">{item.content}</p>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                <Icon classes="fas fa-trash" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-2">Dibuat pada: {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-5 bg-white dark:bg-gray-800 rounded-lg">Belum ada pengumuman.</p>}
            </div>
            {isModalOpen && <CreateAnnouncementModal user={user} classes={classes} onClose={() => setIsModalOpen(false)} onSaved={fetchAnnouncements} />}
        </div>
    );
};

const CreateAnnouncementModal = ({ user, classes, onClose, onSaved }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetClass, setTargetClass] = useState('Semua Kelas');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_BASE_URL}/create_announcement.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_id: user.id,
                title,
                content,
                class_level: targetClass
            })
        });
        onSaved();
        onClose();
    };

    return (
        <div id="modal-backdrop" className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 dark:bg-opacity-70">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="btn-close-modal-dark"><Icon classes="fas fa-times" /></button>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Buat Pengumuman Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Judul</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full input-field-dark" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Isi Pengumuman</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} required rows="4" className="mt-1 w-full input-field-dark"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Tujukan Untuk Kelas</label>
                        <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="mt-1 w-full input-field-dark">
                            <option value="Semua Kelas">Semua Kelas yang Diajar</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary-dark">Batal</button>
                        <button type="submit" className="btn-primary-attractive">Kirim</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ScheduleCalendar = ({ schedules = [], isLoading }) => {
    const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const schedulesByDay = useMemo(() => daysOfWeek.reduce((acc, day) => {
        acc[day] = schedules.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase()).sort((a, b) => a.start_time.localeCompare(b.start_time));
        return acc;
    }, {}), [schedules, daysOfWeek]);

    if (isLoading) return <div className="text-center p-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /></div>;
    if (schedules.length === 0) return <div className="text-center text-gray-500 dark:text-gray-400 p-10">Tidak ada jadwal mengajar yang ditemukan.</div>;

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 min-h-[150px]">
                        <h3 className="font-semibold text-center text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-3">{day}</h3>
                        <div className="space-y-3">
                            {schedulesByDay[day] && schedulesByDay[day].length > 0 ? schedulesByDay[day].map(schedule => (
                                <div key={schedule.id} className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border-l-4 border-blue-500 dark:border-blue-400">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white">{schedule.course_name}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-300">{schedule.student_class_level}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1"><Icon classes="far fa-clock mr-1" />{schedule.start_time_formatted} - {schedule.end_time_formatted}</p>
                                </div>
                            )) : <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Libur</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const ClassDetailView = ({ schedule, onClose }) => {
    const [roster, setRoster] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRoster = useCallback(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/get_class_attendance_details.php?schedule_id=${schedule.id}&class_level=${encodeURIComponent(schedule.student_class_level)}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRoster(data.data);
                }
            })
            .finally(() => setIsLoading(false));
    }, [schedule]);

    useEffect(() => {
        fetchRoster();
    }, [fetchRoster]);

    const handleStatusChange = async (studentId, newStatus) => {
        const originalRoster = [...roster];
        setRoster(prevRoster => prevRoster.map(student => 
            student.student_id === studentId ? { ...student, attendance_status: newStatus } : student
        ));

        try {
            const response = await fetch(`${API_BASE_URL}/update_manual_attendance.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    schedule_id: schedule.id,
                    status: newStatus,
                }),
            });
            const data = await response.json();
            if (!data.success) {
                alert(`Gagal memperbarui: ${data.message}`);
                setRoster(originalRoster);
            }
        } catch (error) {
            alert('Gagal terhubung ke server.');
            setRoster(originalRoster);
        }
    };

    const attendanceSummary = useMemo(() => {
        return roster.reduce((acc, student) => {
            const status = student.attendance_status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [roster]);

    return (
        <div id="modal-backdrop" className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50 dark:bg-opacity-70">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl flex flex-col relative" style={{maxHeight: '90vh'}}>
                <button onClick={onClose} className="btn-close-modal-dark"><Icon classes="fas fa-times" /></button>
                <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{schedule.course_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{schedule.student_class_level}</p>
                </div>
                <div className="p-4 grid grid-cols-3 gap-2 text-center border-b dark:border-gray-700">
                    <div><p className="font-bold text-green-600 dark:text-green-400 text-lg">{attendanceSummary.Present || 0}</p><p className="text-xs dark:text-gray-300">Hadir</p></div>
                    <div><p className="font-bold text-red-600 dark:text-red-400 text-lg">{attendanceSummary.Absent || 0}</p><p className="text-xs dark:text-gray-300">Absen</p></div>
                    <div><p className="font-bold text-orange-600 dark:text-orange-400 text-lg">{attendanceSummary.Excused || 0}</p><p className="text-xs dark:text-gray-300">Izin</p></div>
                </div>
                <div className="p-4 overflow-y-auto">
                    {isLoading ? <div className="text-center"><Icon classes="fas fa-spinner fa-spin" /></div> :
                    <table className="min-w-full">
                        <thead className="dark:text-gray-300">
                            <tr>
                                <th className="text-left text-xs font-medium uppercase py-2">Nama Siswa</th>
                                <th className="text-left text-xs font-medium uppercase py-2 w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {roster.map(student => (
                                <tr key={student.student_id}>
                                    <td className="py-2 text-sm dark:text-gray-200">{student.student_name}</td>
                                    <td>
                                        <select 
                                            value={student.attendance_status} 
                                            onChange={(e) => handleStatusChange(student.student_id, e.target.value)}
                                            className="w-full p-1 border rounded-md text-xs input-field-dark"
                                        >
                                            <option value="Present">Hadir</option>
                                            <option value="Absent">Absen</option>
                                            <option value="Excused">Izin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    }
                </div>
            </div>
        </div>
    );
};

const ManageAttendanceView = ({ schedules = [], isLoading, teacherId }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [generatedCodes, setGeneratedCodes] = useState({});
    const [modal, setModal] = useState({ type: null, data: null });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const todayString = useMemo(() => {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return days[currentTime.getDay()];
    }, [currentTime]);

    const todaySchedules = useMemo(() => {
        return schedules
            .filter(s => s.day_of_week.toLowerCase() === todayString.toLowerCase())
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }, [schedules, todayString]);

    useEffect(() => {
        if (todaySchedules.length > 0) {
            todaySchedules.forEach(schedule => {
                if (!generatedCodes[schedule.id]) {
                    fetch(`${API_BASE_URL}/get_active_session.php?schedule_id=${schedule.id}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.session) {
                                setGeneratedCodes(prev => ({
                                    ...prev,
                                    [schedule.id]: { code: data.session.code, expires_at: data.session.expires_at }
                                }));
                            }
                        })
                        .catch(err => console.error(`Failed to fetch active session for schedule ${schedule.id}`, err));
                }
            });
        }
    }, [todaySchedules, generatedCodes]);

    const isWithinTimeRange = useCallback((schedule) => {
        const now = currentTime;
        const startTime = new Date(`${now.toDateString()} ${schedule.start_time}`);
        const endTime = new Date(`${now.toDateString()} ${schedule.end_time}`);
        return now >= startTime && now <= endTime;
    }, [currentTime]);

    const handleCodeGenerated = (scheduleId, data) => {
        setGeneratedCodes(prev => ({ ...prev, [scheduleId]: { code: data.code, expires_at: data.expires_at } }));
    };

    const CountdownTimer = ({ expiryTimestamp, onExpiry }) => {
        const calculateTimeLeft = useCallback(() => {
            const difference = new Date(expiryTimestamp).getTime() - new Date().getTime();
            if (difference <= 0) return null;
            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }, [expiryTimestamp]);

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        useEffect(() => {
            const timer = setTimeout(() => {
                const newTimeLeft = calculateTimeLeft();
                setTimeLeft(newTimeLeft);
                if (newTimeLeft === null) {
                    onExpiry();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }, [timeLeft, calculateTimeLeft, onExpiry]);
        
        if (!timeLeft) return <span className="font-mono text-sm">00:00:00</span>;

        return (
            <span className="font-mono text-sm">
                {`${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
            </span>
        );
    };

    const handleExpiry = (scheduleId) => {
        setGeneratedCodes(prev => {
            const newState = { ...prev };
            delete newState[scheduleId];
            return newState;
        });
    };

    if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /></div>;

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Sesi Presensi Hari Ini ({todayString})</h2>
                {todaySchedules.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400"><Icon classes="fas fa-calendar-times text-4xl mb-3" /><p>Tidak ada jadwal mengajar hari ini.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaySchedules.map(schedule => {
                            const canGenerate = isWithinTimeRange(schedule);
                            const session = generatedCodes[schedule.id];
                            return (
                                <div key={schedule.id} className={`p-4 rounded-lg shadow-md flex flex-col justify-between border ${canGenerate && !session ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{schedule.course_name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{schedule.student_class_level}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><Icon classes="far fa-clock mr-1" />{schedule.start_time_formatted} - {schedule.end_time_formatted}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-2">
                                        {session ? (
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Kode Presensi:</p>
                                                <div className="flex justify-center space-x-1 mb-2">
                                                    {session.code.split('').map((digit, i) => (
                                                        <span key={i} className="w-9 h-10 flex items-center justify-center text-xl font-bold border bg-white text-blue-800 dark:bg-gray-700 dark:text-blue-200 dark:border-gray-600 rounded-md shadow-inner">{digit}</span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-red-600 dark:text-red-400">Berlaku hingga: <CountdownTimer expiryTimestamp={session.expires_at} onExpiry={() => handleExpiry(schedule.id)} /></p>
                                            </div>
                                        ) : (
                                            <button onClick={() => setModal({ type: 'generate', data: schedule })} disabled={!canGenerate} className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" title={canGenerate ? "Buat kode presensi" : "Hanya bisa dibuka saat jam pelajaran"}>
                                                <Icon classes="fas fa-magic mr-2" />Generate Code
                                            </button>
                                        )}
                                        <button onClick={() => setModal({ type: 'detail', data: schedule })} className="w-full bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                            <Icon classes="fas fa-edit mr-2" />Kelola Manual
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {modal.type === 'generate' && <GenerateCodeModal schedule={modal.data} onClose={() => setModal({ type: null, data: null })} onCodeGenerated={handleCodeGenerated} />}
            {modal.type === 'detail' && <ClassDetailView schedule={modal.data} onClose={() => setModal({ type: null, data: null })} />}
        </>
    );
};

export default function TeacherDashboard({ onLogout, user }) {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({ total_classes: 0, total_courses: 0 });
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState({ stats: true, schedule: true });

    const teacherUser = { name: user.name, role: user.role, avatarUrl: `https://placehold.co/50x50/7C3AED/FFFFFF?text=${user.name ? user.name.substring(0, 2).toUpperCase() : 'TA'}` };

    useEffect(() => {
        const teacherId = user?.id;
        if (!teacherId) return;
        setIsLoading({ stats: true, schedule: true });
        fetch(`${API_BASE_URL}/get_teacher_dashboard_stats.php?teacher_id=${teacherId}`).then(res => res.json()).then(data => { if (data.success) setDashboardStats(data.data); }).finally(() => setIsLoading(p => ({ ...p, stats: false })));
        fetch(`${API_BASE_URL}/penjadwalan/get_schedules.php?teacher_id=${teacherId}`).then(res => res.json()).then(data => { if (data.success) setScheduleData(data.data); }).finally(() => setIsLoading(p => ({ ...p, schedule: false })));
    }, [user.id]);

    const teacherNavItems = [
        { name: 'Dashboard', icon: 'fas fa-home', view: 'dashboard' },
        { name: 'Kelola Presensi', icon: 'fas fa-calendar-check', view: 'manage-attendance' },
        { name: 'Laporan Presensi', icon: 'fas fa-chart-bar', view: 'reports' },
        { name: 'Pengumuman', icon: 'fas fa-bullhorn', view: 'announcements' },
        { name: 'Materi Pelajaran', icon: 'fas fa-book-reader', view: 'materials' },
        { name: 'Pengaturan', icon: 'fas fa-cog', view: 'settings' }
    ];
    
    const handleNavigate = (view) => { setActiveView(view); if (window.innerWidth < 768) setIsSidebarOpen(false); };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"><div className="flex items-center justify-between"><div><p className="dark:text-gray-300">Total Kelas Diajar</p><h3 className="text-2xl font-bold mt-1 dark:text-white">{isLoading.stats ? <Icon classes="fas fa-spinner fa-spin" /> : dashboardStats.total_classes}</h3></div><div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"><Icon classes="fas fa-chalkboard-teacher text-xl" /></div></div></div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"><div className="flex items-center justify-between"><div><p className="dark:text-gray-300">Total Mata Pelajaran</p><h3 className="text-2xl font-bold mt-1 dark:text-white">{isLoading.stats ? <Icon classes="fas fa-spinner fa-spin" /> : dashboardStats.total_courses}</h3></div><div className="p-3 rounded-full bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300"><Icon classes="fas fa-book-open text-xl" /></div></div></div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"><h2 className="text-xl font-semibold mb-4 dark:text-white">Jadwal Mengajar Mingguan</h2><ScheduleCalendar schedules={scheduleData} isLoading={isLoading.schedule} /></div>
                    </>
                );
            case 'manage-attendance':
                return <ManageAttendanceView schedules={scheduleData} isLoading={isLoading.schedule} teacherId={user.id} />;
            case 'reports':
                return <AttendanceReportView teacherId={user.id} />;
            case 'announcements':
                return <AnnouncementsView user={user} />;
            case 'materials':
                return <MaterialsView user={user} />;
            case 'settings':
                return <SettingsView user={user} />;
            default:
                return <div>Pilih menu</div>;
        }
    };

    return (
        <div className="flex min-h-screen font-sans text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-200">
            <div className={`sidebar bg-white dark:bg-gray-800 w-64 min-h-screen shadow-lg transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-40`}>
                <div className="p-4">
                    <div className="flex items-center space-x-3 mb-6"><img src={teacherUser.avatarUrl} alt="User" className="h-12 w-12 rounded-full" /><div><p className="font-medium dark:text-white">{teacherUser.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{teacherUser.role}</p></div></div>
                    <nav className="space-y-2">{teacherNavItems.map(item => <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); handleNavigate(item.view); }} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeView === item.view ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}><Icon classes={`${item.icon} w-5 text-center`} /><span>{item.name}</span></a>)}</nav>
                </div>
                <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700"><button onClick={onLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full dark:text-gray-300"><Icon classes="fas fa-sign-out-alt w-5 text-center" /><span>Logout</span></button></div>
            </div>
            <div className="main-content flex-1 p-4 sm:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-bold dark:text-white">{teacherNavItems.find(item => item.view === activeView)?.name || 'Dashboard'}</h1><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg md:hidden hover:bg-gray-200 dark:hover:bg-gray-700"><Icon classes="fas fa-bars" /></button></div>
                {renderContent()}
            </div>
        </div>
    );
}

// Helper CSS classes for dark mode consistency
/*
.input-field-dark {
  @apply mt-1 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
.th-cell-dark {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.td-cell-dark {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white;
}
.btn-secondary-dark {
  @apply px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
}
.btn-primary-attractive {
   @apply px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out;
}
.btn-success-attractive {
  @apply px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700;
}
.btn-close-modal-dark {
  @apply absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white;
}
*/