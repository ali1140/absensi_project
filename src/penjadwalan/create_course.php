<?php
// create_course.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['course_code'], $input['course_name'])) {
        $course_code = trim($input['course_code']);
        $course_name = trim($input['course_name']);
        $description = isset($input['description']) ? trim($input['description']) : null;

        if (!empty($course_code) && !empty($course_name)) {
            // Cek apakah course_code sudah ada
            $checkSql = "SELECT id FROM courses WHERE course_code = ?";
            $stmtCheck = $conn->prepare($checkSql);
            $stmtCheck->bind_param("s", $course_code);
            $stmtCheck->execute();
            $stmtCheck->store_result();

            if ($stmtCheck->num_rows > 0) {
                $response['message'] = 'Kode mata pelajaran sudah ada.';
                http_response_code(409); // Conflict
            } else {
                $sql = "INSERT INTO courses (course_code, course_name, description) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sss", $course_code, $course_name, $description);

                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Mata pelajaran berhasil ditambahkan.';
                    $response['id'] = $conn->insert_id;
                    http_response_code(201);
                } else {
                    $response['message'] = "Gagal menambahkan mata pelajaran: " . $stmt->error;
                    http_response_code(500);
                }
                $stmt->close();
            }
            $stmtCheck->close();
        } else {
            $response['message'] = 'Kode dan Nama mata pelajaran tidak boleh kosong.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (course_code, course_name diperlukan).';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>
