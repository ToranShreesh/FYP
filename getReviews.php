<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Fetch Reviews with Room Class Name
$sql = "SELECT r.review_id, r.ratings, r.description, rc.class_name 
        FROM reviews r 
        JOIN room_classes rc ON r.room_class_id = rc.room_class_id"; // Join to get class_name
$result = mysqli_query($con, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to get reviews",
    ]);
    exit();
}

$reviews = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Return JSON response
echo json_encode([
    'success' => true,
    'reviews' => $reviews
]);
?>