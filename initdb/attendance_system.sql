-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table attendance_system.announcements: ~1 rows (approximately)
INSERT INTO `announcements` (`id`, `teacher_id`, `class_level`, `title`, `content`, `created_at`) VALUES
	(5, 57, 'X IPA 4', 'adsadsa', 'cobakkkk', '2025-07-16 13:10:50');

-- Dumping data for table attendance_system.attendance_records: ~6 rows (approximately)
INSERT INTO `attendance_records` (`id`, `schedule_id`, `student_id`, `attendance_date`, `status`, `notes`, `created_at`) VALUES
	(110, 392, 20, '2025-07-15', 'Present', NULL, '2025-07-14 17:42:51'),
	(112, 395, 19, '2025-07-16', 'Present', NULL, '2025-07-15 17:17:54'),
	(113, 397, 20, '2025-07-16', 'Present', NULL, '2025-07-16 13:06:55'),
	(114, 397, 19, '2025-07-16', 'Present', NULL, '2025-07-16 13:07:21'),
	(118, 389, 21, '2025-07-29', 'Present', NULL, '2025-07-28 18:50:43'),
	(119, 389, 19, '2025-07-29', 'Present', NULL, '2025-07-28 18:50:45'),
	(121, 397, 20, '2025-07-30', 'Present', NULL, '2025-07-30 03:04:02');

-- Dumping data for table attendance_system.attendance_sessions: ~3 rows (approximately)
INSERT INTO `attendance_sessions` (`id`, `schedule_id`, `generated_code`, `created_at`, `expires_at`, `class_type`) VALUES
	(54, 395, '616894', '2025-07-15 17:16:39', '2025-07-15 17:21:39', 'Offline'),
	(58, 389, '204743', '2025-07-28 19:03:20', '2025-07-28 19:08:20', 'Offline'),
	(60, 397, '106185', '2025-07-30 03:03:01', '2025-07-30 03:08:01', 'Offline');

-- Dumping data for table attendance_system.courses: ~12 rows (approximately)
INSERT INTO `courses` (`id`, `course_code`, `course_name`, `description`, `created_at`) VALUES
	(30, 'IDN-01', 'Bahasa Indonesia', 'Mata pelajaran Bahasa Indonesia untuk tingkat SMA.', '2025-07-05 15:47:12'),
	(31, 'SEJ-LOKAL', 'Sejarah Lokal & Budaya Pop', 'Meneliti sejarah kota atau daerah setempat.', '2025-07-05 15:47:12'),
	(32, 'PKN-DIG', 'PKn & Kewarganegaraan Digital', 'Membahas hak dan kewajiban sebagai warga negara digital.', '2025-07-05 15:47:12'),
	(33, 'MTK-WJB', 'Matematika Wajib', 'Mata pelajaran Matematika Wajib untuk kurikulum SMA.', '2025-07-05 15:47:12'),
	(34, 'BIO-01', 'Biologi', 'Mata pelajaran Biologi untuk jurusan IPA.', '2025-07-05 15:47:12'),
	(35, 'KIM-01', 'Kimia', 'Mata pelajaran Kimia untuk jurusan IPA.', '2025-07-05 15:47:12'),
	(36, 'FIS-01', 'Fisika', 'Mata pelajaran Fisika untuk jurusan IPA.', '2025-07-05 15:47:12'),
	(37, 'ENG-01', 'English', 'Mata pelajaran Bahasa Inggris untuk tingkat SMA.', '2025-07-05 15:47:12'),
	(38, 'KWU-01', 'Kewirausahaan', 'Mata pelajaran Prakarya dan Kewirausahaan (PKWU).', '2025-07-05 15:47:12'),
	(39, 'AGM-01', 'Agama', 'Mata pelajaran Pendidikan Agama.', '2025-07-05 15:47:12'),
	(40, 'SBD-01', 'Seni Budaya', 'Mata pelajaran Seni Budaya untuk tingkat SMA.', '2025-07-05 15:47:12'),
	(41, 'MTK-MIN', 'Matematika Peminatan', 'Mata pelajaran Matematika Peminatan untuk jurusan IPA.', '2025-07-05 15:47:12');

-- Dumping data for table attendance_system.materials: ~0 rows (approximately)
INSERT INTO `materials` (`id`, `course_id`, `teacher_id`, `title`, `description`, `file_path`, `link_url`, `uploaded_at`) VALUES
	(18, 39, 65, 'ascascsa', 'asacac', 'uploads/materials/687550244bb6e-1752518692.pdf', NULL, '2025-07-14 18:44:52'),
	(19, 33, 57, 'materi', 'materi', 'uploads/materials/6877a4f1635fc-1752671473.pdf', NULL, '2025-07-16 13:11:13'),
	(20, 39, 65, 'haleluyah', 'HARUS', 'uploads/materials/69879cfadf682-1770495226.pdf', NULL, '2026-02-07 20:13:46');

-- Dumping data for table attendance_system.password_resets: ~1 rows (approximately)

-- Dumping data for table attendance_system.schedules: ~96 rows (approximately)
INSERT INTO `schedules` (`id`, `course_id`, `teacher_id`, `student_class_level`, `day_of_week`, `start_time`, `end_time`, `room_number`, `created_at`) VALUES
	(341, 30, 58, 'X IPA 1', 'Senin', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(342, 33, 57, 'X IPA 1', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(343, 35, 54, 'X IPA 1', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(344, 34, 56, 'X IPA 1', 'Selasa', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(345, 40, 63, 'X IPA 1', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(346, 37, 59, 'X IPA 1', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(347, 41, 66, 'X IPA 1', 'Rabu', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(348, 32, 62, 'X IPA 1', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(349, 36, 55, 'X IPA 1', 'Rabu', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(350, 39, 65, 'X IPA 1', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(351, 31, 61, 'X IPA 1', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(352, 38, 64, 'X IPA 1', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(353, 33, 57, 'X IPA 1', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(354, 36, 55, 'X IPA 1', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(355, 35, 54, 'X IPA 1', 'Sabtu', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(356, 34, 56, 'X IPA 1', 'Sabtu', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(357, 34, 56, 'X IPA 2', 'Senin', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(358, 32, 62, 'X IPA 2', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(359, 40, 63, 'X IPA 2', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(360, 35, 54, 'X IPA 2', 'Selasa', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(361, 33, 57, 'X IPA 2', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(362, 30, 58, 'X IPA 2', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(363, 36, 55, 'X IPA 2', 'Rabu', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(364, 39, 65, 'X IPA 2', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(365, 37, 59, 'X IPA 2', 'Rabu', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(366, 41, 66, 'X IPA 2', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(367, 38, 64, 'X IPA 2', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(368, 31, 61, 'X IPA 2', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(369, 34, 56, 'X IPA 2', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(370, 33, 57, 'X IPA 2', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(371, 36, 55, 'X IPA 2', 'Sabtu', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(372, 35, 54, 'X IPA 2', 'Sabtu', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(373, 33, 57, 'X IPA 3', 'Senin', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(374, 40, 63, 'X IPA 3', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(375, 34, 56, 'X IPA 3', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(376, 36, 55, 'X IPA 3', 'Selasa', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(377, 30, 58, 'X IPA 3', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(378, 35, 54, 'X IPA 3', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(379, 38, 64, 'X IPA 3', 'Rabu', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(380, 37, 59, 'X IPA 3', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(381, 32, 62, 'X IPA 3', 'Rabu', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(382, 31, 61, 'X IPA 3', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(383, 39, 65, 'X IPA 3', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(384, 41, 66, 'X IPA 3', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(385, 35, 54, 'X IPA 3', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(386, 34, 56, 'X IPA 3', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(387, 33, 57, 'X IPA 3', 'Sabtu', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(388, 30, 58, 'X IPA 3', 'Sabtu', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(389, 41, 66, 'X IPA 4', 'Selasa', '01:00:00', '23:00:00', '', '2025-07-05 15:47:51'),
	(390, 37, 59, 'X IPA 4', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(391, 36, 55, 'X IPA 4', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(392, 39, 65, 'X IPA 4', 'Selasa', '00:00:00', '23:59:00', '', '2025-07-05 15:47:51'),
	(393, 31, 61, 'X IPA 4', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(394, 40, 63, 'X IPA 4', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(395, 34, 56, 'X IPA 4', 'Rabu', '00:00:00', '08:55:00', '', '2025-07-05 15:47:51'),
	(396, 35, 54, 'X IPA 4', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(397, 33, 57, 'X IPA 4', 'Rabu', '00:00:00', '23:00:00', '', '2025-07-05 15:47:51'),
	(398, 30, 58, 'X IPA 4', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(399, 32, 62, 'X IPA 4', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(400, 38, 64, 'X IPA 4', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(401, 31, 61, 'X IPA 4', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(402, 37, 59, 'X IPA 4', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(405, 39, 65, 'X IPA 5', 'Senin', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(406, 38, 64, 'X IPA 5', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(407, 30, 58, 'X IPA 5', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(408, 33, 57, 'X IPA 5', 'Selasa', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(409, 34, 56, 'X IPA 5', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(410, 32, 62, 'X IPA 5', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(411, 40, 63, 'X IPA 5', 'Rabu', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(412, 41, 66, 'X IPA 5', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(413, 31, 61, 'X IPA 5', 'Rabu', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(414, 36, 55, 'X IPA 5', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(415, 35, 54, 'X IPA 5', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(416, 37, 59, 'X IPA 5', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(417, 30, 58, 'X IPA 5', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(418, 32, 62, 'X IPA 5', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(419, 41, 66, 'X IPA 5', 'Sabtu', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(420, 33, 57, 'X IPA 5', 'Sabtu', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(421, 40, 63, 'X IPA 6', 'Senin', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(422, 31, 61, 'X IPA 6', 'Senin', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(423, 41, 66, 'X IPA 6', 'Senin', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(424, 32, 62, 'X IPA 6', 'Selasa', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(425, 37, 59, 'X IPA 6', 'Selasa', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(426, 36, 55, 'X IPA 6', 'Selasa', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(427, 30, 58, 'X IPA 6', 'Rabu', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(428, 33, 57, 'X IPA 6', 'Rabu', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(429, 35, 54, 'X IPA 6', 'Rabu', '10:45:00', '12:15:00', NULL, '2025-07-05 15:47:51'),
	(430, 34, 56, 'X IPA 6', 'Kamis', '06:30:00', '08:10:00', NULL, '2025-07-05 15:47:51'),
	(431, 38, 64, 'X IPA 6', 'Kamis', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(432, 39, 65, 'X IPA 6', 'Kamis', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(433, 40, 63, 'X IPA 6', 'Jumat', '07:25:00', '08:55:00', NULL, '2025-07-05 15:47:51'),
	(434, 30, 58, 'X IPA 6', 'Jumat', '08:55:00', '10:00:00', NULL, '2025-07-05 15:47:51'),
	(435, 34, 56, 'X IPA 6', 'Sabtu', '08:10:00', '09:40:00', NULL, '2025-07-05 15:47:51'),
	(436, 36, 55, 'X IPA 6', 'Sabtu', '10:00:00', '11:30:00', NULL, '2025-07-05 15:47:51'),
	(437, 33, 66, 'X IPA 1', 'Selasa', '07:15:00', '08:15:00', '', '2025-07-05 20:13:27'),
	(438, 39, 64, 'X IPA 4', 'Minggu', '22:45:00', '23:45:00', '', '2025-07-13 15:45:38');

-- Dumping data for table attendance_system.school_classes: ~12 rows (approximately)
INSERT INTO `school_classes` (`id`, `class_name`, `homeroom_teacher_id`, `created_at`, `updated_at`) VALUES
	(1, 'X IPA 1', NULL, '2025-05-30 07:04:40', '2025-07-05 15:23:44'),
	(2, 'X IPA 2', NULL, '2025-05-30 07:29:29', '2025-07-05 15:23:49'),
	(3, 'X IPS 1', NULL, '2025-05-30 07:58:59', '2025-05-30 07:58:59'),
	(4, 'X IPS 2', NULL, '2025-05-30 07:59:05', '2025-05-30 07:59:05'),
	(5, 'X IPS 3', NULL, '2025-05-30 07:59:09', '2025-05-30 07:59:09'),
	(6, 'X IPS 4', NULL, '2025-05-30 07:59:12', '2025-05-30 07:59:12'),
	(7, 'X IPS 5', NULL, '2025-05-30 07:59:16', '2025-05-30 07:59:16'),
	(8, 'X IPA 3', NULL, '2025-05-30 07:59:27', '2025-05-30 07:59:27'),
	(9, 'X IPA 4', NULL, '2025-05-30 07:59:32', '2025-05-30 07:59:32'),
	(10, 'X IPA 5', NULL, '2025-05-30 07:59:36', '2025-05-30 07:59:36'),
	(11, 'X IPA 6', NULL, '2025-05-30 07:59:39', '2025-05-30 07:59:39'),
	(12, 'X Bahasa 1', NULL, '2025-05-30 08:00:19', '2025-05-30 08:00:19');

-- Dumping data for table attendance_system.school_settings: ~3 rows (approximately)
INSERT INTO `school_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
	(1, 'school_year_start_date', '2025-02-24', '2025-07-09 12:55:57'),
	(3, 'school_year_end_date', '2025-08-22', '2025-07-09 13:05:22'),
	(6, 'school_geofence_polygon', '[[-7.281944940333073,112.8012002705873],[-7.282063374715607,112.7993731496099],[-7.284784372434381,112.79939460728203],[-7.284422990875995,112.80102539036308]]', '2025-07-30 02:39:25');

-- Dumping data for table attendance_system.users: ~55 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `student_class_level`, `teacher_main_subject`, `status`) VALUES
	(1, '', 'admin@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'admin', NULL, NULL, 'active'),
	(14, 'aaa', 'aaaa@gmail.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'admin', NULL, '', 'inactive'),
	(16, 'Abdullah Alhikam', 'abdullah.alhikam@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(17, 'Abdul Ghoffar Abdullah', 'abdul.ghoffar@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(18, 'Adila S. Gunawan', 'adila.gunawan@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(19, 'Aldyth N. R. Marthin', 'aldyth.marthin@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(20, 'Ali Akbar', 'ali.akbar@example.com', '$2y$10$hb5CWhZq29HombDKGuJk2exmodVUGKffkg7/xGCx9hHk0sn41igs6', 'student', 'X IPA 4', NULL, 'active'),
	(21, 'Alia Chairunnisa', 'alia.chairunnisa@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(22, 'Andini Esa Dewirani', 'andini.esa@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(23, 'Atiya Muznah Almahdaly', 'atiya.almahdaly@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(24, 'Auraa Malika', 'auraa.malika@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(25, 'Azzahra Maulidinna', 'azzahra.maulidinna@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(26, 'Dea Safitlah Naswar', 'dea.naswar@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(27, 'Della Safitri Muhdar', 'della.muhdar@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(28, 'Diva Salina Karunia', 'diva.karunia@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(29, 'Fadhil Amatullah Abusama', 'fadhil.abusama@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(30, 'Fajriansyah Abd. Wahab', 'fajriansyah.wahab@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(31, 'Imam Mufrihzal Pratama', 'imam.pratama@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(32, 'Kartika Nurdin', 'kartika.nurdin@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(33, 'La Ode Farhan Rezka', 'laode.rezka@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(34, 'Mayang Sari Yudha', 'mayang.yudha@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(35, 'Meutya Syaifatillah', 'meutya.syaifatillah@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(36, 'Muhammad Rizqi', 'muhammad.rizqi@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(37, 'Muthia Salsabila U.', 'muthia.salsabila@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(38, 'Natasha Salsabila', 'natasha.salsabila@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(39, 'Nazwa Fadilla Karim', 'nazwa.karim@example.com', '$2y$10$vLhgvPHhN3.zfgF62Jt6seH.rMl3yESjwD0IL3V5KM.gx9CmcT/8a', 'student', 'X IPA 4', NULL, 'inactive'),
	(40, 'Nesti Afrylia', 'nesti.afrylia@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(41, 'Nindi Safitri Haris', 'nindi.haris@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(42, 'Ninih Mutmainah', 'ninih.mutmainah@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(43, 'Novi Fitri Jayanti', 'novi.jayanti@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(44, 'Prasetyo S. A. Drakel', 'prasetyo.drakel@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(45, 'Puput Mardiana A. T.', 'puput.mardiana@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(46, 'Rahmi Nurmaharani', 'rahmi.nurmaharani@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(47, 'Raoul Rafel', 'raoul.rafel@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(48, 'Safira Diwani', 'safira.diwani@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(49, 'Ulil Abshar Luhulima', 'ulil.luhulima@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(50, 'Viladelia Buamona', 'viladelia.buamona@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(51, 'Walian Nursafa B. Soamole', 'walian.soamole@example.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 4', NULL, 'inactive'),
	(52, 'Muhammad raihan albar', 'muhammadraihanalbar@gmail.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 2', NULL, 'inactive'),
	(53, 'Ali Akbar', 'aaa@gmail.com', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'student', 'X IPA 3', NULL, 'inactive'),
	(54, 'Nursiah , S.Pd', 'nursiah.kimia@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Kimia', 'inactive'),
	(55, 'Fitriani, S.Pd', 'fitriani.fisika@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Fisika', 'inactive'),
	(56, 'FAHRIAH, S.Pd', 'fahriah.biologi@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Biologi', 'active'),
	(57, 'FATMAWATI, S.Pd', 'fatmawati.matematika@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Matematika', 'active'),
	(58, 'DRA. BEKTI NIRMALA GDP, M.Pd', 'bekti.indonesia@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Bahasa Indonesia', 'inactive'),
	(59, 'LA IYLA, S.Pd', 'la.iyla.inggris@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Bahasa Inggris', 'inactive'),
	(60, 'idhastiya, S.Pd', 'idhastiya.ekonomi@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Ekonomi', 'inactive'),
	(61, 'jasmine, S.Pd', 'jasmine.sejarah@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Sejarah', 'inactive'),
	(62, 'Gafur booy, S.Pd', 'gafur.pkn@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Pendidikan Kewarganegaraan (PKn)', 'inactive'),
	(63, 'Hindun, S.Pd', 'hindun.senibudaya@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Seni Budaya', 'inactive'),
	(64, 'Dra. MARDIA', 'mardia.kwu@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Prakarya dan Kewirausahaan (KWU)', 'inactive'),
	(65, 'DRA. GAMAR A. ALBAAR', 'gamar.agama@sekolah.id', '$2y$10$H97PvGw6we1Dxt9KjlY3muMrW5I6fBKR4POcJjCpuGNmXfsIYd.Mm', 'teacher', NULL, 'Pendidikan Agama', 'active'),
	(66, 'Abubakar, S.Pd', 'abubakar.mtkp@sekolah.id', '$2y$10$6p22bzlmtd9JBU91Lwzqku5m7n1dsHN2zvx4oOyfPKLfQgSLhBjmm', 'teacher', NULL, 'Matematika Peminatan', 'inactive'),
	(67, 'Ali Akabr Alhabsakdnaajj', 'aa8072340@gmail.com', '$2y$10$Mn2FreJ6I8BZvbvNKQsDIOzsjaY/GVSjvPVkQDYqy0y5oeKAc7EBy', 'student', 'X IPA 1', NULL, 'inactive'),
	(68, 'Ali Akbar', 'dddddddddddddddddddddd@sdf.com', '$2y$10$KElCw9WmkoyUQd5rfry8K.j6mxoLHG1QJ5WiZXBckP.wpwa/a9i9i', 'student', 'X IPA 5', NULL, 'inactive'),
	(69, 'AJUA SAYANG', 'najuajae@gmail.com', '$2y$10$x2j7VOyb1Pw8Gcdu0PKNEOaRiX5xXOdvYriOIpGjVACx3aYJ1yhoi', 'student', 'X IPA 4', NULL, 'active');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
