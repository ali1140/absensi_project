<?php
// src/get_announcements.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$teacher_id = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : null;
$student_class_level = isset($_GET['class_level']) ? $_GET['class_level'] : null;

$sql = "SELECT a.id, a.title, a.content, a.created_at, u.name as teacher_name, a.class_level 
        FROM announcements a 
        JOIN users u ON a.teacher_id = u.id";
$params = [];
$types = "";

if ($teacher_id) {
    $sql .= " WHERE a.teacher_id = ?";
    $params[] = $teacher_id;
    $types .= "i";
} elseif ($student_class_level) {
    $sql .= " WHERE a.class_level = ? OR a.class_level = 'Semua Kelas'";
    $params[] = $student_class_level;
    $types .= "s";
}

$sql .= " ORDER BY a.created_at DESC";
$stmt = $conn->prepare($sql);

if (!empty($types)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'data' => $data]);
$stmt->close();
$conn->close();
?>