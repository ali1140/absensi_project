<?php
// update_course.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Atau PUT
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') { // Menggunakan POST untuk update
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['id'], $input['course_code'], $input['course_name'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
        $course_code = trim($input['course_code']);
        $course_name = trim($input['course_name']);
        $description = isset($input['description']) ? trim($input['description']) : null;

        if ($id && !empty($course_code) && !empty($course_name)) {
            // Cek apakah course_code baru sudah digunakan oleh course lain (kecuali course ini sendiri)
            $checkSql = "SELECT id FROM courses WHERE course_code = ? AND id != ?";
            $stmtCheck = $conn->prepare($checkSql);
            $stmtCheck->bind_param("si", $course_code, $id);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Kode mata pelajaran sudah digunakan oleh mata pelajaran lain.';
                http_response_code(409); // Conflict
            } else {
                $sql = "UPDATE courses SET course_code = ?, course_name = ?, description = ? WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssi", $course_code, $course_name, $description, $id);

                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        $response['success'] = true;
                        $response['message'] = 'Mata pelajaran berhasil diperbarui.';
                        http_response_code(200);
                    } else {
                        $response['success'] = true; // Query berhasil tapi tidak ada row terupdate
                        $response['message'] = 'Tidak ada perubahan data atau mata pelajaran tidak ditemukan.';
                        http_response_code(200);
                    }
                } else {
                    $response['message'] = "Gagal memperbarui mata pelajaran: " . $stmt->error;
                    http_response_code(500);
                }
                $stmt->close();
            }
            $stmtCheck->close();
        } else {
            $response['message'] = 'ID, Kode, dan Nama mata pelajaran tidak boleh kosong.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (id, course_code, course_name diperlukan).';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>
