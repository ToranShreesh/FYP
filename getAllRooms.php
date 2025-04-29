<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Set JSON content type
header('Content-Type: application/json');

try {     
    // Fetch all rooms with their associated room class details, including remarks
    $sql = "SELECT r.room_id, r.room_class_id, rc.class_name, r.floor_number, r.room_number, r.is_enabled, r.remarks 
            FROM rooms r
            JOIN room_classes rc ON r.room_class_id = rc.room_class_id";
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare statement');
    }
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $rooms = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $rooms[] = [
            'room_id' => (int)$row['room_id'],
            'room_class_id' => (int)$row['room_class_id'],
            'class_name' => $row['class_name'],
            'floor_number' => (int)$row['floor_number'],
            'room_number' => $row['room_number'],
            'is_enabled' => (int)$row['is_enabled'], // Cast to integer
            'remarks' => $row['remarks'] // Include remarks
        ];
    }

    echo json_encode([
        'success' => true,
        'rooms' => $rooms,
    ]);

    mysqli_stmt_close($stmt);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching rooms: ' . $e->getMessage(),
    ]);
}

mysqli_close($con);
?>