<?php
$servername = getenv('DB_HOST') ?: "localhost"; 
$username = getenv('DB_USER') ?: "root";        
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : "";            
$dbname = getenv('DB_NAME') ?: "attendance_system"; 


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
