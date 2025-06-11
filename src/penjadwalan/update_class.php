<?php
// File: COBAK_REACT/SRC/penjadwalan/update_class.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Atau PUT jika Anda prefer
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Sesuaikan path ke file koneksi database Anda

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') { // Menggunakan POST untuk update agar konsisten
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['id'], $input['class_name'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
        $class_name = trim($input['class_name']);
        $homeroom_teacher_id = isset($input['homeroom_teacher_id']) && !empty($input['homeroom_teacher_id']) 
                                ? filter_var($input['homeroom_teacher_id'], FILTER_VALIDATE_INT) 
                                : null;

        if ($homeroom_teacher_id === false && isset($input['homeroom_teacher_id']) && $input['homeroom_teacher_id'] !== '' && $input['homeroom_teacher_id'] !== null) {
            $response['message'] = 'ID Wali Kelas tidak valid.';
            http_response_code(400);
            echo json_encode($response);
            exit();
        }
        
        if ($id && !empty($class_name)) {
            // Cek apakah class_name baru sudah digunakan oleh kelas lain (kecuali kelas ini sendiri)
            $checkSql = "SELECT id FROM school_classes WHERE class_name = ? AND id != ?";
            $stmtCheck = $conn->prepare($checkSql);
            $stmtCheck->bind_param("si", $class_name, $id);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Nama kelas sudah digunakan oleh kelas lain.';
                http_response_code(409); // Conflict
            } else {
                $sql = "UPDATE school_classes SET class_name = ?, homeroom_teacher_id = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                // bind_param 'sii' untuk string, integer (bisa null), integer
                $stmt->bind_param("sii", $class_name, $homeroom_teacher_id, $id);

                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        $response['success'] = true;
                        $response['message'] = 'Kelas berhasil diperbarui.';
                        http_response_code(200);
                    } else {
                        $response['success'] = true; // Query berhasil tapi mungkin tidak ada perubahan data
                        $response['message'] = 'Tidak ada perubahan data atau kelas tidak ditemukan.';
                        http_response_code(200);
                    }
                } else {
                    $response['message'] = "Gagal memperbarui kelas: " . $stmt->error;
                    if ($conn->errno == 1452 && $homeroom_teacher_id !== null) {
                        $response['message'] = "Gagal memperbarui kelas: ID Wali Kelas tidak ditemukan di data guru.";
                    }
                    http_response_code(500);
                }
                $stmt->close();
            }
            $stmtCheck->close();
        } else {
            $response['message'] = 'ID dan Nama kelas tidak boleh kosong.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (id dan class_name diperlukan).';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>