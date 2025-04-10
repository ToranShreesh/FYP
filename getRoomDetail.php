<?php
include './helpers/connection.php'; // Ensure this file initializes $con as your DB connection

// Get room_class_id from URL
$room_class_id = $_GET['room_class_id'] ?? null;

if (!$room_class_id) {
    echo json_encode([
        'success' => false,
        'message' => "No room_class_id provided"
    ]);
    exit();
}

// Fetch Room Class Details with Images
$sql = "
    SELECT rc.*, GROUP_CONCAT(i.room_image_url) AS images 
    FROM room_classes rc
    LEFT JOIN images i ON rc.room_class_id = i.room_class_id
    WHERE rc.room_class_id = ?
    GROUP BY rc.room_class_id
";
$stmt = $con->prepare($sql);
$stmt->bind_param("i", $room_class_id);
$stmt->execute();
$result = $stmt->get_result();
$roomClass = $result->fetch_assoc();

if (!$roomClass) {
    echo json_encode([
        'success' => false,
        'message' => "Room not found"
    ]);
    exit();
}

// Convert images string to an array
$roomClass['images'] = $roomClass['images'] ? explode(',', $roomClass['images']) : [];

// Fetch Rooms (if needed)
$sqlRooms = "SELECT * FROM rooms WHERE room_class_id = ?";
$stmtRooms = $con->prepare($sqlRooms);
$stmtRooms->bind_param("i", $room_class_id);
$stmtRooms->execute();
$resultRooms = $stmtRooms->get_result();
$rooms = mysqli_fetch_all($resultRooms, MYSQLI_ASSOC);

// Return JSON response
echo json_encode([
    'success' => true,
    'room_class' => $roomClass,
    'rooms' => $rooms
]);
?>
