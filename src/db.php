<?php
$servername = "localhost"; 
$username = "root";        
$password = "";            
$dbname = "attendance_system"; 


$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
