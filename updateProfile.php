<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

// Check if token is provided
if (!isset($_POST['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$token = $_POST['token'];
$userId = getUserIdFromToken($token);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

// Validate required fields
$fullName = isset($_POST['full_name']) ? trim($_POST['full_name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($fullName) || empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Full name and email are required']);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate password length (if provided)
if (!empty($password) && strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit();
}

$con->begin_transaction();

try {
    // Check if email is already in use by another users
    $emailCheck = $con->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
    $emailCheck->bind_param("si", $email, $userId);
    $emailCheck->execute();
    $emailResult = $emailCheck->get_result();

    if ($emailResult->num_rows > 0) {
        throw new Exception('Email is already in use');
    }

    // Prepare update query
    if (!empty($password)) {
        // Hash the new password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $con->prepare("UPDATE users SET full_name = ?, email = ?, password = ? WHERE user_id = ?");
        $stmt->bind_param("sssi", $fullName, $email, $hashedPassword, $userId);
    } else {
        // Update without changing password
        $stmt = $con->prepare("UPDATE users SET full_name = ?, email = ? WHERE user_id = ?");
        $stmt->bind_param("ssi", $fullName, $email, $userId);
    }

    if (!$stmt->execute()) {
        throw new Exception('Failed to update profile');
    }

    $con->commit();
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);

} catch (Exception $e) {
    $con->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($emailCheck)) $emailCheck->close();
    if (isset($stmt)) $stmt->close();
}
?>