<?php
// get_courses.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Gagal mengambil data.', 'data' => []];
$sql = "SELECT id, course_code, course_name, description FROM courses ORDER BY course_name ASC";
$stmt = $conn->prepare($sql);

if ($stmt) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Data mata pelajaran berhasil diambil.';
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