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
    $startDate = $_POST['start_date'] ?? null;
    $endDate = $_POST['end_date'] ?? null;

    // Validate start_date and end_date for bookings and earnings
    if (in_array($reportType, ['bookings', 'earnings']) && ($startDate === null || $endDate === null)) {
        throw new Exception('Start date and end date are required for this report type', 400);
    }

    // Validate date format and range
    if ($startDate && $endDate) {
        if (!DateTime::createFromFormat('Y-m-d', $startDate) || !DateTime::createFromFormat('Y-m-d', $endDate)) {
            throw new Exception('Invalid date format. Use YYYY-MM-DD', 400);
        }
        if (strtotime($startDate) > strtotime($endDate)) {
            throw new Exception('Start date cannot be after end date', 400);
        }
    }

    $response = [
        'success' => true,
        'data' => [],
        'metadata' => [
            'report_type' => $reportType,
            'record_count' => 0,
            'start_date' => $startDate,
            'end_date' => $endDate
        ]
    ];

    switch ($reportType) {
        case 'bookings':
            $response['data'] = getBookingReport($con, $startDate, $endDate);
            break;
            
        case 'earnings':
            $response['data'] = getEarningsReport($con, $startDate, $endDate);
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

function getBookingReport($con, $startDate, $endDate) {
    $query = "SELECT DATE(booking_date) AS date, COUNT(*) AS count 
              FROM bookings 
              WHERE booking_date BETWEEN ? AND ?
              GROUP BY DATE(booking_date)
              ORDER BY date ASC";
    
    return executePreparedQuery($con, $query, [$startDate, $endDate]);
}

function getEarningsReport($con, $startDate, $endDate) {
    $query = "SELECT DATE(booking_date) AS date, SUM(booking_amount) AS amount 
              FROM bookings 
              WHERE booking_date BETWEEN ? AND ?
              GROUP BY DATE(booking_date)
              ORDER BY date ASC";
    
    return executePreparedQuery($con, $query, [$startDate, $endDate]);
}

function getGuestReport($con) {
    $query = "SELECT u.full_name, u.email,
              COUNT(b.booking_id) AS bookingCount
              FROM users u
              JOIN bookings b ON u.user_id = b.user_id
              WHERE u.role != 'admin'
              GROUP BY u.user_id
              ORDER BY bookingCount DESC
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

function executePreparedQuery($con, $query, $params) {
    $stmt = mysqli_prepare($con, $query);
    if (!$stmt) {
        throw new Exception('Database error: ' . mysqli_error($con), 500);
    }
    mysqli_stmt_bind_param($stmt, str_repeat('s', count($params)), ...$params);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    if (!$result) {
        throw new Exception('Database error: ' . mysqli_error($con), 500);
    }
    $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
    mysqli_stmt_close($stmt);
    return $data;
}
?>