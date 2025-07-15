<?php
// src/change_password.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);
$user_id = $input['user_id'] ?? null;
$current_password = $input['current_password'] ?? null;
$new_password = $input['new_password'] ?? null;

if (!$user_id || !$current_password || !$new_password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Semua field wajib diisi.']);
    exit();
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password baru minimal 6 karakter.']);
    exit();
}

$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($current_password, $user['password'])) {
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $update_stmt->bind_param("si", $hashed_password, $user_id);
        if ($update_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Password berhasil diubah.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal mengubah password.']);
        }
        $update_stmt->close();
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Password saat ini salah.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Pengguna tidak ditemukan.']);
}
$stmt->close();
$conn->close();
?>
