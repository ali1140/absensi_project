<?php
// src/create_attendance_session.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'db.php';
date_default_timezone_set('Asia/Jakarta');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$schedule_id = $input['schedule_id'] ?? 0;
$duration_type = $input['duration_type'] ?? 'custom';
$custom_minutes = $input['custom_minutes'] ?? 5;
$class_type = $input['class_type'] ?? 'Offline';

if ($schedule_id === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Jadwal tidak valid.']);
    exit;
}

// Hapus sesi yang sudah kedaluwarsa untuk jadwal ini terlebih dahulu
$delete_stmt = $conn->prepare("DELETE FROM attendance_sessions WHERE schedule_id = ? AND expires_at <= NOW()");
$delete_stmt->bind_param("i", $schedule_id);
$delete_stmt->execute();
$delete_stmt->close();


// Cek sesi aktif yang sudah ada untuk jadwal ini
$check_stmt = $conn->prepare("SELECT id FROM attendance_sessions WHERE schedule_id = ? AND expires_at > NOW()");
$check_stmt->bind_param("i", $schedule_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
if ($check_result->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['success' => false, 'message' => 'Sudah ada sesi presensi yang aktif untuk kelas ini.']);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// Fungsi untuk membuat kode unik 6 digit
function generateUniqueCode($conn) {
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= mt_rand(0, 9);
        }
        $stmt = $conn->prepare("SELECT id FROM attendance_sessions WHERE generated_code = ? AND expires_at > NOW()");
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();
    } while ($result->num_rows > 0);
    return $code;
}

$code = generateUniqueCode($conn);

// Menghitung waktu kedaluwarsa
$expiry_time = new DateTime();
if ($duration_type === 'schedule_end') {
    $schedule_stmt = $conn->prepare("SELECT end_time FROM schedules WHERE id = ?");
    $schedule_stmt->bind_param("i", $schedule_id);
    $schedule_stmt->execute();
    $schedule_result = $schedule_stmt->get_result();
    if ($schedule_row = $schedule_result->fetch_assoc()) {
        $end_time_str = $schedule_row['end_time'];
        $expiry_time = new DateTime(date('Y-m-d') . ' ' . $end_time_str);
    }
    $schedule_stmt->close();
} else {
    $expiry_time->add(new DateInterval('PT' . intval($custom_minutes) . 'M'));
}
$expiry_time_mysql = $expiry_time->format('Y-m-d H:i:s');


// Masukkan sesi baru ke database
$stmt = $conn->prepare("INSERT INTO attendance_sessions (schedule_id, generated_code, expires_at, class_type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $schedule_id, $code, $expiry_time_mysql, $class_type);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Sesi presensi berhasil dibuat.',
        'code' => $code,
        'expires_at' => $expiry_time_mysql
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal membuat sesi presensi: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>