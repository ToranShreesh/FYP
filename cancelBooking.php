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

// Validate required fields
if (!isset($_POST['booking_id'], $_POST['rooms_to_cancel'], $_POST['price_per_room'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

$bookingId = intval($_POST['booking_id']);
$roomsToCancel = intval($_POST['rooms_to_cancel']);
$pricePerRoom = floatval($_POST['price_per_room']);

$con->begin_transaction();

try {
    // Fetch current booking details
    $stmt = $con->prepare("
        SELECT COUNT(br.room_id) AS current_rooms 
        FROM bookings 
        JOIN booking_rooms br ON bookings.booking_id = br.booking_id 
        WHERE bookings.booking_id = ? AND bookings.user_id = ?
    ");
    $stmt->bind_param("ii", $bookingId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Booking not found');
    }

    $bookingData = $result->fetch_assoc();
    $currentRooms = intval($bookingData['current_rooms']);

    if ($roomsToCancel >= $currentRooms) {
        throw new Exception('Cannot cancel all rooms. Use delete booking feature.');
    }

    // Fetch booked rooms for removal
    $roomFetch = $con->prepare("
        SELECT room_id FROM booking_rooms 
        WHERE booking_id = ? 
        LIMIT ?
    ");
    $roomFetch->bind_param("ii", $bookingId, $roomsToCancel);
    $roomFetch->execute();
    $roomResult = $roomFetch->get_result();

    if ($roomResult->num_rows < $roomsToCancel) {
        throw new Exception('Error fetching rooms for cancellation');
    }

    // Prepare statements for room deletion and enabling
    $deleteRoom = $con->prepare("
        DELETE FROM booking_rooms 
        WHERE booking_id = ? AND room_id = ? 
        LIMIT 1
    ");
    $enableRoom = $con->prepare("
        UPDATE room 
        SET is_enabled = 1 
        WHERE room_id = ?
    ");

    while ($room = $roomResult->fetch_assoc()) {
        // Delete room from booking
        $deleteRoom->bind_param("ii", $bookingId, $room['room_id']);
        if (!$deleteRoom->execute()) {
            throw new Exception('Failed to cancel room');
        }

        // Enable the room
        $enableRoom->bind_param("i", $room['room_id']);
        if (!$enableRoom->execute()) {
            throw new Exception('Failed to enable room');
        }
    }

    // Update booking amount
    $newBookingAmount = ($currentRooms - $roomsToCancel) * $pricePerRoom;
    $updateBooking = $con->prepare("
        UPDATE bookings 
        SET booking_amount = ? 
        WHERE booking_id = ?
    ");
    $updateBooking->bind_param("di", $newBookingAmount, $bookingId);
    if (!$updateBooking->execute()) {
        throw new Exception('Failed to update booking amount');
    }

    // Commit transaction
    $con->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Rooms canceled successfully',
        'new_booking_amount' => $newBookingAmount
    ]);
} catch (Exception $e) {
    $con->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($roomFetch)) $roomFetch->close();
    if (isset($deleteRoom)) $deleteRoom->close();
    if (isset($enableRoom)) $enableRoom->close();
    if (isset($updateBooking)) $updateBooking->close();
}
?>