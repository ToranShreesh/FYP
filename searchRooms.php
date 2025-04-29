<?php
// Include database connection and helper files
include './helpers/connection.php';
include './helpers/authHelper.php';

// Set response header to JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Allow CORS for React frontend

// Validate required query parameters
if (!isset($_GET['check_in']) || !isset($_GET['check_out'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Check-in and check-out dates are required']);
    exit();
}

$check_in = $_GET['check_in'];
$check_out = $_GET['check_out'];
$guests = isset($_GET['guests']) ? (int)$_GET['guests'] : 1; // Number of guests
$class_name = isset($_GET['class_name']) ? trim($_GET['class_name']) : ''; // Optional room class name

// Validate dates
if (!DateTime::createFromFormat('Y-m-d', $check_in) || !DateTime::createFromFormat('Y-m-d', $check_out)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid date format. Use YYYY-MM-DD']);
    exit();
}
if (strtotime($check_in) >= strtotime($check_out)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Check-out date must be after check-in date']);
    exit();
}

try {
    // Get room classes matching guest count and class name
    $classQuery = "
        SELECT rc.*
        FROM room_classes rc
        WHERE rc.no_of_guests >= ?
        AND (rc.class_name = ? OR ? = '')
    ";
    $classStmt = $con->prepare($classQuery);
    if (!$classStmt) {
        throw new Exception('Failed to prepare room class query');
    }
    $classStmt->bind_param("iss", $guests, $class_name, $class_name);
    $classStmt->execute();
    $classResult = $classStmt->get_result();

    $rooms = [];
    $currentDate = new DateTime($check_in);
    $endDate = new DateTime($check_out);

    while ($roomClass = $classResult->fetch_assoc()) {
        $roomClassId = $roomClass['room_class_id'];

        // Get total enabled rooms for this class
        $totalRoomsStmt = $con->prepare("
            SELECT COUNT(*) as total_rooms
            FROM rooms
            WHERE room_class_id = ? AND is_enabled = 1
        ");
        $totalRoomsStmt->bind_param("i", $roomClassId);
        $totalRoomsStmt->execute();
        $totalRoomsResult = $totalRoomsStmt->get_result()->fetch_assoc();
        $totalRooms = $totalRoomsResult['total_rooms'];
        $totalRoomsStmt->close();

        if ($totalRooms === 0) {
            continue; // Skip if no enabled rooms
        }

        // Check availability for each date in the range
        $isAvailable = true;
        $minAvailableRooms = $totalRooms;
        $currentDate->setTimestamp(strtotime($check_in)); // Reset to start

        while ($currentDate < $endDate) {
            $dateStr = $currentDate->format('Y-m-d');

            // Count booked rooms for the current date
            $bookedStmt = $con->prepare("
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
            $bookedStmt->bind_param("iss", $roomClassId, $dateStr, $dateStr);
            $bookedStmt->execute();
            $bookedResult = $bookedStmt->get_result();
            $bookedRow = $bookedResult->fetch_assoc();
            $bookedRooms = $bookedRow ? (int)$bookedRow['booked_rooms'] : 0;
            $bookedStmt->close();

            error_log("Search: Date: $dateStr, Room Class: $roomClassId, Booked: $bookedRooms, Total: $totalRooms");

            $availableRooms = $totalRooms - $bookedRooms;
            if ($availableRooms <= 0) {
                $isAvailable = false;
                break;
            }
            $minAvailableRooms = min($minAvailableRooms, $availableRooms);

            $currentDate->modify('+1 day');
        }

        if ($isAvailable) {
            // Fetch images
            $imageStmt = $con->prepare("SELECT room_image_url FROM images WHERE room_class_id = ?");
            $imageStmt->bind_param("i", $roomClassId);
            $imageStmt->execute();
            $imageResult = $imageStmt->get_result();
            $images = [];
            while ($imgRow = $imageResult->fetch_assoc()) {
                $images[] = $imgRow['room_image_url'];
            }
            $imageStmt->close();

            // Prepare room class data
            $roomClass['images'] = $images;
            $roomClass['amenities'] = $roomClass['amenities'] ?? '';
            $roomClass['basePrice'] = $roomClass['base_price'];
            unset($roomClass['base_price']);
            $roomClass['availableRooms'] = $minAvailableRooms; // Add available rooms count

            $rooms[] = $roomClass;
        }
    }

    $classStmt->close();

    // Return response
    if (empty($rooms)) {
        echo json_encode(['success' => true, 'message' => 'No rooms available for the selected criteria', 'data' => []]);
    } else {
        echo json_encode(['success' => true, 'message' => 'Rooms fetched successfully', 'data' => $rooms]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

$con->close();
?>