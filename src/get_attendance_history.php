<?php
// src/get_attendance_history.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$response = ['success' => false, 'message' => 'Gagal mengambil data.', 'data' => []];

$teacher_id = isset($_GET['teacher_id']) ? filter_var($_GET['teacher_id'], FILTER_VALIDATE_INT) : null;
$class_level = isset($_GET['class_level']) ? trim($_GET['class_level']) : null;
$start_date = isset($_GET['start_date']) ? trim($_GET['start_date']) : null;
$end_date = isset($_GET['end_date']) ? trim($_GET['end_date']) : null;

if (!$teacher_id || !$class_level || !$start_date || !$end_date) {
    $response['message'] = 'Parameter tidak lengkap (memerlukan teacher_id, class_level, start_date, end_date).';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

$sql = "SELECT 
            ar.id,
            ar.attendance_date,
            ar.status,
            u.name as student_name,
            c.course_name
        FROM attendance_records ar
        JOIN schedules s ON ar.schedule_id = s.id
        JOIN users u ON ar.student_id = u.id
        JOIN courses c ON s.course_id = c.id
        WHERE s.teacher_id = ? 
        AND s.student_class_level = ?
        AND ar.attendance_date BETWEEN ? AND ?
        ORDER BY ar.attendance_date, c.course_name, u.name";

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("isss", $teacher_id, $class_level, $start_date, $end_date);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Riwayat absensi berhasil diambil.';
        $response['data'] = $data;
        http_response_code(200);
    } else {
        $response['message'] = "Gagal eksekusi: " . $stmt->error;
        http_response_code(500);
    }
    $stmt->close();
} else {
    $response['message'] = "Gagal persiapan statement: " . $conn->error;
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>