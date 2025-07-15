<?php
// src/get_settings.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'data' => []];

$sql = "SELECT setting_key, setting_value FROM school_settings";
$result = $conn->query($sql);

if ($result) {
    $settings = [];
    while($row = $result->fetch_assoc()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    $response['success'] = true;
    $response['data'] = $settings;
    http_response_code(200);
} else {
    $response['message'] = "Gagal mengambil pengaturan: " . $conn->error;
    http_response_code(500);
}

echo json_encode($response);
$conn->close();
?>