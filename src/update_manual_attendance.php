<?php
// src/update_manual_attendance.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
date_default_timezone_set('Asia/Jakarta');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$student_id = $input['student_id'] ?? null;
$schedule_id = $input['schedule_id'] ?? null;
$new_status = $input['status'] ?? null;
$attendance_date = date('Y-m-d');

if (!$student_id || !$schedule_id || !$new_status) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit();
}

$sql = "
    INSERT INTO attendance_records (student_id, schedule_id, attendance_date, status) 
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE status = VALUES(status)
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database prepare error: ' . $conn->error]);
    exit();
}

$stmt->bind_param("iiss", $student_id, $schedule_id, $attendance_date, $new_status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status kehadiran berhasil diperbarui.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal memperbarui status: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
