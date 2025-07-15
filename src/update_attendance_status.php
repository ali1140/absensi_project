<?php
// src/update_attendance_status.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(); }

$input = json_decode(file_get_contents('php://input'), TRUE);

$student_id = $input['student_id'] ?? null;
$schedule_id = $input['schedule_id'] ?? null;
$date = $input['date'] ?? null;
$status = $input['status'] ?? null;
$class_level = $input['class_level'] ?? null;
$teacher_id = $input['teacher_id'] ?? null;


if (!$student_id || !$date || !$status || !$class_level || !$teacher_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit();
}

// Jika belum ada schedule_id, kita harus mencarinya
if (!$schedule_id) {
    // Cari jadwal yang paling relevan untuk siswa ini pada tanggal tersebut
    $dayOfWeek = date('l', strtotime($date)); // 'l' gives full day name, e.g., "Monday"
    $dayMapping = ['Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu', 'Sunday' => 'Minggu'];
    $dayInIndonesian = $dayMapping[$dayOfWeek];
    
    $sql_find_schedule = "SELECT id FROM schedules WHERE student_class_level = ? AND day_of_week = ? AND teacher_id = ? LIMIT 1";
    $stmt_find = $conn->prepare($sql_find_schedule);
    $stmt_find->bind_param("ssi", $class_level, $dayInIndonesian, $teacher_id);
    $stmt_find->execute();
    $result_find = $stmt_find->get_result();
    if ($row = $result_find->fetch_assoc()) {
        $schedule_id = $row['id'];
    }
    $stmt_find->close();
}

if (!$schedule_id) {
     http_response_code(404);
     echo json_encode(['success' => false, 'message' => 'Tidak ditemukan jadwal yang cocok untuk membuat data absensi baru.']);
     exit();
}


// Gunakan ON DUPLICATE KEY UPDATE untuk insert atau update
// Kunci uniknya ada di (schedule_id, student_id, attendance_date)
$sql = "INSERT INTO attendance_records (schedule_id, student_id, attendance_date, status) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iisss", $schedule_id, $student_id, $date, $status, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status kehadiran berhasil diperbarui.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal memperbarui status: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>