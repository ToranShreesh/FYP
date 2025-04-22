<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

// Check authentication
if (!isset($_POST['token']) && !isset($_GET['token'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$token = $_POST['token'] ?? $_GET['token'];
$userId = getUserIdFromToken($token);

if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all bookings with details including room numbers
    $query = "
        SELECT b.booking_id, b.user_id, u.full_name, b.booking_date, b.checkin_date, b.checkout_date, 
               b.booking_amount, b.booking_status, COUNT(br.room_id) AS num_rooms, 
               rc.class_name, rc.base_price,
               GROUP_CONCAT(r.room_number) AS room_numbers
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN booking_rooms br ON b.booking_id = br.booking_id
        LEFT JOIN rooms r ON br.room_id = r.room_id
        LEFT JOIN room_classes rc ON r.room_class_id = rc.room_class_id
        GROUP BY b.booking_id
    ";

    $result = mysqli_query($con, $query);

    if (!$result) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to get bookings: ' . mysqli_error($con)]);
        mysqli_close($con);
        exit();
    }

    $bookings = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $bookings[] = [
            'booking_id' => $row['booking_id'],
            'user_id' => $row['user_id'],
            'full_name' => $row['full_name'],
            'booking_date' => $row['booking_date'],
            'checkin_date' => $row['checkin_date'],
            'checkout_date' => $row['checkout_date'],
            'booking_amount' => $row['booking_amount'],
            'booking_status' => $row['booking_status'],
            'num_rooms' => $row['num_rooms'],
            'room_class' => $row['class_name'],
            'base_price' => $row['base_price'],
            'room_numbers' => $row['room_numbers'] ? explode(',', $row['room_numbers']) : []
        ];
    }

    mysqli_free_result($result);

    if (empty($bookings)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'No bookings found',
            'bookings' => []
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'bookings' => $bookings
        ]);
    }
} elseif ($method === 'POST') {
    // Delete booking
    $data = json_decode(file_get_contents('php://input'), true);
    $booking_id = isset($data['booking_id']) ? intval($data['booking_id']) : 0;

    if ($booking_id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid booking ID']);
        exit();
    }

    $query = "DELETE FROM bookings WHERE booking_id = ?";
    $stmt = mysqli_prepare($con, $query);
    mysqli_stmt_bind_param($stmt, 'i', $booking_id);
    $result = mysqli_stmt_execute($stmt);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Booking deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete booking: ' . mysqli_error($con)]);
    }

    mysqli_stmt_close($stmt);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

mysqli_close($con);
?>