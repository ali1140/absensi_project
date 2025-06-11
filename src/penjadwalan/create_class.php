<?php
// File: COBAK_REACT/SRC/penjadwalan/create_class.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Sesuaikan path ke file koneksi database Anda

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['class_name'])) {
        $class_name = trim($input['class_name']);
        $homeroom_teacher_id = isset($input['homeroom_teacher_id']) && !empty($input['homeroom_teacher_id']) 
                                ? filter_var($input['homeroom_teacher_id'], FILTER_VALIDATE_INT) 
                                : null;

        // Validasi tambahan jika homeroom_teacher_id tidak valid setelah filter_var
        if ($homeroom_teacher_id === false && isset($input['homeroom_teacher_id']) && $input['homeroom_teacher_id'] !== '' && $input['homeroom_teacher_id'] !== null) {
            $response['message'] = 'ID Wali Kelas tidak valid.';
            http_response_code(400);
            echo json_encode($response);
            exit();
        }

        if (!empty($class_name)) {
            // Cek apakah class_name sudah ada
            $checkSql = "SELECT id FROM school_classes WHERE class_name = ?";
            $stmtCheck = $conn->prepare($checkSql);
            $stmtCheck->bind_param("s", $class_name);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Nama kelas sudah ada.';
                http_response_code(409); // Conflict
            } else {
                $sql = "INSERT INTO school_classes (class_name, homeroom_teacher_id) VALUES (?, ?)";
                $stmt = $conn->prepare($sql);
                // bind_param 'si' untuk string dan integer (integer bisa null)
                $stmt->bind_param("si", $class_name, $homeroom_teacher_id);

                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Kelas berhasil ditambahkan.';
                    $response['id'] = $conn->insert_id;
                    http_response_code(201); // Created
                } else {
                    $response['message'] = "Gagal menambahkan kelas: " . $stmt->error;
                    // Cek jika error disebabkan oleh foreign key constraint (wali kelas tidak ada)
                    if ($conn->errno == 1452 && $homeroom_teacher_id !== null) {
                        $response['message'] = "Gagal menambahkan kelas: ID Wali Kelas tidak ditemukan di data guru.";
                    }
                    http_response_code(500);
                }
                $stmt->close();
            }
            $stmtCheck->close();
        } else {
            $response['message'] = 'Nama kelas tidak boleh kosong.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (class_name diperlukan).';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>