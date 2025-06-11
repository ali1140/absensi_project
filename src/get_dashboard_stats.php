<?php
// get_dashboard_stats.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php'); 
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
$response = ['success' => false, 'message' => 'Gagal.', 'data' => ['teacher_count' => 0, 'student_count' => 0]];
$teacherCount = 0; $studentCount = 0;
// Count teachers
$stmtTeachers = $conn->prepare("SELECT COUNT(id) as total FROM users WHERE role = 'teacher'");
if ($stmtTeachers && $stmtTeachers->execute()) {
    $row = $stmtTeachers->get_result()->fetch_assoc(); $teacherCount = (int)($row['total'] ?? 0);
    $stmtTeachers->close();
}
// Count students
$stmtStudents = $conn->prepare("SELECT COUNT(id) as total FROM users WHERE role = 'student'");
if ($stmtStudents && $stmtStudents->execute()) {
    $row = $stmtStudents->get_result()->fetch_assoc(); $studentCount = (int)($row['total'] ?? 0);
    $stmtStudents->close();
}
if ($stmtTeachers && $stmtStudents) { // Cek jika kedua query berhasil (minimal prepare-nya)
    $response = ['success' => true, 'message' => 'Statistik diambil.', 'data' => ['teacher_count' => $teacherCount, 'student_count' => $studentCount]];
    http_response_code(200);
}
echo json_encode($response); $conn->close();
?>