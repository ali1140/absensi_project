<?php
// src/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

include('db.php'); // Menghubungkan dengan database

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mendapatkan data JSON yang dikirim dari frontend
$data = json_decode(file_get_contents('php://input'), true);

// Memastikan data diterima
if (isset($data['email'], $data['password'])) {
    $email = $data['email'];
    $password = $data['password']; // Password yang dimasukkan oleh pengguna

    // Memeriksa apakah email terdaftar
    $query = "SELECT id, name, email, password, role, status FROM users WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Memverifikasi password yang dimasukkan dengan yang ada di database
        if (password_verify($password, $user['password'])) {
            // Login berhasil
            // Update status pengguna menjadi 'active' di database
            $updateStatusQuery = "UPDATE users SET status = 'active' WHERE id = ?";
            $stmtUpdate = $conn->prepare($updateStatusQuery);
            $stmtUpdate->bind_param("i", $user['id']);
            $stmtUpdate->execute();
            $stmtUpdate->close();

            // Set cookie untuk role (contoh, berlaku 1 jam)
            setcookie('user_role', $user['role'], [
                'expires' => time() + 3600, // 1 jam
                'path' => '/',
                'httponly' => true, // Melindungi dari serangan XSS
                'samesite' => 'Lax' // Atau 'Strict', tergantung kebutuhan
            ]);
            // Set cookie untuk user_id
            setcookie('user_id', $user['id'], [
                'expires' => time() + 3600,
                'path' => '/',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
             // Set cookie untuk user_name (tidak httponly karena mungkin dibutuhkan frontend)
            setcookie('user_name', urlencode($user['name']), [ // urlencode untuk nama dengan spasi/karakter khusus
                'expires' => time() + 3600,
                'path' => '/',
                'httponly' => false, // Dapat diakses oleh JavaScript
                'samesite' => 'Lax'
            ]);


            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'role' => $user['role'],
                'user_id' => $user['id'],
                'user_name' => $user['name']
            ]);
        } else {
            // Password salah
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    } else {
        // Email tidak ditemukan
        echo json_encode(['success' => false, 'message' => 'Email not found']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
$conn->close();
?>
