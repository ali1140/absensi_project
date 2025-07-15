<?php
// src/get_todays_classes_status.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');
date_default_timezone_set('Asia/Jakarta');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$student_id = isset($_GET['student_id']) ? filter_var($_GET['student_id'], FILTER_VALIDATE_INT) : null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID Siswa diperlukan.']);
    exit();
}

$stmt_class = $conn->prepare("SELECT student_class_level FROM users WHERE id = ?");
$stmt_class->bind_param("i", $student_id);
$stmt_class->execute();
$result_class = $stmt_class->get_result();
$user_data = $result_class->fetch_assoc();
$stmt_class->close();

if (!$user_data || empty($user_data['student_class_level'])) {
    echo json_encode(['success' => true, 'data' => [], 'message' => 'Siswa tidak terdaftar di kelas manapun.']);
    exit();
}

$student_class_level = $user_data['student_class_level'];
$dayMapping = ['Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'];
$today_day_name = strtolower($dayMapping[date('l')]);
$today_date = date('Y-m-d');

// PERBAIKAN: Memperbaiki subquery dan cara JOIN untuk ringkasan kehadiran
$sql = "
    SELECT 
        s.id as schedule_id, 
        s.start_time,
        s.end_time,
        c.id as course_id,
        c.course_name, 
        u.name as teacher_name,
        sess.class_type,
        (sess.id IS NOT NULL) as is_active,
        (SELECT COUNT(*) FROM attendance_records WHERE schedule_id = s.id AND student_id = ? AND attendance_date = ?) > 0 as has_attended,
        COALESCE(att_summary.present_count, 0) as present_count,
        COALESCE(att_summary.absent_count, 0) as absent_count,
        COALESCE(att_summary.excused_count, 0) as excused_count
    FROM schedules s
    JOIN courses c ON s.course_id = c.id
    JOIN users u ON s.teacher_id = u.id
    LEFT JOIN attendance_sessions sess ON s.id = sess.schedule_id AND sess.expires_at > NOW()
    LEFT JOIN (
        SELECT 
            s_inner.course_id,
            SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present_count,
            SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
            SUM(CASE WHEN ar.status = 'Excused' THEN 1 ELSE 0 END) as excused_count
        FROM attendance_records ar
        JOIN schedules s_inner ON ar.schedule_id = s_inner.id
        WHERE ar.student_id = ?
        GROUP BY s_inner.course_id
    ) as att_summary ON s.course_id = att_summary.course_id
    WHERE s.student_class_level = ? AND LOWER(s.day_of_week) = ?
    GROUP BY s.id
    ORDER BY s.start_time ASC
";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    exit();
}

// Parameter untuk query utama dan subquery
$stmt->bind_param("isiss", $student_id, $today_date, $student_id, $student_class_level, $today_day_name);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $row['start_time_formatted'] = date("H:i", strtotime($row['start_time']));
    $row['end_time_formatted'] = date("H:i", strtotime($row['end_time']));
    $data[] = $row;
}
$stmt->close();

echo json_encode(['success' => true, 'data' => $data]);
$conn->close();
?>
