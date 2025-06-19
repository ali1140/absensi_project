<?php
// update_user.php
// FILE INI TIDAK MENGUBAH STATUS 'active'/'inactive' OTOMATIS
// Status 'active'/'inactive' akan diubah hanya melalui login.php dan logout_status.php
// Jika Anda ingin admin bisa mengaktifkan/menonaktifkan akun secara manual,
// ini adalah tempat yang tepat untuk menambahkan field 'account_enabled' terpisah.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), TRUE);
    if (isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
        if (!$id) { $response['message'] = 'ID tidak valid.'; http_response_code(400); /* ... exit ... */ }

        $fieldsToUpdate = []; $params = []; $types = "";
        if (isset($input['name']) && !empty(trim($input['name']))) { $fieldsToUpdate[] = "name = ?"; $params[] = trim($input['name']); $types .= "s"; }
        if (isset($input['email']) && filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL)) {
            $email = trim($input['email']);
            $stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $stmtCheck->bind_param("si", $email, $id); $stmtCheck->execute(); $stmtCheck->store_result();
            if ($stmtCheck->num_rows > 0) { $response['message'] = 'Email sudah digunakan.'; http_response_code(409); /* ... exit ... */ }
            $stmtCheck->close();
            $fieldsToUpdate[] = "email = ?"; $params[] = $email; $types .= "s";
        }
        if (isset($input['user_type']) && in_array(trim($input['user_type']), ['student', 'teacher', 'admin'])) { $fieldsToUpdate[] = "role = ?"; $params[] = trim($input['user_type']); $types .= "s"; }
        if (array_key_exists('student_class_level', $input)) { $fieldsToUpdate[] = "student_class_level = ?"; $params[] = trim($input['student_class_level']) ?: null; $types .= "s"; } // Allow empty string to set NULL
        if (array_key_exists('teacher_main_subject', $input)) { $fieldsToUpdate[] = "teacher_main_subject = ?"; $params[] = trim($input['teacher_main_subject']) ?: null; $types .= "s"; } // Allow empty string to set NULL

        // Perhatian: Kolom 'status' tidak lagi diupdate dari sini.
        // Status 'active'/'inactive' diubah hanya oleh login.php dan logout_status.php

        if (isset($input['password']) && !empty(trim($input['password']))) {
            $passwordInput = trim($input['password']);
            if (strlen($passwordInput) < 6) { $response['message'] = 'Password min 6 karakter.'; http_response_code(400); /* ... exit ... */ }
            $fieldsToUpdate[] = "password = ?"; $params[] = password_hash($passwordInput, PASSWORD_DEFAULT); $types .= "s";
        }

        if (count($fieldsToUpdate) > 0) {
            $params[] = $id; $types .= "i";
            $sql = "UPDATE users SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($types, ...$params);
                if ($stmt->execute()) {
                    $response = ['success' => true, 'message' => ($stmt->affected_rows > 0 ? 'Pengguna diperbarui.' : 'Tidak ada perubahan.') ];
                    http_response_code(200);
                } else { $response['message'] = "Gagal: " . $stmt->error; http_response_code(500); }
                $stmt->close();
            } else { $response['message'] = "Gagal prepare: " . $conn->error; http_response_code(500); }
        } else { $response['message'] = 'Tidak ada data untuk diupdate.'; http_response_code(400); }
    } else { $response['message'] = 'ID diperlukan.'; http_response_code(400); }
} else { $response['message'] = 'Metode tidak didukung.'; http_response_code(405); }
echo json_encode($response); $conn->close();
?>
