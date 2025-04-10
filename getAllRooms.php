<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper


// Fetch all rooms with their associated room class details
$sql = "SELECT r.room_id, r.room_class_id, rc.class_name, r.floor_number, r.room_number, r.is_enabled 
        FROM rooms r
        JOIN room_classes rc ON r.room_class_id = rc.room_class_id";


$result = mysqli_query($con, $sql);

if ($result) {
    $rooms = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rooms[] = [
            'room_id' => $row['room_id'],
            'room_class_id' => $row['room_class_id'],
            'class_name' => $row['class_name'],
            'floor_number' => $row['floor_number'],
            'room_number' => $row['room_number'],
            'is_enabled' => $row['is_enabled'] 
        ];
    }

    echo json_encode([
        'success' => true,
        'rooms' => $rooms,
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch rooms',
    ]);
}
?>
