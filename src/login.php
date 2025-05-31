<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

include('db.php'); // Menghubungkan dengan database

// Mendapatkan data JSON yang dikirim dari frontend
$data = json_decode(file_get_contents('php://input'), true);

// Memastikan data diterima
if (isset($data['email'], $data['password'])) {
    $email = $data['email'];
    $password = $data['password']; // Password yang dimasukkan oleh pengguna

    // Memeriksa apakah email terdaftar
    $query = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Memverifikasi password yang dimasukkan dengan yang ada di database
        if (password_verify($password, $user['password'])) {
            // Login berhasil, kirimkan data role
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'role' => $user['role']
            ]);
        } else {
            // Password salah
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    } else {
        // Email tidak ditemukan
        echo json_encode(['success' => false, 'message' => 'Email not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
