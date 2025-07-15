<?php
// src/create_announcement.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);
$teacher_id = $input['teacher_id'] ?? null;
$class_level = $input['class_level'] ?? null;
$title = $input['title'] ?? null;
$content = $input['content'] ?? null;

if (!$teacher_id || !$class_level || !$title || !$content) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit();
}

$sql = "INSERT INTO announcements (teacher_id, class_level, title, content) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isss", $teacher_id, $class_level, $title, $content);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Pengumuman berhasil dibuat.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal membuat pengumuman.']);
}
$stmt->close();
$conn->close();
?>