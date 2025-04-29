<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust for your frontend domain
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug POST data
error_log(print_r($_POST, true));
error_log("Raw input: " . file_get_contents("php://input"));

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

// Handle eligibility check
if (isset($_POST['checkEligibility']) && $_POST['checkEligibility'] === 'true') {
    $stmt = mysqli_prepare($con, "
        SELECT booking_id 
        FROM bookings 
        WHERE user_id = ? 
        AND booking_status = 'Completed' 
        AND checkout_date < CURDATE()
    ");
    mysqli_stmt_bind_param($stmt, 'i', $userId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => true, 'canRate' => true]);
    } else {
        echo json_encode([
            'success' => true,
            'canRate' => false,
            'message' => 'You must book and stay in a room to rate this facility'
        ]);
    }
    mysqli_stmt_close($stmt);
    mysqli_close($con);
    exit();
}

// Validate required fields for rating submission
if (!isset($_POST['facility_id']) || !isset($_POST['rating'])) {
    echo json_encode(['success' => false, 'message' => 'Facility ID and rating are required']);
    exit();
}

$facility_id = (int)$_POST['facility_id'];
$rating = (float)$_POST['rating'];

// Validate inputs
if ($facility_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid facility ID']);
    exit();
}
if ($rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Invalid rating value (must be between 1 and 5)']);
    exit();
}

// Verify facility_id exists
$stmt = mysqli_prepare($con, "SELECT facility_id FROM facilities WHERE facility_id = ?");
mysqli_stmt_bind_param($stmt, 'i', $facility_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid facility_id. No such facility exists'
    ]);
    mysqli_stmt_close($stmt);
    exit();
}
mysqli_stmt_close($stmt);

// Verify user has a completed booking
$stmt = mysqli_prepare($con, "
    SELECT booking_id 
    FROM bookings 
    WHERE user_id = ? 
    AND booking_status = 'Completed' 
    AND checkout_date < CURDATE()
");
mysqli_stmt_bind_param($stmt, 'i', $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'You can only rate facilities if you have booked and stayed in a room'
    ]);
    mysqli_stmt_close($stmt);
    exit();
}
mysqli_stmt_close($stmt);

// Check if user already rated this facility
$checkStmt = mysqli_prepare($con, "SELECT rating_id FROM facility_ratings WHERE facility_id = ? AND user_id = ?");
mysqli_stmt_bind_param($checkStmt, 'ii', $facility_id, $userId);
mysqli_stmt_execute($checkStmt);
$checkResult = mysqli_stmt_get_result($checkStmt);

if (mysqli_num_rows($checkResult) > 0) {
    // Update existing rating
    $updateStmt = mysqli_prepare($con, "UPDATE facility_ratings SET rating = ? WHERE facility_id = ? AND user_id = ?");
    mysqli_stmt_bind_param($updateStmt, 'dii', $rating, $facility_id, $userId);
    $success = mysqli_stmt_execute($updateStmt);
    mysqli_stmt_close($updateStmt);
} else {
    // Insert new rating
    $insertStmt = mysqli_prepare($con, "INSERT INTO facility_ratings (facility_id, user_id, rating) VALUES (?, ?, ?)");
    mysqli_stmt_bind_param($insertStmt, 'iid', $facility_id, $userId, $rating);
    $success = mysqli_stmt_execute($insertStmt);
    mysqli_stmt_close($insertStmt);
}
mysqli_stmt_close($checkStmt);

if (!$success) {
    echo json_encode(['success' => false, 'message' => 'Failed to submit rating: ' . mysqli_error($con)]);
    exit();
}

// Fetch updated average rating
$avgStmt = mysqli_prepare($con, "SELECT AVG(rating) AS avg_rating FROM facility_ratings WHERE facility_id = ?");
mysqli_stmt_bind_param($avgStmt, 'i', $facility_id);
mysqli_stmt_execute($avgStmt);
$result = mysqli_stmt_get_result($avgStmt);
$avg_rating = mysqli_fetch_assoc($result)['avg_rating'] ?? null;
mysqli_stmt_close($avgStmt);

echo json_encode([
    'success' => true,
    'message' => 'Rating submitted successfully',
    'avg_rating' => $avg_rating ? round($avg_rating, 1) : null
]);

mysqli_close($con);
?>