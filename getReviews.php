<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

$room_class_id = isset($_GET['room_class_id']) ? (int)$_GET['room_class_id'] : null;

$sql = "SELECT r.review_id, r.ratings, r.description, r.review_date, u.full_name AS reviewer_name, rc.class_name 
        FROM reviews r 
        JOIN room_classes rc ON r.room_class_id = rc.room_class_id
        JOIN users u ON r.user_id = u.user_id";

if ($room_class_id !== null) {
    $sql .= " WHERE r.room_class_id = ?";
}

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to prepare statement: ' . mysqli_error($con)
    ]);
    exit();
}

if ($room_class_id !== null) {
    mysqli_stmt_bind_param($stmt, 'i', $room_class_id);
}

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get reviews: ' . mysqli_error($con)
    ]);
    exit();
}

$reviews = mysqli_fetch_all($result, MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'reviews' => $reviews
]);

mysqli_stmt_close($stmt);
mysqli_close($con);
?>