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
        $roleInDb = ($userTypeFrontend === 'teacher') ? 'teacher' : (($userTypeFrontend === 'student') ? 'student' : null);
        
        if ($roleInDb && !empty($name) && filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($passwordInput) >= 6) {
            $stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = ?");
            $stmtCheck->bind_param("s", $email); $stmtCheck->execute(); $stmtCheck->store_result();
            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Email sudah terdaftar.'; http_response_code(409); 
            } else {
                $hashedPassword = password_hash($passwordInput, PASSWORD_DEFAULT);
                $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, student_class_level, teacher_main_subject) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssss", $name, $email, $hashedPassword, $roleInDb, $student_class_level, $teacher_main_subject);
                if ($stmt && $stmt->execute()) {
                    $response = ['success' => true, 'message' => ucfirst($roleInDb) . ' berhasil ditambahkan.', 'id' => $conn->insert_id];
                    http_response_code(201); 
                } else { $response['message'] = "Gagal: " . $stmt->error; http_response_code(500); }
                if($stmt) $stmt->close();
            }
            $stmtCheck->close();
        } else { /* Error handling validasi input */ }
    } else { /* Error handling data tidak lengkap */ }
} else { /* Error handling metode tidak didukung */ }
echo json_encode($response); $conn->close();
?>
