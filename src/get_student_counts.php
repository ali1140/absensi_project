<?php
// src/get_student_counts.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(); }

$teacher_id = isset($_GET['teacher_id']) ? filter_var($_GET['teacher_id'], FILTER_VALIDATE_INT) : null;
if (!$teacher_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parameter teacher_id diperlukan.']);
    exit();
}

// QUERY YANG DIPERBAIKI: Menghitung siswa per kelas yang diajar oleh guru ini
// tanpa menggabungkan dengan tabel jadwal secara langsung.
$sql = "SELECT 
            u.student_class_level, 
            COUNT(u.id) AS student_count 
        FROM 
            users u
        WHERE 
            u.role = 'student' 
            AND u.student_class_level IN (
                SELECT DISTINCT s.student_class_level 
                FROM schedules s 
                WHERE s.teacher_id = ?
            )
        GROUP BY 
            u.student_class_level";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();

$counts = [];
while ($row = $result->fetch_assoc()) {
    $counts[$row['student_class_level']] = (int)$row['student_count'];
}

echo json_encode(['success' => true, 'data' => $counts]);
$conn->close();
?>