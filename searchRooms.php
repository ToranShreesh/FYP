<?php
// Include database connection and helper files
include './helpers/connection.php';
include './helpers/authHelper.php';

// Set response header to JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Allow CORS for React frontend

// Validate required query parameters
if (!isset($_GET['check_in']) || !isset($_GET['check_out'])) {
    echo json_encode(['success' => false, 'message' => 'Check-in and check-out dates are required']);
    exit();
}

$check_in = $_GET['check_in'];
$check_out = $_GET['check_out'];
$guests = isset($_GET['guests']) ? (int)$_GET['guests'] : 1; // Number of guests to match room_classes.no_of_guest (default to 1)
$class_name = isset($_GET['class_name']) ? $_GET['class_name'] : ''; // Optional room class name

// Validate dates
if (strtotime($check_in) >= strtotime($check_out)) {
    echo json_encode(['success' => false, 'message' => 'Check-out date must be after check-in date']);
    exit();
}

// Query to find available room classes
$query = "
    SELECT rc.*
    FROM room_classes rc
    WHERE rc.no_of_guests >= ?  -- Compare number of guests with room_classes.no_of_guest
    AND (rc.class_name = ? OR ? = '')
    AND rc.room_class_id NOT IN (
        SELECT r.room_class_id
        FROM bookings b
        JOIN booking_rooms br ON b.booking_id = br.booking_id
        JOIN rooms r ON br.room_id = r.room_id
        WHERE (b.checkin_date <= ? AND b.checkout_date >= ?)
    )
";

$stmt = $con->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Failed to prepare query']);
    exit();
}

$stmt->bind_param("issss", $guests, $class_name, $class_name, $check_out, $check_in);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to execute query']);
    $stmt->close();
    exit();
}

$result = $stmt->get_result();
$rooms = [];

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

    $rooms[] = $row;
}

$stmt->close();

// Return the response
if (empty($rooms)) {
    echo json_encode(['success' => true, 'message' => 'No rooms available for the selected criteria', 'data' => []]);
} else {
    echo json_encode(['success' => true, 'message' => 'Rooms fetched successfully', 'data' => $rooms]);
}

$con->close();
?>