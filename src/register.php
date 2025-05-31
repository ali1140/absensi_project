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
    $password = password_hash($data['password'], PASSWORD_DEFAULT); // Enkripsi password

    // Memeriksa apakah email sudah terdaftar
    $checkQuery = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($checkQuery);

    if ($result->num_rows > 0) {
        // Jika email sudah ada, kirimkan respons error
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
    } else {
        // Jika email belum terdaftar, simpan data pengguna ke dalam database
        $insertQuery = "INSERT INTO users (email, password, role) VALUES ('$email', '$password', 'student')";

        if ($conn->query($insertQuery) === TRUE) {
            echo json_encode(['success' => true, 'message' => 'Registration successful']);
        } else {
            echo json_encode(['success' => false, 'message' => $conn->error]);
        }
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing data']);
}
?>
