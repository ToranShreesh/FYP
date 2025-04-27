<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for React frontend
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

    $response = [
        'success' => true,
        'stats' => getDashboardStats($con),
        'bookings' => getRecentBookings($con)
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code($e->getCode() >= 400 ? $e->getCode() : 500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}

function getDashboardStats($con) {
    $currentDate = date('Y-m-d'); // Current date for active/upcoming bookings (2025-04-24)

    // Total Users
    $totalUsersQuery = "SELECT COUNT(*) AS count FROM users";
    $totalUsers = executeQuery($con, $totalUsersQuery)[0]['count'];

    // Total Room Types (distinct room classes)
    $roomTypesQuery = "SELECT COUNT(*) AS count FROM room_classes";
    $roomTypes = executeQuery($con, $roomTypesQuery)[0]['count'];

    // Total Bookings
    $totalBookingsQuery = "SELECT COUNT(*) AS count FROM bookings";
    $totalBookings = executeQuery($con, $totalBookingsQuery)[0]['count'];

    // Total Guests (users with role 'user')
    $totalGuestsQuery = "SELECT COUNT(*) AS count FROM users WHERE role = 'user'";
    $totalGuests = executeQuery($con, $totalGuestsQuery)[0]['count'];

    // Total Earnings (sum of booking_amount where payment is completed)
    $totalEarningsQuery = "SELECT SUM(b.booking_amount) AS amount 
                          FROM bookings b 
                          JOIN payments p ON b.booking_id = p.booking_id 
                          WHERE p.payment_status = 'Completed'";
    $totalEarningsResult = executeQuery($con, $totalEarningsQuery);
    $totalEarnings = $totalEarningsResult[0]['amount'] ?? 0;

    // Active Bookings (checkin_date <= today <= checkout_date, not cancelled)
    $activeBookingsQuery = "SELECT COUNT(*) AS count 
                           FROM bookings 
                           WHERE checkin_date <= ? 
                           AND checkout_date >= ? 
                           AND booking_status != 'Cancelled'";
    $activeBookings = executePreparedQuery($con, $activeBookingsQuery, [$currentDate, $currentDate])[0]['count'];

    // Upcoming Bookings (checkin_date > today, not cancelled)
    $upcomingBookingsQuery = "SELECT COUNT(*) AS count 
                             FROM bookings 
                             WHERE checkin_date > ? 
                             AND booking_status != 'Cancelled'";
    $upcomingBookings = executePreparedQuery($con, $upcomingBookingsQuery, [$currentDate])[0]['count'];

    // Completed Bookings
    $completedBookingsQuery = "SELECT COUNT(*) AS count 
                              FROM bookings 
                              WHERE booking_status = 'Completed'";
    $completedBookings = executeQuery($con, $completedBookingsQuery)[0]['count'];

    return [
        'totalUsers' => (int)$totalUsers,
        'roomTypes' => (int)$roomTypes,
        'totalBookings' => (int)$totalBookings,
        'totalGuests' => (int)$totalGuests,
        'totalEarnings' => (int)$totalEarnings,
        'activeBookings' => (int)$activeBookings,
        'upcomingBookings' => (int)$upcomingBookings,
        'completedBookings' => (int)$completedBookings
    ];
}

function getRecentBookings($con) {
    $query = "SELECT 
                ( b.booking_id) AS id, 
                b.booking_id AS booking_id, 
                u.full_name AS user, 
                rc.class_name AS property, 
                b.checkin_date AS date, 
                LOWER(b.booking_status) AS status 
              FROM bookings b
              JOIN users u ON b.user_id = u.user_id
              JOIN booking_rooms br ON b.booking_id = br.booking_id
              JOIN rooms r ON br.room_id = r.room_id
              JOIN room_classes rc ON r.room_class_id = rc.room_class_id
              GROUP BY b.booking_id
              ORDER BY b.booking_date DESC
              LIMIT 5";
    
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