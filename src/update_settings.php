<?php
// src/update_settings.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include('db.php');

$input = json_decode(file_get_contents('php://input'), TRUE);
$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // PERBAIKAN: Pemeriksaan untuk memastikan input JSON valid
    if (!is_array($input)) {
        $response['message'] = 'Input JSON tidak valid atau kosong.';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $conn->begin_transaction();
    $all_success = true;

    $allowed_settings = [
        'school_year_start_date',
        'school_year_end_date',
        'school_geofence_polygon'
    ];

    // PERBAIKAN: Menggunakan catch (Throwable $t) untuk menangkap semua jenis galat
    try {
        foreach ($allowed_settings as $key) {
            if (array_key_exists($key, $input)) {
                $value = $input[$key];

                $sql = "INSERT INTO school_settings (setting_key, setting_value) VALUES (?, ?) 
                        ON DUPLICATE KEY UPDATE setting_value = ?";
                
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    throw new Exception("Gagal mempersiapkan statement: " . $conn->error);
                }

                $stmt->bind_param("sss", $key, $value, $value);
                
                if (!$stmt->execute()) {
                    $all_success = false;
                    // Menambahkan detail galat dari database
                    $response['message'] = 'Gagal memperbarui pengaturan: ' . $key . ' - ' . $stmt->error;
                    break; 
                }
                $stmt->close();
            }
        }

        if ($all_success) {
            $conn->commit();
            $response['success'] = true;
            $response['message'] = 'Pengaturan berhasil diperbarui.';
            http_response_code(200);
        } else {
            $conn->rollback();
            http_response_code(500);
        }

    } catch (Throwable $t) { // Menangkap semua jenis galat (Error dan Exception)
        $conn->rollback();
        $response['message'] = 'Terjadi kesalahan server: ' . $t->getMessage();
        http_response_code(500);
    }

} else {
    $response['message'] = 'Metode tidak didukung.';
    http_response_code(405);
}

echo json_encode($response);
$conn->close();
?>
