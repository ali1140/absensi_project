<?php
// src/delete_announcement.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Menangani permintaan pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include('db.php');

$input = json_decode(file_get_contents('php://input'), TRUE);
$id = $input['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Pengumuman diperlukan.']);
    exit();
}

$sql = "DELETE FROM announcements WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Pengumuman berhasil dihapus.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Pengumuman tidak ditemukan atau sudah dihapus.']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal menghapus pengumuman.']);
}
$stmt->close();
$conn->close();
?>
