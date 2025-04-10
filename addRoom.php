<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Check if token is provided
if (!isset($_POST['token'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Token is required',
    ]);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token); // Check if the user is an admin

if (!$isAdmin) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access',
    ]);
    exit();
}

// Validate required fields
if (isset($_POST['class_name'], $_POST['floor_number'], $_POST['room_number'])) {
    // Retrieve and sanitize inputs
    $className = mysqli_real_escape_string($con, $_POST['class_name']);
    $floorNumber = mysqli_real_escape_string($con, $_POST['floor_number']);
    $roomNumber = mysqli_real_escape_string($con, $_POST['room_number']);

    // Get the room_class_id based on the class_name
    $getClassSql = "SELECT room_class_id FROM room_classes WHERE class_name = '$className'";
    $classResult = mysqli_query($con, $getClassSql);

    if (mysqli_num_rows($classResult) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid class_name. No such room class exists.',
        ]);
        exit();
    }

    $classRow = mysqli_fetch_assoc($classResult);
    $roomClassId = $classRow['room_class_id'];

    // Insert into the rooms table
    $sql = "INSERT INTO rooms (room_class_id, floor_number, room_number)
            VALUES ('$roomClassId', '$floorNumber', '$roomNumber')";

    $result = mysqli_query($con, $sql);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Room added successfully',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add room',
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'All fields (class_name, floor_number, room_number) are required',
    ]);
}
?>
