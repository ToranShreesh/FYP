<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

header('Content-Type: application/json');

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
if (!isset($_POST['facility_id'], $_POST['rating'])) {
    echo json_encode(['success' => false, 'message' => 'Facility ID and rating are required']);
    exit();
}

$facility_id = intval($_POST['facility_id']);
$rating = floatval($_POST['rating']);

if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating value (must be between 1 and 5)']);
    exit();
}

// Check if user already rated this facility
$checkQuery = "SELECT rating_id FROM facility_ratings WHERE facility_id = ? AND user_id = ?";
$checkStmt = $con->prepare($checkQuery);
$checkStmt->bind_param("ii", $facility_id, $userId);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();
$checkStmt->close();

if ($checkResult->num_rows > 0) {
    // Update existing rating
    $updateStmt = $con->prepare("UPDATE facility_ratings SET rating = ? WHERE facility_id = ? AND user_id = ?");
    $updateStmt->bind_param("dii", $rating, $facility_id, $userId);
    $success = $updateStmt->execute();
    $updateStmt->close();
} else {
    // Insert new rating
    $insertStmt = $con->prepare("INSERT INTO facility_ratings (facility_id, user_id, rating) VALUES (?, ?, ?)");
    $insertStmt->bind_param("iid", $facility_id, $userId, $rating);
    $success = $insertStmt->execute();
    $insertStmt->close();
}

if (!$success) {
    echo json_encode(["success" => false, "message" => "Failed to submit rating"]);
    exit();
}

// Fetch updated average rating
$avgQuery = "SELECT AVG(rating) AS avg_rating FROM facility_ratings WHERE facility_id = ?";
$avgStmt = $con->prepare($avgQuery);
$avgStmt->bind_param("i", $facility_id);
$avgStmt->execute();
$result = $avgStmt->get_result()->fetch_assoc();
$avgStmt->close();

$avg_rating = $result['avg_rating'] ?? 0;

echo json_encode(["success" => true, "avg_rating" => round($avg_rating, 1)]);
$con->close();
?>
