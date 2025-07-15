<?php
// src/get_recent_attendance.php
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

$teacher_id = isset($_GET['teacher_id']) ? filter_var($_GET['teacher_id'], FILTER_VALIDATE_INT) : null;

if (!$teacher_id) {
    $response['message'] = 'ID Guru diperlukan.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Query untuk mengambil data kehadiran terbaru berdasarkan guru
$sql = "SELECT 
            ar.id,
            ar.attendance_date,
            ar.status,
            s.student_class_level,
            c.course_name,
            u.name as student_name
        FROM attendance_records ar
        JOIN schedules s ON ar.schedule_id = s.id
        JOIN courses c ON s.course_id = c.id
        JOIN users u ON ar.student_id = u.id
        WHERE s.teacher_id = ?
        ORDER BY ar.created_at DESC
        LIMIT 5";

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param("i", $teacher_id);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            $row['attendance_date_formatted'] = date("d M Y", strtotime($row['attendance_date']));
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Data kehadiran terbaru berhasil diambil.';
        $response['data'] = $data;
        http_response_code(200);
    } else {
        $response['message'] = "Gagal mengeksekusi query: " . $stmt->error;
        http_response_code(500);
    }
    $stmt->close();
} else {
    $response['message'] = "Gagal mempersiapkan statement: " . $conn->error;
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>