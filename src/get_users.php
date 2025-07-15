<?php
// src/get_users.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('db.php');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requestedType = isset($_GET['type']) ? $_GET['type'] : null;
$roleFilter = isset($_GET['role_filter']) ? $_GET['role_filter'] : null;
$classLevelFilter = isset($_GET['class_level']) ? trim($_GET['class_level']) : null;
// PERBAIKAN: Menambahkan filter berdasarkan ID pengguna
$userIdFilter = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

$response = ['success' => false, 'message' => 'Tipe atau filter pengguna tidak valid.', 'data' => []];

$sql = "SELECT id, name, email, role, student_class_level, teacher_main_subject, status FROM users";
$conditions = [];
$params = [];
$types = "";

if ($userIdFilter) {
    $conditions[] = "id = ?";
    $params[] = $userIdFilter;
    $types .= "i";
} else {
    $roleInDb = null;
    if ($requestedType === 'teachers') {
        $roleInDb = 'teacher';
    } elseif ($requestedType === 'students') {
        $roleInDb = 'student';
    } elseif ($roleFilter && in_array($roleFilter, ['student', 'teacher', 'admin'])) {
        $roleInDb = $roleFilter;
    }

    if ($roleInDb) {
        $conditions[] = "role = ?";
        $params[] = $roleInDb;
        $types .= "s";
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Filter peran tidak valid atau tidak disediakan.']);
        exit();
    }

    if ($roleInDb === 'student' && !empty($classLevelFilter)) {
        $conditions[] = "student_class_level = ?";
        $params[] = $classLevelFilter;
        $types .= "s";
    }
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " ORDER BY name ASC";
$stmt = $conn->prepare($sql);

if ($stmt) {
    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $response['success'] = true;
        $response['message'] = 'Data pengguna berhasil diambil.';
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
