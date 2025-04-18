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

// Fetch user's bookings with booking_status
$query = "
    SELECT b.booking_id, b.checkin_date, b.checkout_date, b.booking_amount, b.booking_status,
           COUNT(br.room_id) AS num_rooms, rc.class_name, rc.base_price
    FROM bookings b
    LEFT JOIN booking_rooms br ON b.booking_id = br.booking_id
    LEFT JOIN rooms r ON br.room_id = r.room_id
    LEFT JOIN room_classes rc ON r.room_class_id = rc.room_class_id
    WHERE b.user_id = ?
    GROUP BY b.booking_id
";

$stmt = $con->prepare($query);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = [
        'booking_id' => $row['booking_id'],
        'checkin_date' => $row['checkin_date'],
        'checkout_date' => $row['checkout_date'],
        'booking_amount' => $row['booking_amount'],
        'booking_status' => $row['booking_status'],
        'num_rooms' => $row['num_rooms'],
        'room_class' => $row['class_name'],
        'base_price' => $row['base_price']
    ];
}

echo json_encode([
    'success' => true,
    'bookings' => $bookings
]);

$stmt->close();
?>