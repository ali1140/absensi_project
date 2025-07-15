<?php
// src/reset_password.php (BERKAS DIPERBARUI)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);
$email = $input['email'] ?? null;
$token = $input['token'] ?? null;
$new_password = $input['password'] ?? null;

if (!$email || !$token || !$new_password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email, kode verifikasi, dan password baru diperlukan.']);
    exit();
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password minimal harus 6 karakter.']);
    exit();
}

// Menggunakan interval 5 menit
$stmt = $conn->prepare("SELECT email FROM password_resets WHERE email = ? AND token = ? AND created_at >= NOW() - INTERVAL 5 MINUTE");
$stmt->bind_param("ss", $email, $token);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $email = $row['email'];
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    $stmt_update = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt_update->bind_param("ss", $hashed_password, $email);
    
    if ($stmt_update->execute()) {
        $stmt_delete = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt_delete->bind_param("s", $email);
        $stmt_delete->execute();
        $stmt_delete->close();

        echo json_encode(['success' => true, 'message' => 'Password berhasil direset. Silakan login dengan password baru Anda.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal memperbarui password.']);
    }
    $stmt_update->close();
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Kode verifikasi tidak valid atau sudah kedaluwarsa.']);
}
$stmt->close();
$conn->close();
?>