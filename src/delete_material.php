<?php
// src/delete_material.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);
$id = $input['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Materi diperlukan.']);
    exit();
}

// Ambil path berkas sebelum menghapus dari DB
$stmt_get = $conn->prepare("SELECT file_path FROM materials WHERE id = ?");
$stmt_get->bind_param("i", $id);
$stmt_get->execute();
$result = $stmt_get->get_result();
$material = $result->fetch_assoc();
$stmt_get->close();

if ($material) {
    // Hapus berkas dari server
    if (file_exists($material['file_path'])) {
        unlink($material['file_path']);
    }

    // Hapus record dari DB
    $stmt_delete = $conn->prepare("DELETE FROM materials WHERE id = ?");
    $stmt_delete->bind_param("i", $id);
    if ($stmt_delete->execute()) {
        echo json_encode(['success' => true, 'message' => 'Materi berhasil dihapus.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal menghapus materi dari database.']);
    }
    $stmt_delete->close();
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Materi tidak ditemukan.']);
}

$conn->close();
?>