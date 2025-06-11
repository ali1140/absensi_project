<?php
// File: COBAK_REACT/SRC/penjadwalan/delete_class.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Atau DELETE
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

include('../db.php'); // Sesuaikan path ke file koneksi database Anda

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => 'Permintaan tidak valid.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') { // Menggunakan POST untuk delete agar konsisten
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, TRUE);

    if (isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);

        if ($id) {
            // Dapatkan nama kelas sebelum menghapus untuk digunakan dalam query pengecekan
            $getClassNameSql = "SELECT class_name FROM school_classes WHERE id = ?";
            $stmtGetClass = $conn->prepare($getClassNameSql);
            $stmtGetClass->bind_param("i", $id);
            $stmtGetClass->execute();
            $classResult = $stmtGetClass->get_result();
            
            if ($classRow = $classResult->fetch_assoc()) {
                $classNameToDelete = $classRow['class_name'];
                $stmtGetClass->close();

                // Cek apakah ada siswa di kelas ini
                $checkStudentsSql = "SELECT COUNT(id) as student_count FROM users WHERE student_class_level = ?";
                $stmtCheckStudents = $conn->prepare($checkStudentsSql);
                $stmtCheckStudents->bind_param("s", $classNameToDelete);
                $stmtCheckStudents->execute();
                $studentData = $stmtCheckStudents->get_result()->fetch_assoc();
                $stmtCheckStudents->close();

                if ($studentData && $studentData['student_count'] > 0) {
                    $response['message'] = 'Gagal menghapus: Masih ada ' . $studentData['student_count'] . ' siswa di kelas "' . htmlspecialchars($classNameToDelete) . '". Pindahkan atau hapus siswa terlebih dahulu.';
                    http_response_code(409); // Conflict
                    echo json_encode($response);
                    exit();
                }
                
                // Cek apakah ada jadwal untuk kelas ini
                $checkSchedulesSql = "SELECT COUNT(id) as schedule_count FROM schedules WHERE student_class_level = ?";
                $stmtCheckSchedules = $conn->prepare($checkSchedulesSql);
                $stmtCheckSchedules->bind_param("s", $classNameToDelete);
                $stmtCheckSchedules->execute();
                $scheduleData = $stmtCheckSchedules->get_result()->fetch_assoc();
                $stmtCheckSchedules->close();

                if ($scheduleData && $scheduleData['schedule_count'] > 0) {
                    $response['message'] = 'Gagal menghapus: Masih ada jadwal yang terkait dengan kelas "' . htmlspecialchars($classNameToDelete) . '". Hapus jadwal terkait terlebih dahulu.';
                    http_response_code(409); // Conflict
                    echo json_encode($response);
                    exit();
                }

                // Jika tidak ada siswa dan jadwal, lanjutkan penghapusan
                $sql = "DELETE FROM school_classes WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $id);

                if ($stmt->execute()) {
                    if ($stmt->affected_rows > 0) {
                        $response['success'] = true;
                        $response['message'] = 'Kelas "' . htmlspecialchars($classNameToDelete) . '" berhasil dihapus.';
                        http_response_code(200);
                    } else {
                        // Ini bisa terjadi jika kelas sudah dihapus oleh request lain
                        $response['message'] = 'Kelas tidak ditemukan atau sudah dihapus.';
                        http_response_code(404);
                    }
                } else {
                    $response['message'] = "Gagal menghapus kelas: " . $stmt->error;
                    http_response_code(500);
                }
                $stmt->close();

            } else {
                $stmtGetClass->close();
                $response['message'] = 'Kelas dengan ID yang diberikan tidak ditemukan.';
                http_response_code(404);
            }
        } else {
            $response['message'] = 'ID kelas tidak valid.';
            http_response_code(400);
        }
    } else {
        $response['message'] = 'ID kelas diperlukan.';
        http_response_code(400);
    }
}

echo json_encode($response);
$conn->close();
?>