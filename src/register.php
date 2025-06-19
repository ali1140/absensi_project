<?php
// File: COBAK_REACT/SRC/register.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include('db.php'); // Menghubungkan dengan database

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    // Memastikan data yang diperlukan diterima
    if (isset($input['name'], $input['email'], $input['password'])) {
        $name = trim($input['name']);
        $email = trim($input['email']);
        $passwordInput = trim($input['password']);
        $role = 'student'; // Default role untuk registrasi publik

        // Ambil student_class_level jika ada, jika tidak, biarkan null
        $student_class_level = isset($input['student_class_level']) && !empty(trim($input['student_class_level']))
                               ? trim($input['student_class_level'])
                               : null;

        // Default status untuk pengguna baru yang mendaftar adalah 'inactive'
        $status = 'inactive';

        // Validasi dasar
        if (empty($name)) {
            $response['message'] = 'Nama tidak boleh kosong.';
            http_response_code(400);
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response['message'] = 'Format email tidak valid.';
            http_response_code(400);
        } elseif (strlen($passwordInput) < 6) {
            $response['message'] = 'Password minimal harus 6 karakter.';
            http_response_code(400);
        } elseif ($student_class_level === null) { // Jika registrasi siswa wajib memilih kelas
            $response['message'] = 'Kelas wajib dipilih untuk pendaftaran siswa.';
            http_response_code(400);
        }
         else {
            // Memeriksa apakah email sudah terdaftar
            $checkEmailSql = "SELECT id FROM users WHERE email = ?";
            $stmtCheck = $conn->prepare($checkEmailSql);
            $stmtCheck->bind_param("s", $email);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Email sudah terdaftar.';
                http_response_code(409); // Conflict
            } else {
                $hashedPassword = password_hash($passwordInput, PASSWORD_DEFAULT);

                // Kolom teacher_main_subject akan NULL untuk siswa
                $teacher_main_subject = null;

                // Nama kolom di tabel users: name, email, password, role, student_class_level, teacher_main_subject, status
                $insertQuery = "INSERT INTO users (name, email, password, role, student_class_level, teacher_main_subject, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $stmtInsert = $conn->prepare($insertQuery);
                // Tipe data: s (name), s (email), s (password), s (role), s (student_class_level), s (teacher_main_subject), s (status)
                $stmtInsert->bind_param("sssssss", $name, $email, $hashedPassword, $role, $student_class_level, $teacher_main_subject, $status);

                if ($stmtInsert->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Pendaftaran berhasil. Silakan login.';
                    http_response_code(201); // Created
                } else {
                    $response['message'] = "Pendaftaran gagal: " . $stmtInsert->error;
                    http_response_code(500);
                }
                $stmtInsert->close();
            }
            $stmtCheck->close();
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (name, email, password, dan kelas diperlukan).'; // Pesan disesuaikan
        http_response_code(400);
    }
} else {
    $response['message'] = 'Metode permintaan tidak didukung.';
    http_response_code(405); // Method Not Allowed
}

echo json_encode($response);
$conn->close();
?>
