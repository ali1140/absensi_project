<?php
// delete_course.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Atau DELETE
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') { // Menggunakan POST
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);

        if ($id) {
            // Hati-hati: Menghapus course akan menghapus jadwal terkait (ON DELETE CASCADE)
            $sql = "DELETE FROM courses WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $response['success'] = true;
                    $response['message'] = 'Mata pelajaran berhasil dihapus.';
                    http_response_code(200);
                } else {
                    $response['message'] = 'Mata pelajaran tidak ditemukan atau sudah dihapus.';
                    http_response_code(404);
                }
            } else {
                $response['message'] = "Gagal menghapus mata pelajaran: " . $stmt->error;
                // Jika ada foreign key constraint error (misal, jadwal masih ada dan tidak ada ON DELETE CASCADE)
                if ($conn->errno == 1451) { 
                     $response['message'] = "Gagal menghapus: Mata pelajaran ini masih digunakan dalam jadwal.";
                     http_response_code(409); // Conflict
                } else {
                    http_response_code(500);
                }
            }
            $stmt->close();
        } else {
            $response['message'] = 'ID mata pelajaran tidak valid.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'ID mata pelajaran diperlukan.';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>
