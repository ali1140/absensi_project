<?php
$servername = getenv('DB_HOST') ?: "localhost"; 
$username = getenv('DB_USER') ?: "root";        
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : "";            
$dbname = getenv('DB_NAME') ?: "attendance_system"; 

// Disable default PHP error reporting for mysqli to prevent HTML warnings from breaking JSON
mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $conn->connect_error,
        'data' => []
    ]);
    exit();
}
?>
