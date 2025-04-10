<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Fetch Facilities with Images
$sql = "SELECT facility_id, facility_name, description, facility_image_url FROM facilities"; // Make sure `facility_id` exists
$result = mysqli_query($con, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to get facilities",
    ]);
    exit();
}

$facilities = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Return JSON response
echo json_encode([
    'success' => true,
    'facilities' => $facilities
]);
?>
