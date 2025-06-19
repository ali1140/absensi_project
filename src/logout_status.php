<?php
// src/logout_status.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['user_id'])) {
        $userId = filter_var($input['user_id'], FILTER_VALIDATE_INT);

        if ($userId) {
            $sql = "UPDATE users SET status = 'inactive' WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $userId);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Status pengguna berhasil diperbarui menjadi tidak aktif.';
                http_response_code(200);
            } else {
                $response['message'] = "Gagal memperbarui status: " . $stmt->error;
                http_response_code(500);
            }
            $stmt->close();
        } else {
            $response['message'] = 'ID pengguna tidak valid.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'ID pengguna diperlukan.';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>
