<?php
header('Content-Type: application/json');
include './helpers/connection.php';

if (!isset($_GET['room_class_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Room class ID is required']);
    exit();
}

$roomClassId = filter_var($_GET['room_class_id'], FILTER_VALIDATE_INT);
if ($roomClassId === false || $roomClassId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid room class ID']);
    exit();
}

$startDate = date('Y-m-d');
$endDate = date('Y-m-d', strtotime('+6 months'));

try {
    // Verify room_class_id
    $checkClassQuery = $con->prepare("SELECT COUNT(*) as count FROM room_classes WHERE room_class_id = ?");
    $checkClassQuery->bind_param("i", $roomClassId);
    $checkClassQuery->execute();
    $classResult = $checkClassQuery->get_result()->fetch_assoc();
    if ($classResult['count'] == 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Room class not found']);
        exit();
    }

    // Get total enabled rooms
    $totalRoomsQuery = $con->prepare("SELECT COUNT(*) as total_rooms FROM rooms WHERE room_class_id = ? AND is_enabled = 1");
    $totalRoomsQuery->bind_param("i", $roomClassId);
    $totalRoomsQuery->execute();
    $totalRoomsResult = $totalRoomsQuery->get_result()->fetch_assoc();
    $totalRooms = $totalRoomsResult['total_rooms'];

    if ($totalRooms === 0) {
        $unavailableDates = [];
        $currentDate = new DateTime($startDate);
        $endDateTime = new DateTime($endDate);
        while ($currentDate <= $endDateTime) {
            $unavailableDates[] = $currentDate->format('Y-m-d');
            $currentDate->modify('+1 day');
        }
        echo json_encode([
            'success' => true,
            'unavailableDates' => $unavailableDates,
            'totalRooms' => 0,
            'availableRoomsByDate' => []
        ]);
        exit();
    }

    // Calculate available rooms per date
    $unavailableDates = [];
    $availableRoomsByDate = [];
    $currentDate = new DateTime($startDate);
    $endDateTime = new DateTime($endDate);

    while ($currentDate <= $endDateTime) {
        $dateStr = $currentDate->format('Y-m-d');

        $bookedQuery = $con->prepare("
            SELECT COUNT(DISTINCT br.room_id) as booked_rooms
            FROM bookings b
            JOIN booking_rooms br ON b.booking_id = br.booking_id
            JOIN rooms r ON br.room_id = r.room_id
            WHERE r.room_class_id = ?
            AND r.is_enabled = 1
            AND b.booking_status != 'Cancelled'
            AND b.checkin_date <= ?
            AND b.checkout_date > ?
        ");
        $bookedQuery->bind_param("iss", $roomClassId, $dateStr, $dateStr);
        $bookedQuery->execute();
        $bookedResult = $bookedQuery->get_result();
        $row = $bookedResult->fetch_assoc();
        $bookedRooms = $row ? (int)$row['booked_rooms'] : 0;

        error_log("Date: $dateStr, Room Class: $roomClassId, Booked: $bookedRooms, Total: $totalRooms");

        $availableRooms = $totalRooms - $bookedRooms;
        $availableRoomsByDate[$dateStr] = $availableRooms;

        if ($availableRooms <= 0) {
            $unavailableDates[] = $dateStr;
        }

        $currentDate->modify('+1 day');
    }

    echo json_encode([
        'success' => true,
        'unavailableDates' => $unavailableDates,
        'totalRooms' => $totalRooms,
        'availableRoomsByDate' => $availableRoomsByDate
    ]);

} catch (Exception $e) {
    http_response_code(500);
    error_log("check_room_availability error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} finally {
    if (isset($checkClassQuery) && $checkClassQuery instanceof mysqli_stmt && !$checkClassQuery->errno) {
        $checkClassQuery->close();
    }
    if (isset($totalRoomsQuery) && $totalRoomsQuery instanceof mysqli_stmt && !$totalRoomsQuery->errno) {
        $totalRoomsQuery->close();
    }
    if (isset($bookedQuery) && $bookedQuery instanceof mysqli_stmt && !$bookedQuery->errno) {
        $bookedQuery->close();
    }
    $con->close();
}
?>