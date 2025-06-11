<?php
// COBAK_REACT/SRC/penjadwalan/create_schedule.php
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

    if (isset($input['course_id'], $input['teacher_id'], $input['student_class_level'], $input['day_of_week'], $input['start_time'], $input['end_time'])) {
        $course_id = filter_var($input['course_id'], FILTER_VALIDATE_INT);
        $teacher_id = filter_var($input['teacher_id'], FILTER_VALIDATE_INT);
        $student_class_level = trim($input['student_class_level']);
        $day_of_week = trim($input['day_of_week']);
        $start_time = trim($input['start_time']); 
        $end_time = trim($input['end_time']);   
        $room_number = isset($input['room_number']) ? trim($input['room_number']) : null;

        if ($course_id && $teacher_id && !empty($student_class_level) && !empty($day_of_week) && !empty($start_time) && !empty($end_time)) {
            // Validasi lebih lanjut (opsional): cek bentrok jadwal untuk guru/kelas/ruangan
            // ...

            $sql = "INSERT INTO schedules (course_id, teacher_id, student_class_level, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            // iisssss - 2 int, 5 string
            $stmt->bind_param("iisssss", $course_id, $teacher_id, $student_class_level, $day_of_week, $start_time, $end_time, $room_number);

            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Jadwal berhasil ditambahkan.';
                $response['id'] = $conn->insert_id;
                http_response_code(201);
            } else {
                $response['message'] = "Gagal menambahkan jadwal: " . $stmt->error;
                if ($conn->errno == 1452) { 
                    $response['message'] = "Gagal: ID Mata Pelajaran atau ID Guru tidak valid.";
                }
                http_response_code(500);
            }
            $stmt->close();
        } else {
            $response['message'] = 'Data input tidak valid atau tidak lengkap (termasuk student_class_level).';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'Data input tidak lengkap (course_id, teacher_id, student_class_level, day_of_week, start_time, end_time diperlukan).';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>