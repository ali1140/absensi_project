<?php
// src/get_materials.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;

if ($course_id === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Mata Pelajaran diperlukan.']);
    exit();
}

$sql = "SELECT id, title, description, file_path, uploaded_at FROM materials WHERE course_id = ? ORDER BY uploaded_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $course_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode(['success' => true, 'data' => $data]);
$stmt->close();
$conn->close();
?>