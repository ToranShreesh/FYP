<?php
// Include database connection and helper files
include './helpers/connection.php';
include './helpers/authHelper.php';

if (!isset($_POST['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token);

if (!$isAdmin) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

if (!isset($_POST['room_class_name'])) {
    echo json_encode(['success' => false, 'message' => 'Room class name is required']);
    exit();
}

$roomClassName = $_POST['room_class_name'];

// Fetch room class ID
$query = $con->prepare("SELECT room_class_id FROM room_classes WHERE class_name = ?");
$query->bind_param("s", $roomClassName);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Room class not found']);
    exit();
}

$row = $result->fetch_assoc();
$roomClassId = $row['room_class_id'];
$query->close();

// DELETE Room Class
if (isset($_POST['delete']) && $_POST['delete'] == "1") {
    // Delete images
    $stmt = $con->prepare("DELETE FROM images WHERE room_class_id = ?");
    $stmt->bind_param("i", $roomClassId);
    $stmt->execute();
    $stmt->close();

    // Delete room class
    $stmt = $con->prepare("DELETE FROM room_classes WHERE room_class_id = ?");
    $stmt->bind_param("i", $roomClassId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room class deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete room class']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Delete parameter not set']);
}
?>