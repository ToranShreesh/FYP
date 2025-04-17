<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Fetch Facility Ratings with Facility Name
$sql = "SELECT fr.rating_id, fr.user_id, fr.rating, f.facility_name 
        FROM facility_ratings fr 
        JOIN facilities f ON fr.facility_id = f.facility_id"; // Join to get facility_name
$result = mysqli_query($con, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to get facility ratings",
    ]);
    exit();
}

$ratings = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Return JSON response
echo json_encode([
    'success' => true,
    'ratings' => $ratings
]);
?>