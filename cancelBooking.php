<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

if (!isset($_POST['token']) || !isset($_POST['booking_id'])) {
    echo json_encode(['success' => false, 'message' => 'Token and Booking ID are required']);
    exit();
}

$token = $_POST['token'];
$userId = getUserIdFromToken($token);

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$bookingId = intval($_POST['booking_id']);
$con->begin_transaction();

try {
    // Verify booking and fetch checkin_date, checkout_date
    $stmt = $con->prepare("
        SELECT checkin_date, checkout_date 
        FROM bookings 
        WHERE booking_id = ? AND user_id = ?
    ");
    $stmt->bind_param("ii", $bookingId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Booking not found or unauthorized');
    }

    $booking = $result->fetch_assoc();
    if (!$booking['checkin_date'] || !strtotime($booking['checkin_date'])) {
        throw new Exception('Invalid checkin date');
    }

    $checkinDate = strtotime($booking['checkin_date']);
    $checkoutDate = strtotime($booking['checkout_date']);
    $today = strtotime(date('Y-m-d'));

    // Prevent cancellation after checkout date
    if ($checkoutDate < $today) {
        throw new Exception('Cannot cancel booking after checkout date');
    }

    // Fetch all room IDs for the booking
    $roomFetch = $con->prepare("
        SELECT room_id 
        FROM booking_rooms 
        WHERE booking_id = ?
    ");
    $roomFetch->bind_param("i", $bookingId);
    $roomFetch->execute();
    $roomResult = $roomFetch->get_result();

    // Enable all rooms
    $enableRoom = $con->prepare("
        UPDATE rooms 
        SET is_enabled = 1 
        WHERE room_id = ?
    ");
    while ($room = $roomResult->fetch_assoc()) {
        $enableRoom->bind_param("i", $room['room_id']);
        if (!$enableRoom->execute()) {
            throw new Exception('Failed to enable rooms: ' . $con->error);
        }
    }
    error_log("Rooms enabled successfully");

    // Delete booking_rooms entries
    $deleteRooms = $con->prepare("
        DELETE FROM booking_rooms 
        WHERE booking_id = ?
    ");
    $deleteRooms->bind_param("i", $bookingId);
    if (!$deleteRooms->execute()) {
        throw new Exception('Failed to delete booking rooms: ' . $con->error);
    }
    error_log("Booking rooms deleted successfully");

    // Update booking status to Cancelled
    $updateBooking = $con->prepare("
        UPDATE bookings 
        SET booking_status = 'Cancelled'
        WHERE booking_id = ?
    ");
    $updateBooking->bind_param("i", $bookingId);
    if (!$updateBooking->execute()) {
        throw new Exception('Failed to update booking status: ' . $con->error);
    }
    error_log("Booking status updated to Cancelled successfully");

    $con->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Booking canceled successfully',
        'booking_status' => 'Cancelled'
    ]);
} catch (Exception $e) {
    error_log("Transaction failed: " . $e->getMessage());
    $con->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($roomFetch)) $roomFetch->close();
    if (isset($enableRoom)) $enableRoom->close();
    if (isset($deleteRooms)) $deleteRooms->close();
    if (isset($updateBooking)) $updateBooking->close();
}
?>