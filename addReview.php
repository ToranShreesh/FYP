<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

// Check for token
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

// Validate room_class_id
if (!isset($_POST['room_class_id'])) {
    echo json_encode(['success' => false, 'message' => 'room_class_id is required']);
    exit();
}

$room_class_id = (int)$_POST['room_class_id'];
if ($room_class_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid room_class_id']);
    exit();
}

// Check if this is an eligibility check
if (isset($_POST['checkEligibility']) && $_POST['checkEligibility'] === 'true') {
    // Verify user has a completed booking for this room class with check-out date passed
    $stmt = mysqli_prepare($con, "
        SELECT b.booking_id 
        FROM bookings b
        JOIN booking_rooms br ON b.booking_id = br.booking_id
        JOIN rooms r ON br.room_id = r.room_id
        WHERE b.user_id = ? 
        AND r.room_class_id = ? 
        AND b.booking_status = 'Completed' 
        AND b.checkout_date < CURDATE()
    ");
    mysqli_stmt_bind_param($stmt, 'ii', $userId, $room_class_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => true, 'canReview' => true]);
    } else {
        echo json_encode([
            'success' => true,
            'canReview' => false,
            'message' => 'You must have completed a stay in this room class to leave a review'
        ]);
    }
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    exit();
}

// Validate required fields for review submission
if (!isset($_POST['ratings'], $_POST['description'])) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields (ratings, description) are required',
    ]);
    exit();
}

// Retrieve and validate inputs
$ratings = (float)$_POST['ratings'];
$description = trim($_POST['description']);

// Validate input
if (!is_numeric($ratings) || $ratings < 1 || $ratings > 5) {
    echo json_encode([
        'success' => false,
        'message' => 'Rating must be a number between 1 and 5',
    ]);
    exit();
}
if (empty($description) || strlen($description) > 1000) {
    echo json_encode([
        'success' => false,
        'message' => 'Description is required and must be less than 1000 characters',
    ]);
    exit();
}

// Verify room_class_id exists
$stmt = mysqli_prepare($con, "SELECT room_class_id, class_name FROM room_classes WHERE room_class_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $room_class_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid room_class_id. No such room class exists',
    ]);
    mysqli_stmt_close($stmt);
    exit();
}

// Fetch class_name for response
$room_class = mysqli_fetch_assoc($result);
$class_name = $room_class['class_name'];
mysqli_stmt_close($stmt);

// Verify user has a completed booking for this room class with check-out date passed
$stmt = mysqli_prepare($con, "
    SELECT b.booking_id 
    FROM bookings b
    JOIN booking_rooms br ON b.booking_id = br.booking_id
    JOIN rooms r ON br.room_id = r.room_id
    WHERE b.user_id = ? 
    AND r.room_class_id = ? 
    AND b.booking_status = 'Completed' 
    AND b.checkout_date < CURDATE()
");
mysqli_stmt_bind_param($stmt, 'ii', $userId, $room_class_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'You can only review rooms you have booked and completed a stay in',
    ]);
    mysqli_stmt_close($stmt);
    exit();
}
mysqli_stmt_close($stmt);

// Fetch reviewer_name (full_name) from users table
$stmt = mysqli_prepare($con, "SELECT full_name FROM users WHERE user_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($result && mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    $reviewer_name = $user['full_name'];
} else {
    $reviewer_name = 'Anonymous'; // Fallback if user not found
}
mysqli_stmt_close($stmt);

// Insert into reviews table using prepared statement
$stmt = mysqli_prepare($con, "INSERT INTO reviews (user_id, room_class_id, ratings, description, review_date) VALUES (?, ?, ?, ?, NOW())");
mysqli_stmt_bind_param($stmt, 'iids', $userId, $room_class_id, $ratings, $description);

if (mysqli_stmt_execute($stmt)) {
    $review_id = mysqli_insert_id($con); // Get the ID of the inserted review
    mysqli_stmt_close($stmt);

    // Return the newly created review
    echo json_encode([
        'success' => true,
        'message' => 'Review added successfully',
        'review' => [
            'review_id' => $review_id,
            'user_id' => $userId,
            'room_class_id' => $room_class_id,
            'rating' => $ratings, // Match getReviews.php alias
            'description' => $description,
            'review_date' => date('Y-m-d H:i:s'), // Approximate, as NOW() was used
            'reviewer_name' => $reviewer_name,
            'class_name' => $class_name,
        ],
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add review: ' . mysqli_error($con),
    ]);
    mysqli_stmt_close($stmt);
}

mysqli_close($con);
?>