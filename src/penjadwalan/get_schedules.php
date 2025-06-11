<?php
// COBAK_REACT/SRC/penjadwalan/get_schedules.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Path diubah

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Gagal mengambil data.', 'data' => []];

$teacher_id = isset($_GET['teacher_id']) ? filter_var($_GET['teacher_id'], FILTER_VALIDATE_INT) : null;
$student_id = isset($_GET['student_id']) ? filter_var($_GET['student_id'], FILTER_VALIDATE_INT) : null;
$class_level_filter = isset($_GET['class_level']) ? trim($_GET['class_level']) : null;


$sql = "SELECT s.id, s.day_of_week, s.start_time, s.end_time, s.room_number, 
               s.student_class_level, 
               c.id as course_id, c.course_code, c.course_name, 
               u.id as teacher_id, u.name as teacher_name 
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN users u ON s.teacher_id = u.id AND u.role = 'teacher'";

$params = [];
$types = "";
$conditions = [];

if ($teacher_id) {
    $conditions[] = "s.teacher_id = ?";
    $params[] = $teacher_id;
    $types .= "i";
}

if ($student_id) {
    // Ambil dulu student_class_level dari student_id
    $stmtStudentClass = $conn->prepare("SELECT student_class_level FROM users WHERE id = ? AND role = 'student'");
    if ($stmtStudentClass) {
        $stmtStudentClass->bind_param("i", $student_id);
        $stmtStudentClass->execute();
        $resultStudentClass = $stmtStudentClass->get_result();
        if ($rowStudentClass = $resultStudentClass->fetch_assoc()) {
            if (!empty($rowStudentClass['student_class_level'])) {
                $conditions[] = "s.student_class_level = ?";
                $params[] = $rowStudentClass['student_class_level'];
                $types .= "s";
            } else {
                // Siswa tidak punya kelas, tidak akan ada jadwal untuknya dengan logika ini
                 $response = ['success' => true, 'message' => 'Siswa tidak memiliki data kelas.', 'data' => []];
                 echo json_encode($response);
                 $conn->close();
                 exit();
            }
        } else {
            // Siswa tidak ditemukan
            $response = ['success' => false, 'message' => 'Siswa tidak ditemukan.', 'data' => []];
            echo json_encode($response);
            $conn->close();
            exit();
        }
        $stmtStudentClass->close();
    }
} elseif ($class_level_filter) { // Filter langsung berdasarkan class_level jika diberikan
    $conditions[] = "s.student_class_level = ?";
    $params[] = $class_level_filter;
    $types .= "s";
}


if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " ORDER BY FIELD(s.day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'), s.start_time ASC";

$stmt = $conn->prepare($sql);

if ($stmt) {
    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            $row['start_time_formatted'] = date("H:i", strtotime($row['start_time']));
            $row['end_time_formatted'] = date("H:i", strtotime($row['end_time']));
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Data jadwal berhasil diambil.';
        $response['data'] = $data;
        http_response_code(200);
    } else {
        $response['message'] = "Gagal mengeksekusi query: " . $stmt->error;
        http_response_code(500);
    }
    $stmt->close();
} else {
    $response['message'] = "Gagal mempersiapkan statement: " . $conn->error;
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>