<?php
// File: COBAK_REACT/SRC/get_users.php
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
$classLevelFilter = isset($_GET['class_level']) ? trim($_GET['class_level']) : null; // ADD THIS LINE

$response = ['success' => false, 'message' => 'Tipe atau filter pengguna tidak valid.', 'data' => []];

$roleInDb = null;
if ($requestedType === 'teachers') {
    $roleInDb = 'teacher';
} elseif ($requestedType === 'students') {
    $roleInDb = 'student';
} elseif ($roleFilter && in_array($roleFilter, ['student', 'teacher', 'admin'])) {
    $roleInDb = $roleFilter;
}

if ($roleInDb) {
    // --- MODIFICATION START ---
    $sql = "SELECT id, name, email, role, student_class_level, teacher_main_subject FROM users WHERE role = ?";
    $params = [$roleInDb];
    $types = "s";

    // Add class level filter if provided for students
    if ($roleInDb === 'student' && !empty($classLevelFilter)) {
        $sql .= " AND student_class_level = ?";
        $params[] = $classLevelFilter;
        $types .= "s";
    }

    $sql .= " ORDER BY name ASC";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        // Use dynamic binding if params exist
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
    // --- MODIFICATION END ---

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $data = [];
            while($row = $result->fetch_assoc()) {
                $row['status'] = 'Active'; // Asumsi status default
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
} elseif ($requestedType === null && $roleFilter === null) { 
    $response['message'] = 'Harap tentukan parameter "type" (teachers/students) atau "role_filter" (teacher/student/admin).';
    http_response_code(400);
}

echo json_encode($response);
$conn->close();
?>