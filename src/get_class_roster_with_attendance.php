<?php
// src/get_class_roster_with_attendance.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(); }

$class_level = isset($_GET['class_level']) ? trim($_GET['class_level']) : null;
$start_date = isset($_GET['start_date']) ? trim($_GET['start_date']) : null;
$end_date = isset($_GET['end_date']) ? trim($_GET['end_date']) : null;

if (!$class_level || !$start_date || !$end_date) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
    exit();
}

// 1. Dapatkan semua siswa di kelas ini
$sql_students = "SELECT id, name FROM users WHERE role = 'student' AND student_class_level = ? ORDER BY name ASC";
$stmt_students = $conn->prepare($sql_students);
$stmt_students->bind_param("s", $class_level);
$stmt_students->execute();
$result_students = $stmt_students->get_result();
$students = [];
while ($row = $result_students->fetch_assoc()) {
    $students[$row['id']] = ['id' => $row['id'], 'name' => $row['name'], 'attendance' => []];
}
$stmt_students->close();

if (empty($students)) {
    echo json_encode(['success' => true, 'data' => []]);
    exit();
}

// 2. Dapatkan data absensi untuk siswa-siswa tersebut pada rentang tanggal
$student_ids = array_keys($students);
$placeholders = implode(',', array_fill(0, count($student_ids), '?'));

$sql_attendance = "
    SELECT 
        ar.student_id,
        ar.attendance_date,
        ar.status,
        s.id as schedule_id
    FROM attendance_records ar
    JOIN schedules s ON ar.schedule_id = s.id
    WHERE ar.student_id IN ($placeholders)
    AND ar.attendance_date BETWEEN ? AND ?
    AND s.student_class_level = ?
";

$params = array_merge($student_ids, [$start_date, $end_date, $class_level]);
$types = str_repeat('i', count($student_ids)) . 'sss';

$stmt_attendance = $conn->prepare($sql_attendance);
$stmt_attendance->bind_param($types, ...$params);
$stmt_attendance->execute();
$result_attendance = $stmt_attendance->get_result();

while ($row = $result_attendance->fetch_assoc()) {
    $students[$row['student_id']]['attendance'][$row['attendance_date']] = [
        'status' => $row['status'],
        'schedule_id' => $row['schedule_id']
    ];
}
$stmt_attendance->close();

echo json_encode(['success' => true, 'data' => array_values($students)]);
$conn->close();
?>