<?php
// src/upload_material.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Menangani permintaan pre-flight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include('db.php');

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $teacher_id = $_POST['teacher_id'] ?? null;
    $course_id = $_POST['course_id'] ?? null;
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? '';

    if (!$teacher_id || !$course_id || !$title || !isset($_FILES['material_file'])) {
        $response['message'] = 'Data tidak lengkap.';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $target_dir = "uploads/materials/";
    if (!is_dir($target_dir)) {
        if (!mkdir($target_dir, 0777, true)) {
            $response['message'] = 'Gagal membuat direktori unggahan.';
            http_response_code(500);
            echo json_encode($response);
            exit();
        }
    }

    $file_name = basename($_FILES["material_file"]["name"]);
    $file_tmp = $_FILES["material_file"]["tmp_name"];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $unique_name = uniqid() . '-' . time() . '.' . $file_ext;
    $target_file = $target_dir . $unique_name;

    $allowed_ext = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "jpg", "png", "zip", "rar"];
    if (!in_array($file_ext, $allowed_ext)) {
        $response['message'] = 'Format berkas tidak diizinkan.';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    if (move_uploaded_file($file_tmp, $target_file)) {
        $sql = "INSERT INTO materials (course_id, teacher_id, title, description, file_path) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iisss", $course_id, $teacher_id, $title, $description, $target_file);

        if ($stmt->execute()) {
            $response = ['success' => true, 'message' => 'Materi berhasil diunggah.'];
        } else {
            $response['message'] = 'Gagal menyimpan data ke database.';
            http_response_code(500);
            unlink($target_file); // Hapus berkas jika gagal simpan DB
        }
        $stmt->close();
    } else {
        $response['message'] = 'Gagal mengunggah berkas. Periksa izin folder.';
        http_response_code(500);
    }
}

echo json_encode($response);
$conn->close();
?>
