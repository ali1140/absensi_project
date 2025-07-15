<?php
// src/get_student_attendance_summary.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Gagal mengambil data.', 'data' => []];

$student_id = isset($_GET['student_id']) ? filter_var($_GET['student_id'], FILTER_VALIDATE_INT) : null;

if (!$student_id) {
    $response['message'] = 'ID Siswa diperlukan.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// 1. Dapatkan semua mata pelajaran yang diikuti siswa
$sql_courses = "SELECT DISTINCT c.id, c.course_name 
                FROM schedules s 
                JOIN courses c ON s.course_id = c.id 
                WHERE s.student_class_level = (SELECT student_class_level FROM users WHERE id = ?)";

$stmt_courses = $conn->prepare($sql_courses);
$stmt_courses->bind_param("i", $student_id);
$stmt_courses->execute();
$result_courses = $stmt_courses->get_result();

$courses_summary = [];
while ($row = $result_courses->fetch_assoc()) {
    $courses_summary[$row['id']] = [
        'course_id' => $row['id'],
        'course_name' => $row['course_name'],
        'summary' => [
            'Present' => 0,
            'Absent' => 0,
            'Late' => 0,
            'Excused' => 0
        ]
    ];
}
$stmt_courses->close();


// 2. Dapatkan ringkasan absensi untuk siswa ini
$sql_summary = "SELECT 
                    s.course_id,
                    ar.status,
                    COUNT(ar.id) as count
                FROM attendance_records ar
                JOIN schedules s ON ar.schedule_id = s.id
                WHERE ar.student_id = ?
                GROUP BY s.course_id, ar.status";

$stmt_summary = $conn->prepare($sql_summary);
$stmt_summary->bind_param("i", $student_id);
$stmt_summary->execute();
$result_summary = $stmt_summary->get_result();

while ($row = $result_summary->fetch_assoc()) {
    $course_id = $row['course_id'];
    $status = $row['status'];
    $count = (int)$row['count'];

    if (isset($courses_summary[$course_id]) && isset($courses_summary[$course_id]['summary'][$status])) {
        $courses_summary[$course_id]['summary'][$status] = $count;
    }
}
$stmt_summary->close();

$response['success'] = true;
$response['message'] = 'Ringkasan absensi berhasil diambil.';
$response['data'] = array_values($courses_summary); // Convert from associative array to indexed array
http_response_code(200);

echo json_encode($response);
$conn->close();
?>