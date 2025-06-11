<?php
// delete_user.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');
include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), TRUE);
    if (isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            if ($stmt) {
                $stmt->bind_param("i", $id); 
                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) { $response = ['success' => true, 'message' => 'Pengguna berhasil dihapus.']; http_response_code(200); }
                    else { $response['message'] = 'Pengguna tidak ditemukan.'; http_response_code(404); }
                } else { $response['message'] = "Gagal: " . $stmt->error; http_response_code(500); }
                $stmt->close();
            } else { $response['message'] = "Gagal prepare: " . $conn->error; http_response_code(500); }
        } else { $response['message'] = 'ID tidak valid.'; http_response_code(400); }
    } else { $response['message'] = 'ID diperlukan.'; http_response_code(400); }
} else { $response['message'] = 'Metode tidak didukung.'; http_response_code(405); }
echo json_encode($response); $conn->close();
?>
