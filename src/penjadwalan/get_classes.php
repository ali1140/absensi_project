<?php
// File: COBAK_REACT/SRC/penjadwalan/get_classes.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Sesuaikan path ke file koneksi database Anda

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Gagal mengambil data kelas.', 'data' => []];

// Query untuk mengambil data kelas, nama wali kelas, dan jumlah siswa
$sql = "SELECT 
            sc.id, 
            sc.class_name, 
            sc.homeroom_teacher_id,
            u.name as homeroom_teacher_name,
            (SELECT COUNT(usr.id) FROM users usr WHERE usr.role = 'student' AND usr.student_class_level = sc.class_name) as student_count
        FROM school_classes sc
        LEFT JOIN users u ON sc.homeroom_teacher_id = u.id AND u.role = 'teacher'
        ORDER BY sc.class_name ASC";

$stmt = $conn->prepare($sql);

if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            // Pastikan student_count adalah integer
            $row['student_count'] = (int)$row['student_count'];
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Data kelas berhasil diambil.';
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