<?php
// src/mailer_config.php (BERKAS BARU)
// Konfigurasi untuk PHPMailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Memuat kelas-kelas PHPMailer
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

function send_verification_code($email, $code) {
    $mail = new PHPMailer(true);

    try {
        // Pengaturan Server
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Ganti dengan host SMTP Anda
        $mail->SMTPAuth   = true;
        $mail->Username   = 'alialhabsyi72@sma.belajar.id'; // Ganti dengan email Anda
        $mail->Password   = 'pfew xyll rndj nfpz';   // Ganti dengan App Password Gmail Anda
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        // Penerima
        $mail->setFrom('no-reply@sekolah.id', 'Sistem Presensi');
        $mail->addAddress($email);

        // Konten Email
        $mail->isHTML(true);
        $mail->Subject = 'Kode Verifikasi Reset Password Anda';
        $mail->Body    = 'Halo,<br><br>Gunakan kode berikut untuk mereset password Anda: <h2><b>' . $code . '</b></h2><br>Kode ini hanya berlaku selama 5 menit.<br><br>Jika Anda tidak meminta reset password, abaikan email ini.<br><br>Terima kasih,<br>Tim Sistem Presensi';
        $mail->AltBody = 'Kode verifikasi Anda adalah: ' . $code;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Anda bisa mencatat galat ini ke log untuk debugging
        // error_log("Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}
?>