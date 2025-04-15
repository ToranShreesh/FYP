<?php
// Include database connection
include './helpers/connection.php';

// Set response header to JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Allow CORS for React frontend

// Query to fetch all room classes
$query = "SELECT * FROM room_classes";
$result = $con->query($query);

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Failed to fetch room classes', 'room_classes' => []]);
    exit();
}

$room_classes = [];
while ($row = $result->fetch_assoc()) {
    // Fetch images for this room class
    $imageStmt = $con->prepare("SELECT room_image_url FROM images WHERE room_class_id = ?");
    $imageStmt->bind_param("i", $row['room_class_id']);
    $imageStmt->execute();
    $imageResult = $imageStmt->get_result();

    $images = [];
    while ($imgRow = $imageResult->fetch_assoc()) {
        $images[] = $imgRow['room_image_url'];
    }
    $imageStmt->close();

    // Add images to the room data
    $row['images'] = $images;

    // Ensure amenities is a string (RoomCard will parse it)
    $row['amenities'] = $row['amenities'] ?? '';

    // Rename base_price to basePrice to match RoomCard prop
    $row['basePrice'] = $row['base_price'];
    unset($row['base_price']);

    $room_classes[] = $row;
}

// Return the response
echo json_encode([
    'success' => true,
    'message' => empty($room_classes) ? 'No room classes found' : 'Room classes fetched successfully',
    'room_classes' => $room_classes // Always return an array
]);

$con->close();
?>