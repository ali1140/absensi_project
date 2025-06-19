<?php
// add_user.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), TRUE);
    if (isset($input['user_type'], $input['name'], $input['email'], $input['password'])) {
        $userTypeFrontend = $input['user_type'];
        $name = trim($input['name']);
        $email = trim($input['email']);
        $passwordInput = trim($input['password']);
        $student_class_level = ($userTypeFrontend === 'student' && isset($input['student_class_level'])) ? trim($input['student_class_level']) : null;
        $teacher_main_subject = ($userTypeFrontend === 'teacher' && isset($input['teacher_main_subject'])) ? trim($input['teacher_main_subject']) : null;
        $roleInDb = ($userTypeFrontend === 'teacher') ? 'teacher' : (($userTypeFrontend === 'student') ? 'student' : 'admin'); // Admin role juga bisa ditambahkan

        // Status default untuk pengguna baru adalah 'inactive'
        $status = 'inactive';

        // Validasi dasar, role 'admin' tidak memiliki student_class_level atau teacher_main_subject
        if (($roleInDb === 'student' && empty($student_class_level)) ||
            ($roleInDb === 'teacher' && empty($teacher_main_subject) && !isset($input['teacher_main_subject']))) { // teacher_main_subject opsional, jadi cek jika ada tapi kosong
            $response['message'] = 'Data spesifik peran tidak lengkap.'; http_response_code(400);
        } elseif (!empty($name) && filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($passwordInput) >= 6) {
            $stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmtCheck->bind_param("s", $email); $stmtCheck->execute(); $stmtCheck->store_result();
            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Email sudah terdaftar.'; http_response_code(409);
            } else {
                $hashedPassword = password_hash($passwordInput, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, student_class_level, teacher_main_subject, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                // Perhatikan tipe data: 6 string untuk name, email, password, role, student_class_level, teacher_main_subject, dan 1 string untuk status
                $stmt->bind_param("sssssss", $name, $email, $hashedPassword, $roleInDb, $student_class_level, $teacher_main_subject, $status);
                if ($stmt && $stmt->execute()) {
                    $response = ['success' => true, 'message' => ucfirst($userTypeFrontend) . ' berhasil ditambahkan.', 'id' => $conn->insert_id];
                    http_response_code(201);
                } else { $response['message'] = "Gagal: " . $stmt->error; http_response_code(500); }
                if($stmt) $stmt->close();
            }
            $stmtCheck->close();
        } else {
             $response['message'] = 'Data input tidak valid atau tidak lengkap.'; http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (user_type, name, email, password diperlukan).'; http_response_code(400);
    }
} else { $response['message'] = 'Metode tidak didukung.'; http_response_code(405); }
echo json_encode($response); $conn->close();
?>
