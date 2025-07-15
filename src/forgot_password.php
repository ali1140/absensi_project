<?php
// src/forgot_password.php (BERKAS DIPERBARUI)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');
include('mailer_config.php'); // Memuat konfigurasi email

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);
$email = $input['email'] ?? null;

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format email tidak valid.']);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => true, 'message' => 'Jika email Anda terdaftar, Anda akan menerima kode verifikasi.']);
    exit();
}
$stmt->close();

$stmt_delete = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
$stmt_delete->bind_param("s", $email);
$stmt_delete->execute();
$stmt_delete->close();

$token = '';
for ($i = 0; $i < 6; $i++) { $token .= mt_rand(0, 9); }

$stmt_insert = $conn->prepare("INSERT INTO password_resets (email, token) VALUES (?, ?)");
$stmt_insert->bind_param("ss", $email, $token);

if ($stmt_insert->execute()) {
    if (send_verification_code($email, $token)) {
        echo json_encode(['success' => true, 'message' => 'Kode verifikasi telah dikirim ke email Anda.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal mengirim email verifikasi. Silakan coba lagi.']);
    }
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal membuat kode verifikasi.']);
}
$stmt_insert->close();
$conn->close();
?>