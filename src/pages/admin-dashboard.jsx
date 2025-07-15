// src/pages/admin-dashboard.jsx
// Komponen AdminDashboard utama yang terintegrasi dengan backend PHP

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie'; // Import library js-cookie
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// URL base untuk script PHP Anda di Laragon.
const API_BASE_URL = 'http://localhost/COBAK_REACT/SRC'; // Untuk users, stats
const MODULE_API_BASE_URL = `http://localhost/COBAK_REACT/SRC/penjadwalan`; // Untuk courses, schedules, dan classes

// Komponen Helper untuk Ikon (menggunakan class Font Awesome)
const Icon = ({ classes }) => <i className={classes}></i>;
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// --- Komponen Modal Tambah/Edit Pengguna ---
const AddEditUserModal = ({
    isOpen,
    onClose,
    onUserSaved,
    editingUser,
    classesList = [],
    coursesList = [],
    isLoadingDropdownData = false
}) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(editingUser && editingUser.id);

  const [userType, setUserType] = useState(isEditMode ? (editingUser.role || 'teacher') : 'teacher');
  const [name, setName] = useState(isEditMode ? (editingUser.name || '') : '');
  const [email, setEmail] = useState(isEditMode ? (editingUser.email || '') : '');
  const [password, setPassword] = useState('');
  const [studentClassLevel, setStudentClassLevel] = useState(isEditMode ? (editingUser.student_class_level || '') : '');
  const [teacherMainSubject, setTeacherMainSubject] = useState(isEditMode ? (editingUser.teacher_main_subject || '') : '');
  // State status dihilangkan karena status online/offline otomatis
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode && editingUser) {
      setName(editingUser.name || '');
      setEmail(editingUser.email || '');
      setUserType(editingUser.role || 'teacher');
      setStudentClassLevel(editingUser.student_class_level || '');
      setTeacherMainSubject(editingUser.teacher_main_subject || '');
      setPassword('');
    } else {
      setUserType('teacher');
      setName('');
      setEmail('');
      setPassword('');
      setStudentClassLevel('');
      setTeacherMainSubject('');
    }
  }, [isEditMode, editingUser]);

  useEffect(() => {
    if (userType === 'student') {
        setTeacherMainSubject('');
    } else if (userType === 'teacher') {
        setStudentClassLevel('');
    } else { // admin
        setTeacherMainSubject('');
        setStudentClassLevel('');
    }
  }, [userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); setIsLoading(true);

    if (!name || !email) {
      setError('Nama dan email wajib diisi.'); setIsLoading(false); return;
    }
    if (!isEditMode && !password) {
      setError('Password wajib diisi untuk pengguna baru.'); setIsLoading(false); return;
    }
    if (password && password.length < 6) {
      setError('Jika diisi, password minimal 6 karakter.'); setIsLoading(false); return;
    }
    if (userType === 'student' && !studentClassLevel) {
        setError('Kelas siswa wajib dipilih.'); setIsLoading(false); return;
    }

    const endpoint = isEditMode ? `${API_BASE_URL}/update_user.php` : `${API_BASE_URL}/add_user.php`;

    const userData = {
      id: isEditMode ? editingUser.id : undefined,
      user_type: userType,
      name: name,
      email: email,
      ...(password && { password: password }),
      // Status tidak dikirim di sini karena dikelola otomatis oleh login/logout
      ...(userType === 'student' && { student_class_level: studentClassLevel }),
      ...(userType === 'teacher' && { teacher_main_subject: teacherMainSubject }),
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0,150)}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error(`Respons server bukan JSON: ${textResponse.substring(0, 200)}...`);
      }
      const result = await response.json();
      if (!result.success) { throw new Error(result.message || `Gagal.`); }
      setSuccessMessage(result.message || `Pengguna berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      if (onUserSaved) onUserSaved(userType);
      setTimeout(() => { setSuccessMessage(''); onClose(); }, 2000);
    } catch (err) {
      console.error("Error saat simpan pengguna:", err);
      setError(`Gagal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" id="modal-backdrop">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}><Icon classes="fas fa-times" /></button>
          </div>
          {error && <p className="text-red-500 text-sm mb-2 p-3 bg-red-100 rounded-md">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mb-2 p-3 bg-green-100 rounded-md">{successMessage}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="user-type-modal" className="block text-sm font-medium text-gray-700">Tipe Pengguna</label>
              <select
                id="user-type-modal"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                disabled={isLoading || isEditMode} // userType tidak bisa diubah saat edit
                className="mt-1 block w-full input-field">
                <option value="teacher">Guru</option>
                <option value="student">Siswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="name-modal" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" id="name-modal" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="mt-1 block w-full input-field" />
            </div>
            <div>
              <label htmlFor="email-modal" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email-modal" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="mt-1 block w-full input-field" />
            </div>

            {userType === 'student' && (
              <div>
                <label htmlFor="student-class-level-modal" className="block text-sm font-medium text-gray-700">Kelas Siswa</label>
                <select
                  id="student-class-level-modal"
                  value={studentClassLevel}
                  onChange={(e) => setStudentClassLevel(e.target.value)}
                  disabled={isLoading || isLoadingDropdownData || classesList.length === 0}
                  required
                  className="mt-1 block w-full input-field">
                  <option value="">
                    {isLoadingDropdownData ? "Memuat kelas..." : (classesList.length === 0 ? "Tidak ada kelas" : "-- Pilih Kelas --")}
                  </option>
                  {classesList.map(cls => (
                    <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                  ))}
                </select>
                 {classesList.length === 0 && !isLoadingDropdownData && <p className="text-xs text-gray-500 mt-1">Tidak ada pilihan kelas tersedia.</p>}
              </div>
            )}

            {userType === 'teacher' && (
              <div>
                <label htmlFor="teacher-main-subject-modal" className="block text-sm font-medium text-gray-700">Mapel Utama Guru <span className="text-xs text-gray-500">(Opsional)</span></label>
                <select
                  id="teacher-main-subject-modal"
                  value={teacherMainSubject}
                  onChange={(e) => setTeacherMainSubject(e.target.value)}
                  disabled={isLoading || isLoadingDropdownData || coursesList.length === 0}
                  className="mt-1 block w-full input-field">
                  <option value="">
                     {isLoadingDropdownData ? "Memuat mapel..." : (coursesList.length === 0 ? "Tidak ada mapel" : "-- Pilih Mapel Utama --")}
                  </option>
                  {coursesList.map(course => (
                    <option key={course.id} value={course.course_name}>{course.course_name} ({course.course_code})</option>
                  ))}
                </select>
                {coursesList.length === 0 && !isLoadingDropdownData && <p className="text-xs text-gray-500 mt-1">Tidak ada pilihan mata pelajaran tersedia.</p>}
              </div>
            )}

            {/* Field Status Pengguna dihilangkan karena status kini otomatis berdasarkan login/logout */}

            <div>
              <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700">Kata Sandi {isEditMode ? '(Kosongkan jika tidak diubah)' : ''}</label>
              <input type="password" id="password-modal" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditMode} disabled={isLoading} placeholder={isEditMode ? "Tidak diubah" : "Min. 6 karakter"} className="mt-1 block w-full input-field" />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95 flex items-center"
                disabled={isLoading}
              >
                {isLoading && <Icon classes="fas fa-spinner fa-spin mr-2" />}
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


// --- Komponen Tabel Pengguna ---
const UserTable = ({ userType, onEdit, onDelete, needsRefresh, searchTerm, sortOrder, classFilter }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const tableHeaders = userType === 'teachers'
    ? ["Nama", "Email", "Mapel Utama", "Status", "Aksi"]
    : ["Nama", "Email", "Kelas", "Status", "Aksi"];

  const fetchData = useCallback(async () => {
    setIsLoading(true); setError('');
    const endpoint = `${API_BASE_URL}/get_users.php?type=${userType === 'teachers' ? 'teachers' : 'students'}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0,150)}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) { throw new Error(`Respons server bukan JSON.`); }
      const data = await response.json();
      if (data.success === false) { throw new Error(data.message || `Gagal mengambil data dari server.`); }
      setUsers(data.data || []);
    } catch (err) {
      console.error(`Error fetching ${userType}: `, err);
      setError(`Gagal memuat data ${userType === 'teachers' ? 'guru' : 'siswa'}: ${err.message}`);
      setUsers([]);
    } finally { setIsLoading(false); }
  }, [userType]);

  useEffect(() => { fetchData(); }, [fetchData, needsRefresh]);

  // NEW: Memoized, filtered, and sorted data
  const processedUsers = useMemo(() => {
      let filtered = [...users];

      // 1. Search filter
      if (searchTerm) {
          filtered = filtered.filter(user =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }

      // 2. Class filter (for students only)
      if (userType === 'students' && classFilter) {
          filtered = filtered.filter(user => user.student_class_level === classFilter);
      }

      // 3. Sorting
      filtered.sort((a, b) => {
          if (sortOrder === 'name_asc') {
              return a.name.localeCompare(b.name);
          }
          if (sortOrder === 'name_desc') {
              return b.name.localeCompare(a.name);
          }
          return 0; // Default no sort
      });

      return filtered;
  }, [users, searchTerm, sortOrder, classFilter, userType]);


  if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat...</div>;
  if (error) return <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">{error}</div>;
  if (processedUsers.length === 0) return <div className="text-center py-10 text-gray-500">Tidak ada data yang cocok dengan kriteria.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50"><tr>{tableHeaders.map(h => <th key={h} scope="col" className="th-cell">{h}</th>)}</tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {processedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="td-cell">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="td-cell text-gray-500">{user.email}</td>
              <td className="td-cell text-gray-500">
                {userType === 'teachers' ? (user.teacher_main_subject || '-') : (user.student_class_level || '-')}
              </td>
              {/* Menampilkan Status Online/Offline */}
              <td className="td-cell">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status === 'active' ? 'Online' : 'Offline'}
                </span>
              </td>
              <td className="td-cell text-sm font-medium">
                <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 mr-2">Edit</button>
                <button onClick={() => onDelete(user.id, userType)} className="text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded-md hover:bg-red-50 transition-colors duration-150">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Komponen Manajemen Pengguna ---
const UserManagementView = () => {
  const [activeTab, setActiveTab] = useState('teachers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [classesList, setClassesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [isLoadingDropdownData, setIsLoadingDropdownData] = useState(false);
  const [dropdownError, setDropdownError] = useState('');

  // State untuk search dan filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdownData(true);
      setDropdownError('');
      try {
        const classesPromise = fetch(`${MODULE_API_BASE_URL}/get_classes.php`);
        const coursesPromise = fetch(`${MODULE_API_BASE_URL}/get_courses.php`);

        const [classesRes, coursesRes] = await Promise.all([classesPromise, coursesPromise]);

        if (!classesRes.ok) {
            const errText = await classesRes.text();
            throw new Error(`Gagal memuat kelas: ${errText.substring(0,100)}`);
        }
        const classesData = await classesRes.json();
        if (classesData.success) {
          setClassesList(classesData.data || []);
        } else {
          throw new Error(classesData.message || "Gagal mengambil data kelas untuk modal.");
        }

        if (!coursesRes.ok) {
            const errText = await coursesRes.text();
            throw new Error(`Gagal memuat mata pelajaran: ${errText.substring(0,100)}`);
        }
        const coursesData = await coursesRes.json();
        if (coursesData.success) {
          setCoursesList(coursesData.data || []);
        } else {
          throw new Error(coursesData.message || "Gagal mengambil data mata pelajaran untuk modal.");
        }

      } catch (error) {
        console.error("Error fetching data for user modal dropdowns:", error);
        setDropdownError(`Tidak dapat memuat pilihan: ${error.message}`);
        setClassesList([]);
        setCoursesList([]);
      } finally {
        setIsLoadingDropdownData(false);
      }
    };
    fetchDropdownData();
  }, []);
  const sortClassesForFilter = (a, b) => {
      const getClassInfo = (className) => {
          const upperCaseName = className.toUpperCase();
          // Regex untuk menangkap Tingkat (XII, XI, X), Jurusan (IPA, IPS, BAHASA), dan Nomor
          // Ini akan menangani pemisah spasi ataupun tanda hubung.
          const regex = /^(XII|XI|X)[\s-]*?(IPA|IPS|BAHASA)[\s-]*?(\d+)$/;
          const match = upperCaseName.match(regex);

          let gradePriority = 99;
          let majorPriority = 4; // Default untuk "Lainnya"
          let classNumber = 99;

          if (match) {
              // match[1] adalah Tingkat (e.g., "X", "XI")
              // match[2] adalah Jurusan (e.g., "IPA")
              // match[3] adalah Nomor (e.g., "1", "10")

              switch (match[1]) {
                  case 'X': gradePriority = 10; break;
                  case 'XI': gradePriority = 11; break;
                  case 'XII': gradePriority = 12; break;
              }

              switch (match[2]) {
                  case 'IPA': majorPriority = 1; break;
                  case 'IPS': majorPriority = 2; break;
                  case 'BAHASA': majorPriority = 3; break;
              }

              classNumber = parseInt(match[3], 10);
          } else {
              // Fallback jika nama kelas tidak cocok dengan pola standar
              if (upperCaseName.includes('IPA')) majorPriority = 1;
              else if (upperCaseName.includes('IPS')) majorPriority = 2;
              else if (upperCaseName.includes('BAHASA')) majorPriority = 3;
          }

          return { majorPriority, gradePriority, classNumber };
      };

      const infoA = getClassInfo(a.class_name);
      const infoB = getClassInfo(b.class_name);

      // 1. Urutkan berdasarkan prioritas Jurusan
      if (infoA.majorPriority !== infoB.majorPriority) {
          return infoA.majorPriority - infoB.majorPriority;
      }

      // 2. Jika Jurusan sama, urutkan berdasarkan prioritas Tingkat
      if (infoA.gradePriority !== infoB.gradePriority) {
          return infoA.gradePriority - infoB.gradePriority;
      }

      // 3. Jika Tingkat sama, urutkan berdasarkan Nomor Kelas
      return infoA.classNumber - infoB.classNumber;
  };

  const sortedClassesForFilter = useMemo(() => {
    return [...classesList].sort(sortClassesForFilter);
  }, [classesList]);

  const handleEditUser = (user) => { setEditingUser(user); setIsModalOpen(true); };
  const handleDeleteUser = async (userId, userRoleType) => {
    if (window.confirm(`Yakin ingin menghapus pengguna ini?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete_user.php`, {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id: userId })
        });
        if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert(result.message); setRefreshKey(k => k + 1);
      } catch (err) { console.error("Error hapus user:", err); alert(`Gagal menghapus: ${err.message}`); }
    }
  };
  const handleUserSaved = () => { setRefreshKey(k => k + 1); };
  const openAddModal = () => { setEditingUser(null); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingUser(null); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
              onClick={openAddModal}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
            >
              <Icon classes="fas fa-plus mr-2" />Tambah Pengguna
            </button>
      </div>
      {dropdownError && <p className="text-red-500 text-sm mb-2 p-3 bg-red-100 rounded-md text-center">{dropdownError}</p>}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('teachers')} className={`py-2 px-4 font-medium hover:text-blue-600 border-b-2 ${activeTab === 'teachers' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Guru</button>
          <button onClick={() => setActiveTab('students')} className={`py-2 px-4 font-medium hover:text-blue-600 border-b-2 ${activeTab === 'students' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Siswa</button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="relative w-full sm:w-64">
                <input
                    type="text"
                    placeholder={`Cari ${activeTab === 'teachers' ? 'guru' : 'siswa'}...`}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Icon classes="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <div>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="name_asc">Nama (A-Z)</option>
                        <option value="name_desc">Nama (Z-A)</option>
                    </select>
                </div>

                 {activeTab === 'students' && (
                <div>
                    <select
                        id="class-filter"
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        disabled={isLoadingDropdownData || sortedClassesForFilter.length === 0}
                    >
                        <option value="">Semua Kelas</option>
                        {sortedClassesForFilter.map(cls => (
                            <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                        ))}
                    </select>
                </div>
            )}
            </div>
        </div>

        {activeTab === 'teachers' && <UserTable userType="teachers" onEdit={handleEditUser} onDelete={handleDeleteUser} needsRefresh={refreshKey} searchTerm={searchTerm} sortOrder={sortOrder} />}
        {activeTab === 'students' && <UserTable userType="students" onEdit={handleEditUser} onDelete={handleDeleteUser} needsRefresh={refreshKey} searchTerm={searchTerm} sortOrder={sortOrder} classFilter={classFilter} />}
      </div>
      <AddEditUserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUserSaved={handleUserSaved}
        editingUser={editingUser}
        classesList={classesList}
        coursesList={coursesList}
        isLoadingDropdownData={isLoadingDropdownData}
      />
    </div>
  );
};

// --- Komponen Manajemen Mata Pelajaran (Courses) ---
const AddEditCourseModal = ({ isOpen, onClose, onCourseSaved, editingCourse }) => {
    if (!isOpen) return null;
    const isEditMode = Boolean(editingCourse && editingCourse.id);

    const [courseCode, setCourseCode] = useState(isEditMode ? editingCourse.course_code : '');
    const [courseName, setCourseName] = useState(isEditMode ? editingCourse.course_name : '');
    const [description, setDescription] = useState(isEditMode ? editingCourse.description : '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isEditMode && editingCourse) {
            setCourseCode(editingCourse.course_code || '');
            setCourseName(editingCourse.course_name || '');
            setDescription(editingCourse.description || '');
        } else {
            setCourseCode(''); setCourseName(''); setDescription('');
        }
    }, [isEditMode, editingCourse]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccessMessage(''); setIsLoading(true);
        if (!courseCode || !courseName) { setError('Kode dan Nama Mata Pelajaran wajib diisi.'); setIsLoading(false); return; }

        const endpoint = isEditMode ? `${MODULE_API_BASE_URL}/update_course.php` : `${MODULE_API_BASE_URL}/create_course.php`;
        const courseData = { id: isEditMode ? editingCourse.id : undefined, course_code: courseCode, course_name: courseName, description };

        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(courseData) });
            if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            setSuccessMessage(result.message);
            if (onCourseSaved) onCourseSaved();
            setTimeout(() => { setSuccessMessage(''); onClose(); }, 2000);
        } catch (err) { console.error("Error simpan course:", err); setError(`Gagal: ${err.message}`);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" id="modal-backdrop">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{isEditMode ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                    <button onClick={onClose} disabled={isLoading}><Icon classes="fas fa-times text-gray-600 hover:text-gray-800" /></button>
                </div>
                {error && <p className="text-red-500 text-sm mb-2 p-3 bg-red-100 rounded-md">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-2 p-3 bg-green-100 rounded-md">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label htmlFor="courseCode" className="block text-sm font-medium">Kode</label><input type="text" id="courseCode" value={courseCode} onChange={e => setCourseCode(e.target.value)} required disabled={isLoading} className="mt-1 w-full input-field" /></div>
                    <div><label htmlFor="courseName" className="block text-sm font-medium">Nama Mata Pelajaran</label><input type="text" id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} required disabled={isLoading} className="mt-1 w-full input-field" /></div>
                    <div><label htmlFor="description" className="block text-sm font-medium">Deskripsi</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} disabled={isLoading} className="mt-1 w-full input-field" rows="3"></textarea></div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95 flex items-center"
                        >
                            {isLoading && <Icon classes="fas fa-spinner fa-spin mr-2" />}
                            {isEditMode ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CoursesView = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${MODULE_API_BASE_URL}/get_courses.php`);
            if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) { throw new Error(`Respons server (courses) bukan JSON.`); }
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Gagal mengambil data mata pelajaran dari server.");
            setCourses(data.data || []);
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError(`Gagal memuat mata pelajaran: ${err.message}`);
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses, refreshKey]);

    const handleEditCourse = (course) => { setEditingCourse(course); setIsModalOpen(true); };
    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Yakin ingin menghapus mata pelajaran ini? Jadwal terkait juga bisa terpengaruh.")) {
            try {
                const response = await fetch(`${MODULE_API_BASE_URL}/delete_course.php`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id: courseId})});
                if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                alert(result.message); setRefreshKey(k => k + 1);
            } catch (err) { console.error("Error delete course:", err); alert(`Gagal menghapus: ${err.message}`);}
        }
    };
    const handleCourseSaved = () => setRefreshKey(k => k + 1);
    const openAddModal = () => { setEditingCourse(null); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingCourse(null);};

    if (isLoading) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat...</div>;
    if (error) return <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={openAddModal}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
              >
                <Icon classes="fas fa-plus mr-2" />Tambah Mata Pelajaran
              </button>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 text-gray-500 text-center py-5">
                    Belum ada mata pelajaran.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto p-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-cell">Kode</th>
                                    <th className="th-cell">Nama Mata Pelajaran</th>
                                    <th className="th-cell">Deskripsi</th>
                                    <th className="th-cell">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="td-cell">{course.course_code}</td>
                                        <td className="td-cell">
                                            <div className="text-sm font-medium text-gray-900">{course.course_name}</div>
                                        </td>
                                        <td className="td-cell text-gray-500 truncate max-w-xs">{course.description || '-'}</td>
                                        <td className="td-cell text-sm font-medium">
                                            <button onClick={() => handleEditCourse(course)} className="text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 mr-2">Edit</button>
                                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded-md hover:bg-red-50 transition-colors duration-150">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <AddEditCourseModal isOpen={isModalOpen} onClose={closeModal} onCourseSaved={handleCourseSaved} editingCourse={editingCourse} />
        </div>
    );
};


// --- Komponen Modal Tambah/Edit Kelas ---
const AddEditClassModal = ({ isOpen, onClose, onClassSaved, editingClass, teachersList }) => {
  if (!isOpen) return null;
  const isEditMode = Boolean(editingClass && editingClass.id);

  const [className, setClassName] = useState(isEditMode ? (editingClass.class_name || '') : '');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState(isEditMode ? (editingClass.homeroom_teacher_id || '') : '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode && editingClass) {
      setClassName(editingClass.class_name || '');
      setHomeroomTeacherId(editingClass.homeroom_teacher_id || '');
    } else {
      setClassName('');
      setHomeroomTeacherId('');
    }
  }, [isEditMode, editingClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMessage(''); setIsLoading(true);

    if (!className.trim()) {
      setError('Nama kelas wajib diisi.'); setIsLoading(false); return;
    }

    const endpoint = isEditMode
      ? `${MODULE_API_BASE_URL}/update_class.php`
      : `${MODULE_API_BASE_URL}/create_class.php`;

    const classData = {
      id: isEditMode ? editingClass.id : undefined,
      class_name: className.trim(),
      homeroom_teacher_id: homeroomTeacherId ? parseInt(homeroomTeacherId, 10) : null,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 150)}`);
      }
      const result = await response.json();
      if (!result.success) { throw new Error(result.message || `Gagal menyimpan data kelas.`); }
      setSuccessMessage(result.message || `Kelas berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      if (onClassSaved) onClassSaved();
      setTimeout(() => { setSuccessMessage(''); onClose(); }, 2000);
    } catch (err) {
      console.error("Error saat simpan kelas:", err);
      setError(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" id="modal-backdrop">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}><Icon classes="fas fa-times" /></button>
                </div>
                {error && <p className="text-red-500 text-sm mb-3 p-3 bg-red-100 rounded-md">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-3 p-3 bg-green-100 rounded-md">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="class-name-modal" className="block text-sm font-medium text-gray-700">Nama Kelas</label>
                        <input
                            type="text"
                            id="class-name-modal"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                            required
                            disabled={isLoading}
                            placeholder="Contoh: X IPA 1"
                            className="mt-1 block w-full input-field" />
                    </div>
                    <div>
                        <label htmlFor="homeroom-teacher-modal" className="block text-sm font-medium text-gray-700">Wali Kelas (Opsional)</label>
                        <select
                            id="homeroom-teacher-modal"
                            value={homeroomTeacherId}
                            onChange={(e) => setHomeroomTeacherId(e.target.value)}
                            disabled={isLoading || teachersList.length === 0}
                            className="mt-1 block w-full input-field" >
                            <option value="">-- Pilih Wali Kelas --</option>
                            {teachersList.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                        {teachersList.length === 0 && <p className="text-xs text-gray-500 mt-1">Tidak ada data guru tersedia.</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95"
                            disabled={isLoading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95 flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading && <Icon classes="fas fa-spinner fa-spin mr-2" />}
                            {isEditMode ? 'Simpan Perubahan' : 'Tambah Kelas'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Komponen Modal Detail Kelas
const ClassDetailsModal = ({ isOpen, onClose, classItem, students, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" id="modal-backdrop">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Daftar Siswa Kelas: <span className="text-blue-600">{classItem?.class_name}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><Icon classes="fas fa-times" /></button>
                </div>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat data siswa...</div>
                    ) : students.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                  <tr>
                                      <th className="th-cell w-16">No.</th>
                                      <th className="th-cell">Nama Siswa</th>
                                      <th className="th-cell">Email</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {students.map((student, index) => (
                                      <tr key={student.id} className="hover:bg-gray-50">
                                          <td className="td-cell text-center">{index + 1}</td>
                                          <td className="td-cell">{student.name}</td>
                                          <td className="td-cell">{student.email}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-10">Tidak ada data siswa di kelas ini.</p>
                    )}
                </div>
                 <div className="flex justify-end pt-4 mt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

const SettingsView = () => {
    const [settings, setSettings] = useState({
        school_geofence_polygon: '[]',
        school_year_start_date: '',
        school_year_end_date: ''
    });
    const [polygonPoints, setPolygonPoints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Default Jakarta

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/get_settings.php`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSettings(prev => ({ ...prev, ...data.data }));
                    const savedPolygon = JSON.parse(data.data.school_geofence_polygon || '[]');
                    setPolygonPoints(savedPolygon);
                    if (savedPolygon.length > 0) {
                        setMapCenter(savedPolygon[0]); // Pusatkan peta pada titik pertama poligon
                    }
                }
            })
            .catch(err => {
                console.error("Error fetching settings:", err);
                setMessage({ text: 'Gagal memuat pengaturan.', type: 'error' });
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSaveSettings = async () => {
        setMessage({ text: '', type: '' });
        const updatedSettings = {
            ...settings,
            school_geofence_polygon: JSON.stringify(polygonPoints)
        };
        try {
            const response = await fetch(`${API_BASE_URL}/update_settings.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings),
            });
            const result = await response.json();
            if (result.success) {
                setMessage({ text: 'Pengaturan berhasil disimpan!', type: 'success' });
            } else {
                throw new Error(result.message || 'Gagal menyimpan pengaturan.');
            }
        } catch (error) {
            setMessage({ text: `Gagal menyimpan: ${error.message}`, type: 'error' });
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPolygonPoints(currentPoints => [...currentPoints, [lat, lng]]);
            },
        });
        return null;
    };

    const clearPolygon = () => {
        setPolygonPoints([]);
    };

    if (isLoading) {
       return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat Pengaturan...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Pengaturan Umum</h3>
            
            {message.text && (
                <div className={`p-3 mb-4 text-sm rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom Pengaturan Tanggal */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-2">Periode Semester</h4>
                    <div>
                        <label htmlFor="school_year_start_date" className="block text-sm font-medium text-gray-700">Tanggal Mulai Semester</label>
                        <input type="date" id="school_year_start_date" name="school_year_start_date" value={settings.school_year_start_date || ''} onChange={handleInputChange} className="mt-1 block w-full input-field"/>
                    </div>
                    <div>
                        <label htmlFor="school_year_end_date" className="block text-sm font-medium text-gray-700">Tanggal Selesai Semester</label>
                        <input type="date" id="school_year_end_date" name="school_year_end_date" value={settings.school_year_end_date || ''} onChange={handleInputChange} className="mt-1 block w-full input-field"/>
                    </div>
                </div>

                {/* Kolom Pengaturan Lokasi */}
                <div className="space-y-4">
                     <h4 className="font-semibold text-lg mb-2">Area Sekolah (Geofence)</h4>
                     <p className="text-sm text-gray-500">Klik pada peta untuk menambahkan titik-titik yang membentuk area sekolah. Minimal 3 titik untuk membentuk sebuah area.</p>
                    <div className="h-80 w-full rounded-lg overflow-hidden border">
                        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapEvents />
                            {polygonPoints.map((pos, index) => <Marker key={index} position={pos} />)}
                            {polygonPoints.length > 1 && <Polygon positions={polygonPoints} />}
                        </MapContainer>
                    </div>
                    <button onClick={clearPolygon} className="btn-secondary">
                        <Icon classes="fas fa-trash-alt mr-2" /> Bersihkan Area
                    </button>
                </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t">
                <button onClick={handleSaveSettings} className="btn-primary-attractive">
                    Simpan Semua Pengaturan
                </button>
            </div>
        </div>
    );
};
// --- Komponen Manajemen Kelas ---
const ClassesView = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // State untuk Modal Detail
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState(null);
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Fungsi untuk mendapatkan nilai numerik dari tingkatan kelas (X, XI, XII)
  const getClassLevelValue = (className) => {
    const nameUpper = className.toUpperCase();
    if (nameUpper.startsWith('XII ')) return 3;
    if (nameUpper.startsWith('XI ')) return 2;
    if (nameUpper.startsWith('X ')) return 1;
    return 0; // Untuk kelas yang tidak mengikuti format standar
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const classesPromise = fetch(`${MODULE_API_BASE_URL}/get_classes.php`);
      const teachersPromise = fetch(`${API_BASE_URL}/get_users.php?role_filter=teacher`);

      const [classesRes, teachersRes] = await Promise.all([classesPromise, teachersPromise]);

      if (!classesRes.ok) {
        const errTxt = await classesRes.text(); throw new Error(`HTTP error (classes)! status: ${classesRes.status}, ${errTxt.substring(0, 100)}`);
      }
      const classesData = await classesRes.json();
      if (!classesData.success) throw new Error(classesData.message || "Gagal mengambil data kelas.");

      const sortedClasses = (classesData.data || []).sort((a, b) => {
        const levelA = getClassLevelValue(a.class_name);
        const levelB = getClassLevelValue(b.class_name);

        if (levelA !== levelB) {
          return levelA - levelB;
        }
        return a.class_name.localeCompare(b.class_name);
      });
      setClasses(sortedClasses);


      if (!teachersRes.ok) {
        const errTxt = await teachersRes.text(); throw new Error(`HTTP error (teachers)! status: ${teachersRes.status}, ${errTxt.substring(0, 100)}`);
      }
      const teachersData = await teachersRes.json();
      if (!teachersData.success) throw new Error(teachersData.message || "Gagal mengambil data guru.");
      setTeachers(teachersData.data || []);

    } catch (err) {
      console.error("Error fetching classes/teachers data:", err);
      setError(`Gagal memuat data: ${err.message}`);
      setClasses([]);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refreshKey]);

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setIsModalOpen(true);
  };

  const handleDeleteClass = async (classId, className) => {
    if (window.confirm(`Yakin ingin menghapus kelas "${className}"? Pastikan tidak ada siswa atau jadwal yang masih terkait dengan kelas ini.`)) {
      setIsLoading(true);
      try {
        const response = await fetch(`${MODULE_API_BASE_URL}/delete_class.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: classId }),
        });
        if (!response.ok) {
          const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0, 150)}`);
        }
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        alert(result.message);
        setRefreshKey(k => k + 1);
      } catch (err) {
        console.error("Error deleting class:", err);
        alert(`Gagal menghapus kelas: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

    // NEW: Handler untuk membuka modal detail
    const handleViewDetails = async (classItem) => {
        setIsDetailsModalOpen(true);
        setSelectedClassForDetails(classItem);
        setIsLoadingStudents(true);
        setStudentsInClass([]);
        try {
            const response = await fetch(`${API_BASE_URL}/get_users.php?role_filter=student&class_level=${encodeURIComponent(classItem.class_name)}`);
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Gagal memuat siswa: ${errText.substring(0, 100)}`);
            }
            const result = await response.json();
            if (result.success) {
                setStudentsInClass(result.data || []);
            } else {
                throw new Error(result.message || "Gagal mengambil data siswa untuk kelas ini.");
            }
        } catch (error) {
            console.error("Error fetching students for class:", error);
            setStudentsInClass([]);
        } finally {
            setIsLoadingStudents(false);
        }
    };


  const handleClassSaved = () => {
    setRefreshKey(k => k + 1);
  };

  const openAddModal = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedClassForDetails(null);
  };

  const ipaClasses = classes.filter(cls => cls.class_name.toUpperCase().includes('IPA'));
  const ipsClasses = classes.filter(cls => cls.class_name.toUpperCase().includes('IPS'));
  const bahasaClasses = classes.filter(cls => cls.class_name.toUpperCase().includes('BAHASA'));
  const otherClasses = classes.filter(
    cls =>
      !cls.class_name.toUpperCase().includes('IPA') &&
      !cls.class_name.toUpperCase().includes('IPS') &&
      !cls.class_name.toUpperCase().includes('BAHASA')
  );

  const renderClassCards = (classArray) => {
    if (classArray.length === 0) {
        return <p className="text-gray-500 col-span-full text-center py-3">Tidak ada kelas dalam kategori ini.</p>;
    }
    return classArray.map((classItem) => (
        <div key={classItem.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-5 flex-grow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={classItem.class_name}>
                <Icon classes="fas fa-chalkboard mr-2 text-blue-500" />
                {classItem.class_name}
            </h3>
            <div className="text-sm text-gray-600 mb-1">
                <Icon classes="fas fa-user-tie mr-2 text-gray-400" />
                Wali Kelas: <span className="font-medium text-gray-700">{classItem.homeroom_teacher_name || <span className="italic">Belum ada</span>}</span>
            </div>
            <div className="text-sm text-gray-600">
                <Icon classes="fas fa-users mr-2 text-gray-400" />
                Jumlah Siswa: <span className="font-medium text-gray-700">{classItem.student_count}</span>
            </div>
            </div>
            <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end items-center space-x-2">
            <button
                onClick={() => handleViewDetails(classItem)}
                className="text-sm text-green-600 hover:text-green-800 font-medium py-1 px-3 rounded-md hover:bg-green-50 transition-colors duration-150 flex items-center"
                disabled={isLoading}
                title="Lihat Detail Siswa"
            >
                <Icon classes="fas fa-list-ul mr-1" /> Details
            </button>
            <button
                onClick={() => handleEditClass(classItem)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1 px-3 rounded-md hover:bg-indigo-50 transition-colors duration-150 flex items-center"
                disabled={isLoading}
                title="Edit Kelas"
            >
                <Icon classes="fas fa-edit mr-1" /> Edit
            </button>
            <button
                onClick={() => handleDeleteClass(classItem.id, classItem.class_name)}
                className="text-sm text-red-600 hover:text-red-800 font-medium py-1 px-3 rounded-md hover:bg-red-50 transition-colors duration-150 flex items-center"
                disabled={isLoading}
                title="Hapus Kelas"
            >
                <Icon classes="fas fa-trash-alt mr-1" /> Hapus
            </button>
            </div>
        </div>
    ));
  };


  if (isLoading && classes.length === 0 && teachers.length === 0) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat data kelas dan guru...</div>;
  if (error) return <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">{error}</div>;

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-6 px-6 pt-6 md:px-0 md:pt-0">
        <button
          onClick={openAddModal}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
        >
          <Icon classes="fas fa-plus mr-2" />Tambah Kelas
        </button>
      </div>

      {isLoading && classes.length > 0 && <p className="text-center text-gray-500 my-4 px-6 md:px-0">Memperbarui data...</p>}

      {(classes.length === 0 && !isLoading) ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-center py-5">Belum ada data kelas.</p>
        </div>
      ) : (
        <div className="space-y-8 px-6 pb-6 md:px-0 md:pb-0">
            <div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-blue-500 pb-2 flex items-center">
                    <Icon classes="fas fa-flask mr-3 text-blue-500" /> Jurusan IPA
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderClassCards(ipaClasses)}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-green-500 pb-2 flex items-center">
                    <Icon classes="fas fa-balance-scale mr-3 text-green-500" /> Jurusan IPS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderClassCards(ipsClasses)}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-purple-500 pb-2 flex items-center">
                    <Icon classes="fas fa-language mr-3 text-purple-500" /> Jurusan Bahasa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderClassCards(bahasaClasses)}
                </div>
            </div>

            {otherClasses.length > 0 && (
                <div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-400 pb-2 flex items-center">
                        <Icon classes="fas fa-ellipsis-h mr-3 text-gray-400" /> Lainnya
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {renderClassCards(otherClasses)}
                    </div>
                </div>
            )}
        </div>
      )}
      <AddEditClassModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onClassSaved={handleClassSaved}
        editingClass={editingClass}
        teachersList={teachers}
      />
      <ClassDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={closeDetailsModal}
          classItem={selectedClassForDetails}
          students={studentsInClass}
          isLoading={isLoadingStudents}
      />
    </div>
  );
};
const AddEditScheduleModal = ({ isOpen, onClose, onScheduleSaved, editingSchedule }) => {
    if (!isOpen) return null;
    const isEditMode = Boolean(editingSchedule && editingSchedule.id);

    const [courseId, setCourseId] = useState(isEditMode ? editingSchedule.course_id : '');
    const [teacherId, setTeacherId] = useState(isEditMode ? editingSchedule.teacher_id : '');
    const [studentClassLevel, setStudentClassLevel] = useState(isEditMode ? editingSchedule.student_class_level : '');
    const [dayOfWeek, setDayOfWeek] = useState(isEditMode ? editingSchedule.day_of_week : 'Senin');
    const [startTime, setStartTime] = useState(isEditMode ? editingSchedule.start_time?.substring(0,5) : '');
    const [endTime, setEndTime] = useState(isEditMode ? editingSchedule.end_time?.substring(0,5) : '');
    const [roomNumber, setRoomNumber] = useState(isEditMode ? editingSchedule.room_number : '');

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [allClasses, setAllClasses] = useState([]); // Untuk dropdown kelas di jadwal

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDropdown, setIsLoadingDropdown] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            setIsLoadingDropdown(true); setError('');
            try {
                const coursesPromise = fetch(`${MODULE_API_BASE_URL}/get_courses.php`);
                const teachersPromise = fetch(`${API_BASE_URL}/get_users.php?role_filter=teacher`);
                const allClassesPromise = fetch(`${MODULE_API_BASE_URL}/get_classes.php`);

                const [coursesRes, teachersRes, allClassesRes] = await Promise.all([coursesPromise, teachersPromise, allClassesPromise]);

                if (!coursesRes.ok) { const errTxt = await coursesRes.text(); throw new Error(`HTTP error courses! status: ${coursesRes.status}, ${errTxt.substring(0,100)}`);}
                const coursesData = await coursesRes.json();
                if (coursesData.success) setCourses(coursesData.data || []);
                else throw new Error(coursesData.message || "Gagal ambil data mata pelajaran.");

                if (!teachersRes.ok) { const errTxt = await teachersRes.text(); throw new Error(`HTTP error teachers! status: ${teachersRes.status}, ${errTxt.substring(0,100)}`);}
                const teachersData = await teachersRes.json();
                if (teachersData.success) setTeachers(teachersData.data || []);
                else throw new Error(teachersData.message || "Gagal ambil data guru.");

                if (!allClassesRes.ok) { const errTxt = await allClassesRes.text(); throw new Error(`HTTP error classes! status: ${allClassesRes.status}, ${errTxt.substring(0,100)}`);}
                const allClassesData = await allClassesRes.json();
                if (allClassesData.success) setAllClasses(allClassesData.data || []);
                else throw new Error(allClassesData.message || "Gagal ambil data kelas.");

            } catch (err) {
                console.error("Error fetching dropdown data for schedule modal:", err);
                setError("Gagal memuat data untuk form: " + err.message);
            } finally {
                setIsLoadingDropdown(false);
            }
        };
        fetchDataForDropdowns();
    }, []); // Hanya dijalankan sekali

    useEffect(() => {
        if (isEditMode && editingSchedule) {
            setCourseId(editingSchedule.course_id || '');
            setTeacherId(editingSchedule.teacher_id || '');
            setStudentClassLevel(editingSchedule.student_class_level || '');
            setDayOfWeek(editingSchedule.day_of_week || 'Senin');
            setStartTime(editingSchedule.start_time ? editingSchedule.start_time.substring(0,5) : '');
            setEndTime(editingSchedule.end_time ? editingSchedule.end_time.substring(0,5) : '');
            setRoomNumber(editingSchedule.room_number || '');
        } else {
            setCourseId(''); setTeacherId(''); setStudentClassLevel(''); setDayOfWeek('Senin');
            setStartTime(''); setEndTime(''); setRoomNumber('');
        }
    }, [isEditMode, editingSchedule]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccessMessage(''); setIsLoading(true);
        if (!courseId || !teacherId || !studentClassLevel || !dayOfWeek || !startTime || !endTime) {
            setError('Semua field wajib diisi (kecuali nomor ruangan).'); setIsLoading(false); return;
        }

        const endpoint = isEditMode ? `${MODULE_API_BASE_URL}/update_schedule.php` : `${MODULE_API_BASE_URL}/create_schedule.php`;
        const scheduleData = { id: isEditMode ? editingSchedule.id : undefined, course_id: courseId, teacher_id: teacherId, student_class_level: studentClassLevel, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, room_number: roomNumber };

        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scheduleData) });
            if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            setSuccessMessage(result.message);
            if (onScheduleSaved) onScheduleSaved();
            setTimeout(() => { setSuccessMessage(''); onClose(); }, 2000);
        } catch (err) { console.error("Error simpan jadwal:", err); setError(`Gagal: ${err.message}`);
        } finally { setIsLoading(false); }
    };

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" id="modal-backdrop">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">{isEditMode ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3><button onClick={onClose} disabled={isLoading}><Icon classes="fas fa-times text-gray-600 hover:text-gray-800" /></button></div>
                {error && <p className="text-red-500 text-sm mb-4 p-3 bg-red-100 rounded-md">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-4 p-3 bg-green-100 rounded-md">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="courseIdSchedule" className="block text-sm font-medium">Mata Pelajaran</label><select id="courseIdSchedule" value={courseId} onChange={e => setCourseId(e.target.value)} required disabled={isLoading || isLoadingDropdown || courses.length === 0} className="mt-1 w-full input-field">{courses.length === 0 && !isLoadingDropdown ? <option>Tidak ada mapel</option> : <option value="">Pilih Mapel</option>}{courses.map(c => <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>)}</select></div>
                        <div><label htmlFor="teacherIdSchedule" className="block text-sm font-medium">Guru Pengampu</label><select id="teacherIdSchedule" value={teacherId} onChange={e => setTeacherId(e.target.value)} required disabled={isLoading || isLoadingDropdown || teachers.length === 0} className="mt-1 w-full input-field">{teachers.length === 0 && !isLoadingDropdown ? <option>Tidak ada guru</option> : <option value="">Pilih Guru</option>}{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    </div>
                    <div>
                        <label htmlFor="studentClassLevelSchedule" className="block text-sm font-medium">Untuk Kelas</label>
                        <select
                            id="studentClassLevelSchedule"
                            value={studentClassLevel}
                            onChange={e => setStudentClassLevel(e.target.value)}
                            required
                            disabled={isLoading || isLoadingDropdown || allClasses.length === 0}
                            className="mt-1 w-full input-field">
                            {allClasses.length === 0 && !isLoadingDropdown ? <option>Tidak ada kelas</option> : <option value="">Pilih Kelas</option>}
                            {allClasses.map(cls => <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label htmlFor="dayOfWeekSchedule" className="block text-sm font-medium">Hari</label><select id="dayOfWeekSchedule" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} required disabled={isLoading} className="mt-1 w-full input-field">{days.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                        <div><label htmlFor="startTimeSchedule" className="block text-sm font-medium">Waktu Mulai</label><input type="time" id="startTimeSchedule" value={startTime} onChange={e => setStartTime(e.target.value)} required disabled={isLoading} className="mt-1 w-full input-field" /></div>
                        <div><label htmlFor="endTimeSchedule" className="block text-sm font-medium">Waktu Selesai</label><input type="time" id="endTimeSchedule" value={endTime} onChange={e => setEndTime(e.target.value)} required disabled={isLoading} className="mt-1 w-full input-field" /></div>
                    </div>
                    <div><label htmlFor="roomNumberSchedule" className="block text-sm font-medium">Nomor Ruangan <span className="text-xs">(Opsional)</span></label><input type="text" id="roomNumberSchedule" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} disabled={isLoading} className="mt-1 w-full input-field" /></div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading || isLoadingDropdown}
                            className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isLoadingDropdown}
                            className="px-5 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform active:scale-95 flex items-center"
                        >
                            {isLoading && <Icon classes="fas fa-spinner fa-spin mr-2" />}
                            {isEditMode ? 'Simpan Jadwal' : 'Tambah Jadwal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SchedulesView = () => {
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [uniqueClasses, setUniqueClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const fetchSchedules = useCallback(async () => {
        setIsLoading(true); setError('');
        try {
            const response = await fetch(`${MODULE_API_BASE_URL}/get_schedules.php`);
            if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) { throw new Error(`Respons server (schedules) bukan JSON.`); }
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Gagal mengambil data jadwal dari server.");

            const currentSchedules = data.data || [];
            setSchedules(currentSchedules);

            if (currentSchedules.length > 0) {
                const classLevels = [...new Set(currentSchedules.map(item => item.student_class_level))];
                setUniqueClasses(classLevels.sort());
            } else {
                setUniqueClasses([]);
            }
        } catch (err) {
            console.error("Error fetching schedules:", err);
            setError(`Gagal memuat jadwal: ${err.message}`);
            setSchedules([]);
            setUniqueClasses([]);
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules, refreshKey]);

    const handleClassCardClick = (className) => {
        if (selectedClass === className) {
            setSelectedClass(null);
        } else {
            setSelectedClass(className);
        }
    };

    const handleEditSchedule = (schedule) => { setEditingSchedule(schedule); setIsModalOpen(true); };
    const handleDeleteSchedule = async (scheduleId) => {
        if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
            try {
                const response = await fetch(`${MODULE_API_BASE_URL}/delete_schedule.php`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id: scheduleId})});
                if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                alert(result.message);
                setRefreshKey(k => k + 1);
            } catch (err) { console.error("Error delete schedule:", err); alert(`Gagal menghapus: ${err.message}`);}
        }
    };
    const handleScheduleSaved = () => {
        setRefreshKey(k => k + 1);
    };
    const openAddModal = () => { setEditingSchedule(null); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingSchedule(null);};

    const filteredSchedules = selectedClass
        ? schedules.filter(sch => sch.student_class_level === selectedClass)
        : [];

    if (isLoading && schedules.length === 0 && !selectedClass) return <div className="text-center py-10"><Icon classes="fas fa-spinner fa-spin text-2xl text-blue-500" /> Memuat...</div>;
    if (error) return <div className="text-center py-10 text-red-500 bg-red-50 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={openAddModal}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
              >
                <Icon classes="fas fa-plus mr-2" />Tambah Jadwal
              </button>
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Pilih Kelas:</h3>
                {isLoading && uniqueClasses.length === 0 && <p className="text-gray-500">Memuat daftar kelas...</p>}
                {!isLoading && uniqueClasses.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 text-gray-500 text-center py-5">
                        Belum ada jadwal untuk kelas manapun.
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uniqueClasses.map(className => (
                        <button
                            key={className}
                            onClick={() => handleClassCardClick(className)}
                            className={`p-4 rounded-lg shadow-md text-center font-medium transition-all duration-200 ease-in-out
                                        ${selectedClass === className
                                            ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-105'
                                            : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-lg'}`}
                        >
                           <Icon classes="fas fa-users mr-2" /> {className}
                        </button>
                    ))}
                </div>
            </div>

            {selectedClass && (
                <>
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Detail Jadwal untuk Kelas: <span className="text-blue-600">{selectedClass}</span></h3>
                    {isLoading && filteredSchedules.length === 0 && <p className="text-center text-gray-500 py-4">Memuat jadwal kelas {selectedClass}...</p>}
                    {!isLoading && filteredSchedules.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-gray-500 text-center py-5">
                            Tidak ada jadwal untuk kelas {selectedClass}.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto p-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="th-cell">Hari</th>
                                            <th className="th-cell">Waktu</th>
                                            <th className="th-cell">Mata Pelajaran (Kode)</th>
                                            <th className="th-cell">Guru</th>
                                            <th className="th-cell">Ruangan</th>
                                            <th className="th-cell">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredSchedules.map(sch => (
                                            <tr key={sch.id} className="hover:bg-gray-50">
                                                <td className="td-cell">{sch.day_of_week}</td>
                                                <td className="td-cell">{sch.start_time_formatted} - {sch.end_time_formatted}</td>
                                                <td className="td-cell">
                                                    <div className="text-sm font-medium text-gray-900">{sch.course_name} ({sch.course_code})</div>
                                                </td>
                                                <td className="td-cell">
                                                    <div className="text-sm font-medium text-gray-900">{sch.teacher_name}</div>
                                                </td>
                                                <td className="td-cell text-gray-500">{sch.room_number || '-'}</td>
                                                <td className="td-cell text-sm font-medium">
                                                    <button onClick={() => handleEditSchedule(sch)} className="text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors duration-150 mr-2">Edit</button>
                                                    <button onClick={() => handleDeleteSchedule(sch.id)} className="text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded-md hover:bg-red-50 transition-colors duration-150">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
            {!selectedClass && uniqueClasses.length > 0 && !isLoading && (
                 <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                    <p><Icon classes="fas fa-info-circle mr-2" />Pilih salah satu kelas di atas untuk melihat detail jadwalnya.</p>
                </div>
            )}
            <AddEditScheduleModal isOpen={isModalOpen} onClose={closeModal} onScheduleSaved={handleScheduleSaved} editingSchedule={editingSchedule} />
        </div>
    );
};

// --- Komponen Tampilan Dashboard Utama ---
const DashboardView = ({ onNavigate }) => { // Terima onNavigate sebagai prop
  const [stats, setStats] = useState({ teacher_count: 0, student_count: 0, class_count: 0, course_count: 0 }); // Tambahkan class_count dan course_count
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true); setStatsError('');
      try {
        // Asumsi get_dashboard_stats.php akan mengembalikan juga class_count dan course_count
        const response = await fetch(`${API_BASE_URL}/get_dashboard_stats.php`);
        if (!response.ok) { const errTxt = await response.text(); throw new Error(`HTTP error! status: ${response.status}, ${errTxt.substring(0,100)}`);}
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) { throw new Error(`Respons server (stats) bukan JSON.`); }
        const data = await response.json();
        if (data.success && data.data) {
          setStats(prevStats => ({ ...prevStats, ...data.data }));
        } else {
          throw new Error(data.message || "Gagal ambil statistik dari server.");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStatsError(error.message);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Data untuk kartu statistik, sesuaikan dengan data yang tersedia
  const statsData = [
    { title: 'Total Siswa', value: isLoadingStats ? <Icon classes="fas fa-spinner fa-spin"/> : stats.student_count, icon: 'fa-user-graduate', color: 'blue' },
    { title: 'Total Guru', value: isLoadingStats ? <Icon classes="fas fa-spinner fa-spin"/> : stats.teacher_count, icon: 'fa-chalkboard-teacher', color: 'green' },
    { title: 'Total Kelas', value: isLoadingStats ? <Icon classes="fas fa-spinner fa-spin"/> : (stats.class_count || 0), icon: 'fa-school', color: 'purple' }, // Pastikan 0 jika N/A
    { title: 'Total Mapel', value: isLoadingStats ? <Icon classes="fas fa-spinner fa-spin"/> : (stats.course_count || 0), icon: 'fa-book', color: 'yellow' }, // Pastikan 0 jika N/A
  ];

  const activities = [
    { title: 'Siswa Baru Terdaftar', time: '10 menit lalu', desc: 'John Doe telah terdaftar di sistem', icon: 'fa-user-plus', color: 'blue' },
    { title: 'Absensi Diambil', time: '25 menit lalu', desc: 'Prof. Smith telah mengambil absensi untuk Matematika 101', icon: 'fa-calendar-check', color: 'green' },
  ];

  // Aksi Cepat dimodifikasi
  const quickActions = [
    { label: 'Tambah Pengguna', icon: 'fa-user-plus', color: 'blue', view: 'users' },
    { label: 'Tambah Mapel', icon: 'fa-book', color: 'green', view: 'courses'},
    { label: 'Tambah Kelas', icon: 'fa-school', color: 'orange', view: 'classes' }, // Aksi baru
    { label: 'Buat Jadwal', icon: 'fa-calendar-plus', color: 'purple', view: 'schedules'},
    // { label: 'Generate Laporan', icon: 'fa-file-export', color: 'yellow', view: 'reports'}, // Laporan belum diimplementasikan
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', iconText: 'text-blue-800', buttonBg: 'bg-blue-100', buttonHoverBg: 'hover:bg-blue-200', buttonText: 'text-blue-800' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100', iconText: 'text-green-800', buttonBg: 'bg-green-100', buttonHoverBg: 'hover:bg-green-200', buttonText: 'text-green-800' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', iconText: 'text-purple-800', buttonBg: 'bg-purple-100', buttonHoverBg: 'hover:bg-purple-200', buttonText: 'text-purple-800' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', iconBg: 'bg-yellow-100', iconText: 'text-yellow-800', buttonBg: 'bg-yellow-100', buttonHoverBg: 'hover:bg-yellow-200', buttonText: 'text-yellow-800' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100', iconText: 'text-orange-800', buttonBg: 'bg-orange-100', buttonHoverBg: 'hover:bg-orange-200', buttonText: 'text-orange-800' }, // Warna baru
  };

  useEffect(() => {
    const canvas = document.getElementById('adminAttendanceChart');
    if (canvas) {
       const ctx = canvas.getContext('2d');
        if (ctx) {
            if (window.adminChartInstance) { window.adminChartInstance.destroy(); }
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.fillStyle = '#E9E9E9'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#3B82F6'; ctx.font = "16px Arial"; ctx.textAlign = "center";
            ctx.fillText("Placeholder Chart Absensi Admin", canvas.width / 2, canvas.height / 2);
        }
    }
  }, []);

  const handleQuickActionClick = (view) => {
    if (onNavigate && view) {
      onNavigate(view);
    } else {
      console.warn(`Navigasi ke view "${view}" tidak bisa dilakukan. Fungsi onNavigate tidak tersedia atau view tidak valid.`);
      alert(`Aksi belum terhubung ke navigasi.`);
    }
  };

  return (
    <div>
      {statsError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{statsError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map(stat => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500">{stat.title}</p><h3 className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</h3></div>
              <div className={`p-3 rounded-full ${colorClasses[stat.color]?.bg || 'bg-gray-50'} ${colorClasses[stat.color]?.text || 'text-gray-600'}`}><Icon classes={`fas ${stat.icon} text-xl`} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold text-gray-800">Aktivitas Terbaru</h2><button className="text-blue-600 hover:text-blue-800">Lihat Semua</button></div>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.title} className="flex items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className={`${colorClasses[activity.color]?.iconBg || 'bg-gray-100'} ${colorClasses[activity.color]?.iconText || 'text-gray-800'} p-3 rounded-lg mr-4`}><Icon classes={`fas ${activity.icon}`} /></div>
              <div className="flex-1"><div className="flex justify-between"><h4 className="font-medium text-gray-800">{activity.title}</h4><span className="text-sm text-gray-500">{activity.time}</span></div><p className="text-sm text-gray-500 mt-1">{activity.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Absensi Keseluruhan</h2><div className="h-64"><canvas id="adminAttendanceChart"></canvas></div></div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => handleQuickActionClick(action.view)} // Menggunakan handler baru
                className={`${colorClasses[action.color]?.buttonBg || 'bg-gray-100'} ${colorClasses[action.color]?.buttonHoverBg || 'hover:bg-gray-200'} ${colorClasses[action.color]?.buttonText || 'text-gray-800'} p-4 rounded-lg flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105`}
                style={{ minHeight: '100px' }} // Menjamin tinggi tombol konsisten
              >
                <Icon classes={`fas ${action.icon} text-2xl mb-2`} />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Komponen Sidebar Admin ---
const AdminSidebar = ({ onNavigate, activeView, onLogout, isSidebarOpen, user }) => {
  const navItemsAdmin = [
    { name: 'Dashboard', icon: 'fa-home', view: 'dashboard' },
    { name: 'Users', icon: 'fa-users', view: 'users' },
    { name: 'Mata Pelajaran', icon: 'fa-book-open', view: 'courses' },
    { name: 'Kelas', icon: 'fa-school', view: 'classes' },
    { name: 'Jadwal', icon: 'fa-calendar-alt', view: 'schedules' },
    { name: 'Reports', icon: 'fa-chart-bar', view: 'reports' },
    { name: 'Settings', icon: 'fa-cog', view: 'settings' },
  ];
  // const adminUser = { name: "Admin Utama", role: "Administrator", avatarUrl: "https://placehold.co/50x50/FF6347/FFFFFF?text=AU", logoUrl: "https://placehold.co/40x40/4A5568/FFFFFF?text=A" };

  return (
    <div className={`sidebar bg-white text-gray-800 w-64 min-h-screen shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static fixed md:z-40`}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <img
            src={`https://placehold.co/50x50/FF6347/FFFFFF?text=${user.name ? user.name.substring(0,2).toUpperCase() : 'AU'}`}
            alt="User"
            className="h-12 w-12 rounded-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/cccccc/ffffff?text=U"; }}
          />
          <div><p className="font-medium text-gray-800">{user.name || "Admin"}</p><p className="text-sm text-gray-500">{user.role || "Administrator"}</p></div>
        </div>
        <nav className="space-y-2">
          {navItemsAdmin.map(item => (
            <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.view); }} className={`nav-item flex items-center space-x-3 p-3 rounded-lg ${activeView === item.view ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}>
              <Icon classes={`fas ${item.icon} w-5 text-center`} /><span className="sidebar-text">{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <button onClick={onLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 w-full"><Icon classes="fas fa-sign-out-alt w-5 text-center" /><span className="sidebar-text">Logout</span></button>
      </div>
    </div>
  );
};

// --- Komponen Konten Utama Admin ---
const AdminMainContent = ({ activeView, onToggleSidebar, onNavigate }) => {
  // ... (kode di dalamnya tetap sama, hanya tambahkan 'settings' di logika judul dan render)
  let title = "Admin Dashboard";
  if (activeView === 'users') title = "Manajemen Pengguna";
  else if (activeView === 'courses') title = "Manajemen Mata Pelajaran";
  else if (activeView === 'classes') title = "Manajemen Kelas";
  else if (activeView === 'schedules') title = "Manajemen Jadwal";
  else if (activeView === 'reports') title = "Laporan";
  else if (activeView === 'settings') title = "Pengaturan"; // Tambahkan ini

  return (
    <div className="main-content flex-1 p-4 sm:p-8 bg-gray-100 min-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-200 md:hidden"><Icon classes="fas fa-bars text-gray-700" /></button>
      </div>
      {activeView === 'dashboard' && <DashboardView onNavigate={onNavigate} />}
      {activeView === 'users' && <UserManagementView />}
      {activeView === 'courses' && <CoursesView />}
      {activeView === 'classes' && <ClassesView />}
      {activeView === 'schedules' && <SchedulesView />}
      {activeView === 'reports' && <div className="placeholder-view">Tampilan Laporan (Belum Diimplementasikan)</div>}
      {activeView === 'settings' && <SettingsView />} {/* Tambahkan ini */}
    </div>
  );
};

// --- Komponen Aplikasi Utama (Admin Dashboard) ---
export default function AdminDashboard({ onLogout, user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavigate = (viewName) => {
    setActiveView(viewName);
    if (window.innerWidth < 768) { setIsSidebarOpen(false); }
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) { setIsSidebarOpen(false); }};
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAdminLogout = () => {
    if (onLogout) onLogout();
    else console.error("Fungsi onLogout tidak ada di props AdminDashboard.");
  };

  return (
    <div className="flex min-h-screen font-sans antialiased text-gray-900">
      <AdminSidebar
        onNavigate={handleNavigate}
        activeView={activeView}
        isSidebarOpen={isSidebarOpen}
        onLogout={handleAdminLogout}
        user={user}
      />
      <AdminMainContent
        activeView={activeView}
        onToggleSidebar={toggleSidebar}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
