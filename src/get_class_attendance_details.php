<?php
// src/get_class_attendance_details.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
date_default_timezone_set('Asia/Jakarta');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$schedule_id = isset($_GET['schedule_id']) ? filter_var($_GET['schedule_id'], FILTER_VALIDATE_INT) : null;
$class_level = isset($_GET['class_level']) ? trim($_GET['class_level']) : null;
$attendance_date = date('Y-m-d');

if (!$schedule_id || !$class_level) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parameter schedule_id dan class_level diperlukan.']);
    exit();
}

$sql = "
    SELECT 
        u.id as student_id,
        u.name as student_name,
        ar.status as attendance_status
    FROM users u
    LEFT JOIN attendance_records ar ON u.id = ar.student_id 
        AND ar.schedule_id = ? 
        AND ar.attendance_date = ?
    WHERE u.role = 'student' AND u.student_class_level = ?
    ORDER BY u.name ASC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit();
}

$stmt->bind_param("iss", $schedule_id, $attendance_date, $class_level);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while($row = $result->fetch_assoc()) {
    $row['attendance_status'] = $row['attendance_status'] ?? 'Absent';
    $data[] = $row;
}
$stmt->close();

echo json_encode(['success' => true, 'data' => $data]);
$conn->close();
?>
