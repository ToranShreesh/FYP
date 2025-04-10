<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

if (!isset($_GET['booking_id'])) {
    echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
    exit();
}

$bookingId = intval($_GET['booking_id']);

// Fetch booking details
$query = "
    SELECT b.booking_id, b.user_id, b.checkin_date, b.checkout_date, b.booking_amount, 
           COUNT(br.room_id) AS num_rooms, r.class_name, r.base_price
    FROM bookings b
    JOIN booking_rooms br ON b.booking_id = br.booking_id
    JOIN rooms ro ON br.room_id = ro.room_id
    JOIN room_classes r ON ro.room_class_id = r.room_class_id
    WHERE b.booking_id = ?
    GROUP BY b.booking_id
";

$stmt = $con->prepare($query);
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $booking = $result->fetch_assoc();

    // Get total rooms of the booked class
    $roomClassQuery = "
        SELECT COUNT(*) AS total_rooms 
        FROM rooms 
        WHERE room_class_id = (
            SELECT room_class_id FROM rooms WHERE room_id IN (
                SELECT room_id FROM booking_rooms WHERE booking_id = ?
            ) LIMIT 1
        )
    ";

    $stmt = $con->prepare($roomClassQuery);
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $roomClassResult = $stmt->get_result();
    $totalRooms = $roomClassResult->fetch_assoc()['total_rooms'] ?? 0;

    // Get booked rooms for the same class
    $bookedRoomsQuery = "
        SELECT COUNT(*) AS booked_rooms 
        FROM booking_rooms br
        JOIN rooms ro ON br.room_id = ro.room_id
        WHERE ro.room_class_id = (
            SELECT room_class_id FROM rooms WHERE room_id IN (
                SELECT room_id FROM booking_rooms WHERE booking_id = ?
            ) LIMIT 1
        )
    ";

    $stmt = $con->prepare($bookedRoomsQuery);
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $bookedRoomsResult = $stmt->get_result();
    $bookedRooms = $bookedRoomsResult->fetch_assoc()['booked_rooms'] ?? 0;

    // Calculate available rooms
    $availableRooms = max(0, $totalRooms - $bookedRooms);

    $booking['available_rooms'] = $availableRooms;

    echo json_encode(['success' => true, 'booking' => $booking]);
} else {
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
}

$stmt->close();
?>
