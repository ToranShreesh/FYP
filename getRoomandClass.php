<?php
include './helpers/connection.php'; // Ensure this file initializes $con as your DB connection
include './helpers/authHelper.php'; // Authentication helper



// Fetch Room Classes with Images using JOIN
$sql = "
    SELECT rc.*, GROUP_CONCAT(i.room_image_url) AS images 
    FROM room_classes rc
    LEFT JOIN images i ON rc.room_class_id = i.room_class_id
    GROUP BY rc.room_class_id
";
$result = mysqli_query($con, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to get room classes",
    ]);
    exit();
}

$roomClasses = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
    $roomClasses[] = $row;
}

// Fetch Rooms
$sqlRooms = "SELECT * FROM rooms";
$resultRooms = mysqli_query($con, $sqlRooms);

if (!$resultRooms) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to get rooms",
    ]);
    exit();
}

$rooms = mysqli_fetch_all($resultRooms, MYSQLI_ASSOC);

// Return JSON response
echo json_encode([
    'success' => true,
    'room_classes' => $roomClasses,
    'rooms' => $rooms
]);
?>
