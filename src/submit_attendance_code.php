<?php
// src/submit_attendance_code.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
date_default_timezone_set('Asia/Jakarta');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

function is_point_in_polygon($point, $polygon) {
    $x = $point[0];
    $y = $point[1];
    $is_inside = false;
    $vertices_count = count($polygon);
    for ($i = 0, $j = $vertices_count - 1; $i < $vertices_count; $j = $i++) {
        $vx_i = $polygon[$i][0];
        $vy_i = $polygon[$i][1];
        $vx_j = $polygon[$j][0];
        $vy_j = $polygon[$j][1];
        if ((($vy_i > $y) != ($vy_j > $y)) && ($x < ($vx_j - $vx_i) * ($y - $vy_i) / ($vy_j - $vy_i) + $vx_i)) {
            $is_inside = !$is_inside;
        }
    }
    return $is_inside;
}

$input = json_decode(file_get_contents('php://input'), true);
$student_id = $input['student_id'] ?? null;
$schedule_id = $input['schedule_id'] ?? null;
$submitted_code = $input['code'] ?? null;
$student_lat = $input['latitude'] ?? null;
$student_lon = $input['longitude'] ?? null;

if (!$student_id || !$schedule_id || !$submitted_code) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
    exit();
}

$stmt_session = $conn->prepare("SELECT class_type FROM attendance_sessions WHERE schedule_id = ? AND generated_code = ? AND expires_at > NOW()");
$stmt_session->bind_param("is", $schedule_id, $submitted_code);
$stmt_session->execute();
$result_session = $stmt_session->get_result();
$session_data = $result_session->fetch_assoc();
$stmt_session->close();

if (!$session_data) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Kode presensi tidak valid atau sudah kedaluwarsa.']);
    exit();
}

$class_type = $session_data['class_type'];

if ($class_type === 'Offline') {
    if ($student_lat === null || $student_lon === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Lokasi GPS Anda tidak terdeteksi.']);
        exit();
    }

    $settings_sql = "SELECT setting_value FROM school_settings WHERE setting_key = 'school_geofence_polygon'";
    $settings_result = $conn->query($settings_sql);
    $polygon_json = '[]';
    if ($row = $settings_result->fetch_assoc()) {
        $polygon_json = $row['setting_value'];
    }
    $polygon_vertices = json_decode($polygon_json, true);

    if (count($polygon_vertices) < 3) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Area sekolah belum ditentukan oleh admin.']);
        exit();
    }

    $student_point = [$student_lat, $student_lon];
    if (!is_point_in_polygon($student_point, $polygon_vertices)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Lokasi Anda berada di luar area sekolah yang diizinkan.']);
        exit();
    }
}

$attendance_date = date('Y-m-d');
$status = 'Present';
$sql_insert = "INSERT INTO attendance_records (student_id, schedule_id, attendance_date, status) VALUES (?, ?, ?, ?)";
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("iiss", $student_id, $schedule_id, $attendance_date, $status);

if ($stmt_insert->execute()) {
    echo json_encode(['success' => true, 'message' => 'Presensi Anda berhasil dicatat!']);
} else {
    if ($conn->errno == 1062) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Anda sudah melakukan presensi untuk kelas ini hari ini.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal mencatat presensi: ' . $stmt_insert->error]);
    }
}

$stmt_insert->close();
$conn->close();
?>