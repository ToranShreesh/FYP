<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
include './helpers/connection.php';

if (!isset($_GET['facility_id'])) {
    echo json_encode(['success' => false, 'message' => 'Facility ID required']);
    exit();
}

$facility_id = intval($_GET['facility_id']);

$query = "SELECT AVG(rating) AS avg_rating FROM facility_ratings WHERE facility_id = ?";
$stmt = $con->prepare($query);
$stmt->bind_param("i", $facility_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

$avg_rating = $data['avg_rating'] ?? 0; // Set default value if null
$avg_rating = $avg_rating !== null ? round($avg_rating, 1) : 0; // Ensure it's not null

echo json_encode(['success' => true, 'avg_rating' => $avg_rating]);

$stmt->close();
$con->close();
?>
