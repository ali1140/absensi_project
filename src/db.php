<?php
$servername = "localhost"; // Nama server (biasanya localhost di Laragon)
$username = "root";        // Default username untuk Laragon
$password = "";            // Default password untuk Laragon
$dbname = "attendance_system"; // Nama database yang sudah Anda buat

// Membuat koneksi ke database
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek apakah ada error dalam koneksi
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
