<?php
// src/get_active_session.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$schedule_id = isset($_GET['schedule_id']) ? intval($_GET['schedule_id']) : 0;

if ($schedule_id === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Jadwal tidak valid.']);
    exit;
}

try {
    // Mengambil kolom `generated_code` dan `expires_at` sesuai dengan skema database
    $stmt = $conn->prepare("SELECT generated_code, expires_at FROM attendance_sessions WHERE schedule_id = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
    $stmt->bind_param("i", $schedule_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $session = $result->fetch_assoc();
        // Mengembalikan response dengan key `code` dan `expires_at` untuk konsistensi di frontend
        echo json_encode(['success' => true, 'session' => [
            'code' => $session['generated_code'],
            'expires_at' => $session['expires_at']
        ]]);
    } else {
        echo json_encode(['success' => true, 'session' => null]);
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
