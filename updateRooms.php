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
if (!isset($_POST['booking_id'], $_POST['base_price'])) {
    echo json_encode(['success' => false, 'message' => 'Booking ID and base price are required']);
    exit();
}

$bookingId = intval($_POST['booking_id']);
$pricePerRoom = floatval($_POST['base_price']);

$con->begin_transaction();

try {
    // Fetch current booking details
    $stmt = $con->prepare("
        SELECT COUNT(br.room_id) AS current_rooms 
        FROM bookings b 
        JOIN booking_rooms br ON b.booking_id = br.booking_id 
        WHERE b.booking_id = ? AND b.user_id = ?
    ");
    $stmt->bind_param("ii", $bookingId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Booking not found');
    }

    $bookingData = $result->fetch_assoc();
    $currentRooms = intval($bookingData['current_rooms']);

    // Corrected query to get available rooms (excluding already booked ones)
    $roomQuery = $con->prepare("
        SELECT COUNT(*) AS available_rooms 
        FROM rooms 
        WHERE is_enabled = 1 
        AND room_id NOT IN (SELECT room_id FROM booking_rooms)
    ");
    $roomQuery->execute();
    $roomResult = $roomQuery->get_result();
    $availableRooms = $roomResult->fetch_assoc()['available_rooms'];

    if (isset($_POST['added_rooms'])) {
        $roomsToAdd = intval($_POST['added_rooms']);

        if ($roomsToAdd < 1) {
            throw new Exception('Must add at least one room.');
        }

        if ($roomsToAdd > $availableRooms) {
            throw new Exception('Not enough available rooms.');
        }

        // Fetch unbooked rooms
        $fetchRooms = $con->prepare("
            SELECT room_id FROM rooms 
            WHERE is_enabled = 1 
            AND room_id NOT IN (SELECT room_id FROM booking_rooms) 
            LIMIT ?
        ");
        $fetchRooms->bind_param("i", $roomsToAdd);
        $fetchRooms->execute();
        $roomResult = $fetchRooms->get_result();

        if ($roomResult->num_rows < $roomsToAdd) {
            throw new Exception('Not enough rooms available.');
        }

        // Prepare statements for room assignment and disabling
        $insertRoom = $con->prepare("INSERT INTO booking_rooms (booking_id, room_id) VALUES (?, ?)");
        $disableRoom = $con->prepare("UPDATE rooms SET is_enabled = 0 WHERE room_id = ?");

        while ($room = $roomResult->fetch_assoc()) {
            // Assign room to booking
            $insertRoom->bind_param("ii", $bookingId, $room['room_id']);
            if (!$insertRoom->execute()) {
                throw new Exception('Failed to assign room: ' . $con->error);
            }

            // Disable the room
            $disableRoom->bind_param("i", $room['room_id']);
            if (!$disableRoom->execute()) {
                throw new Exception('Failed to disable room: ' . $con->error);
            }
        }

        // Update booking amount
        $newBookingAmount = ($currentRooms + $roomsToAdd) * $pricePerRoom;
        $updateBooking = $con->prepare("UPDATE bookings SET booking_amount = ? WHERE booking_id = ?");
        $updateBooking->bind_param("di", $newBookingAmount, $bookingId);
        if (!$updateBooking->execute()) {
                throw new Exception('Failed to update booking amount: ' . $con->error);
        }

        $con->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Rooms added successfully',
            'new_booking_amount' => $newBookingAmount,
            'current_rooms' => $currentRooms + $roomsToAdd,
            'available_rooms' => $availableRooms - $roomsToAdd
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Current booking details',
            'current_rooms' => $currentRooms,
            'available_rooms' => $availableRooms
        ]);
    }
} catch (Exception $e) {
    $con->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    $stmt->close();
    if (isset($roomQuery)) $roomQuery->close();
    if (isset($fetchRooms)) $fetchRooms->close();
    if (isset($insertRoom)) $insertRoom->close();
    if (isset($disableRoom)) $disableRoom->close();
    if (isset($updateBooking)) $updateBooking->close();
}
?>