<?php
header('Content-Type: application/json');
include './helpers/connection.php';
include './helpers/authHelper.php';

try {
    if (!isset($_POST['token'])) {
        throw new Exception('Token is required', 400);
    }

    $token = $_POST['token'];
    $userId = getUserIdFromToken($token);

    if (!$userId) {
        throw new Exception('Unauthorized access', 401);
    }

    $reportType = $_POST['report_type'] ?? '';
    $timeRange = $_POST['time_range'] ?? 'daily';

    $response = [
        'success' => true,
        'data' => [],
        'metadata' => [
            'report_type' => $reportType,
            'time_range' => $timeRange,
            'record_count' => 0
        ]
    ];

    switch ($reportType) {
        case 'bookings':
            $response['data'] = getBookingReport($con, $timeRange);
            break;
            
        case 'earnings':
            $response['data'] = getEarningsReport($con, $timeRange);
            break;
            
        case 'guests':
            $response['data'] = getGuestReport($con);
            break;
            
        case 'most-booked-room':
            $response['data'] = getRoomReport($con);
            break;
            
        default:
            throw new Exception('Invalid report type', 400);
    }

    $response['metadata']['record_count'] = count($response['data']);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}

function getBookingReport($con, $timeRange) {
    $query = $timeRange === 'daily' 
        ? "SELECT DATE(booking_date) AS date, COUNT(*) AS count 
           FROM bookings 
           GROUP BY DATE(booking_date)
           ORDER BY date DESC
           LIMIT 30"
        : "SELECT DATE_FORMAT(booking_date, '%Y-%m') AS month, COUNT(*) AS count
           FROM bookings 
           GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
           ORDER BY month DESC
           LIMIT 12";
    
    return executeQuery($con, $query);
}

function getEarningsReport($con, $timeRange) {
    $query = $timeRange === 'daily'
        ? "SELECT DATE(booking_date) AS date, SUM(booking_amount) AS amount 
           FROM bookings 
           GROUP BY DATE(booking_date)
           ORDER BY date DESC
           LIMIT 30"
        : "SELECT DATE_FORMAT(booking_date, '%Y-%m') AS month, SUM(booking_amount) AS amount
           FROM bookings 
           GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
           ORDER BY month DESC
           LIMIT 12";
    
    return executeQuery($con, $query);
}

function getGuestReport($con) {
    $query = "SELECT u.full_name, u.email,
              SUM(DATEDIFF(b.checkout_date, b.checkin_date)) AS totalStay
              FROM users u
              JOIN bookings b ON u.user_id = b.user_id
              WHERE u.role != 'admin'
              GROUP BY u.user_id
              ORDER BY totalStay DESC
              LIMIT 50";
    
    return executeQuery($con, $query);
}

function getRoomReport($con) {
    $query = "SELECT CONCAT(r.room_number, ' - ', rc.class_name) AS room_name,
              rc.class_name AS room_type,
              COUNT(br.room_id) AS count 
              FROM booking_rooms br
              JOIN rooms r ON br.room_id = r.room_id
              JOIN room_classes rc ON r.room_class_id = rc.room_class_id
              GROUP BY r.room_number, rc.class_name
              ORDER BY count DESC
              LIMIT 10";
    
    return executeQuery($con, $query);
}

function executeQuery($con, $query) {
    $result = mysqli_query($con, $query);
    if (!$result) {
        throw new Exception('Database error: ' . mysqli_error($con), 500);
    }
    return mysqli_fetch_all($result, MYSQLI_ASSOC);
}