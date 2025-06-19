<?php
// src/get_dashboard_stats.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$response = ['success' => false, 'message' => 'Gagal.', 'data' => [
    'teacher_count' => 0,
    'student_count' => 0,
    'class_count' => 0, // Inisialisasi
    'course_count' => 0  // Inisialisasi
]];

$teacherCount = 0;
$studentCount = 0;
$classCount = 0; // Variabel untuk kelas
$courseCount = 0; // Variabel untuk mata pelajaran

// Count teachers
$stmtTeachers = $conn->prepare("SELECT COUNT(id) as total FROM users WHERE role = 'teacher'");
if ($stmtTeachers && $stmtTeachers->execute()) {
    $row = $stmtTeachers->get_result()->fetch_assoc();
    $teacherCount = (int)($row['total'] ?? 0);
    $stmtTeachers->close();
}

// Count students
$stmtStudents = $conn->prepare("SELECT COUNT(id) as total FROM users WHERE role = 'student'");
if ($stmtStudents && $stmtStudents->execute()) {
    $row = $stmtStudents->get_result()->fetch_assoc();
    $studentCount = (int)($row['total'] ?? 0);
    $stmtStudents->close();
}

// Count classes
$stmtClasses = $conn->prepare("SELECT COUNT(id) as total FROM school_classes");
if ($stmtClasses && $stmtClasses->execute()) {
    $row = $stmtClasses->get_result()->fetch_assoc();
    $classCount = (int)($row['total'] ?? 0);
    $stmtClasses->close();
}

// Count courses
$stmtCourses = $conn->prepare("SELECT COUNT(id) as total FROM courses");
if ($stmtCourses && $stmtCourses->execute()) {
    $row = $stmtCourses->get_result()->fetch_assoc();
    $courseCount = (int)($row['total'] ?? 0);
    $stmtCourses->close();
}

// Cek jika semua query berhasil (minimal prepare-nya)
if ($stmtTeachers && $stmtStudents && $stmtClasses && $stmtCourses) {
    $response = [
        'success' => true,
        'message' => 'Statistik diambil.',
        'data' => [
            'teacher_count' => $teacherCount,
            'student_count' => $studentCount,
            'class_count' => $classCount,
            'course_count' => $courseCount
        ]
    ];
    http_response_code(200);
} else {
    // Jika ada kegagalan prepare statement, berikan pesan error umum
    $response['message'] = "Gagal mengambil beberapa statistik database.";
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>
