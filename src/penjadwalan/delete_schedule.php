<?php
// COBAK_REACT/SRC/penjadwalan/delete_schedule.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Path diubah

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') { 
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);

        if ($id) {
            $sql = "DELETE FROM schedules WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    $response['success'] = true;
                    $response['message'] = 'Jadwal berhasil dihapus.';
                    http_response_code(200);
                } else {
                    $response['message'] = 'Jadwal tidak ditemukan atau sudah dihapus.';
                    http_response_code(404);
                }
            } else {
                $response['message'] = "Gagal menghapus jadwal: " . $stmt->error;
                http_response_code(500);
            }
            $stmt->close();
        } else {
            $response['message'] = 'ID jadwal tidak valid.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'ID jadwal diperlukan.';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>