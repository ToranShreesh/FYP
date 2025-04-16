<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

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
if (isset($_POST['room_class_id'], $_POST['ratings'], $_POST['description'])) {
    // Retrieve and sanitize inputs
    $room_class_id = mysqli_real_escape_string($con, $_POST['room_class_id']);
    $ratings = mysqli_real_escape_string($con, $_POST['ratings']);
    $description = mysqli_real_escape_string($con, $_POST['description']);

    // Validate input
    if (!is_numeric($ratings) || $ratings < 1 || $ratings > 5 || empty($description)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid input. Rating must be between 1 and 5, and review text is required.',
        ]);
        exit();
    }

    // Verify room_class_id exists
    $getClassSql = "SELECT room_class_id FROM room_classes WHERE room_class_id = '$room_class_id'";
    $classResult = mysqli_query($con, $getClassSql);

    if (mysqli_num_rows($classResult) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid room_class_id. No such room class exists.',
        ]);
        exit();
    }

    // Insert into the reviews table
    $sql = "INSERT INTO reviews (room_class_id, ratings, description )
            VALUES ('$room_class_id', '$ratings', '$description')";

    $result = mysqli_query($con, $sql);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Review added successfully',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add review',
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'All fields (room_class_id, ratings, description) are required',
    ]);
}
?>