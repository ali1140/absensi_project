<?php
// src/get_teacher_dashboard_stats.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    'success' => false,
    'message' => 'Gagal mengambil data.',
    'data' => [
        'total_classes' => 0,
        'total_courses' => 0,
    ]
];

$teacher_id = isset($_GET['teacher_id']) ? filter_var($_GET['teacher_id'], FILTER_VALIDATE_INT) : null;

if (!$teacher_id) {
    $response['message'] = 'ID Guru diperlukan.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Hitung Total Kelas yang Diajar (unik berdasarkan student_class_level)
$stmtClasses = $conn->prepare("SELECT COUNT(DISTINCT student_class_level) as total FROM schedules WHERE teacher_id = ?");
if ($stmtClasses) {
    $stmtClasses->bind_param("i", $teacher_id);
    $stmtClasses->execute();
    $result = $stmtClasses->get_result()->fetch_assoc();
    $response['data']['total_classes'] = (int)($result['total'] ?? 0);
    $stmtClasses->close();
}

// Hitung Total Mata Pelajaran yang Diajar (unik berdasarkan course_id)
$stmtCourses = $conn->prepare("SELECT COUNT(DISTINCT course_id) as total FROM schedules WHERE teacher_id = ?");
if ($stmtCourses) {
    $stmtCourses->bind_param("i", $teacher_id);
    $stmtCourses->execute();
    $result = $stmtCourses->get_result()->fetch_assoc();
    $response['data']['total_courses'] = (int)($result['total'] ?? 0);
    $stmtCourses->close();
}

$response['success'] = true;
$response['message'] = 'Statistik dashboard guru berhasil diambil.';
http_response_code(200);

echo json_encode($response);
$conn->close();
?>