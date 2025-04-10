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
$userId = getUserIdFromToken($token); // Get user ID from token

if (!$userId) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access',
    ]);
    exit();
}

// Fetch user details
$userQuery = "SELECT full_name, email FROM users WHERE user_id = '$userId'";
$userResult = mysqli_query($con, $userQuery);
$userData = mysqli_fetch_assoc($userResult);

if (!$userData) {
    echo json_encode([
        'success' => false,
        'message' => 'User not found',
    ]);
    exit();
}

// Fetch booking history with room number
$bookingQuery = "
    SELECT 
        b.booking_id, 
        b.booking_date, 
        b.checkin_date, 
        b.checkout_date, 
        b.booking_amount,
        r.room_number, 
        rc.class_name 
    FROM bookings b
    JOIN booking_rooms br ON b.booking_id = br.booking_id
    JOIN rooms r ON br.room_id = r.room_id
    JOIN room_classes rc ON r.room_class_id = rc.room_class_id
    WHERE b.user_id = '$userId'
    ORDER BY b.booking_date DESC;
";

$bookingResult = mysqli_query($con, $bookingQuery);
$bookings = [];

while ($row = mysqli_fetch_assoc($bookingResult)) {
    $bookings[] = $row;
}

// Return user details + bookings
echo json_encode([
    'success' => true,
    'user' => $userData,
    'bookings' => $bookings,
]);
?>
