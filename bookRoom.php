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
if (!isset($_POST['room_class_id'], $_POST['num_rooms'], $_POST['checkin_date'], $_POST['checkout_date'], $_POST['booking_amount'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

$roomClassId = $_POST['room_class_id'];
$numRooms = intval($_POST['num_rooms']);
$checkinDate = $_POST['checkin_date'];
$checkoutDate = $_POST['checkout_date'];
$bookingAmount = floatval($_POST['booking_amount']);
$bookingDate = date('Y-m-d');
$bookingStatus = 'Pending';

// Validate date range
$today = date('Y-m-d');
if ($checkinDate < $today || $checkoutDate <= $checkinDate) {
    echo json_encode(['success' => false, 'message' => 'Invalid date range']);
    exit();
}

// Khalti configuration
$KHALTI_SECRET_KEY = 'b8e052b48a8942a6afbf955e765d585a';
$KHALTI_API_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
$RETURN_URL = 'http://localhost:3000/payment-success';
$WEBSITE_URL = 'http://localhost:3000';

// Start transaction
$con->begin_transaction();

try {
    // Insert booking record
    $stmt = $con->prepare("INSERT INTO bookings (user_id, booking_date, checkin_date, checkout_date, booking_amount, booking_status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssds", $userId, $bookingDate, $checkinDate, $checkoutDate, $bookingAmount, $bookingStatus);

    if (!$stmt->execute()) {
        throw new Exception('Failed to create booking');
    }

    $bookingId = $stmt->insert_id;

    // Check available rooms for the date range (only enabled rooms)
    $roomQuery = $con->prepare("
        SELECT r.room_id 
        FROM rooms r
        WHERE r.room_class_id = ? 
        AND r.is_enabled = 1
        AND r.room_id NOT IN (
            SELECT br.room_id 
            FROM booking_rooms br
            JOIN bookings b ON br.booking_id = b.booking_id
            WHERE b.booking_status != 'Cancelled'
            AND (
                (b.checkin_date <= ? AND b.checkout_date > ?)
                OR (b.checkin_date < ? AND b.checkout_date >= ?)
                OR (b.checkin_date >= ? AND b.checkout_date <= ?)
            )
        )
        LIMIT ?
    ");
    $roomQuery->bind_param("issssssi", 
        $roomClassId, 
        $checkoutDate, 
        $checkinDate, 
        $checkoutDate, 
        $checkinDate, 
        $checkinDate, 
        $checkoutDate, 
        $numRooms
    );
    $roomQuery->execute();
    $roomResult = $roomQuery->get_result();

    if ($roomResult->num_rows < $numRooms) {
        $errorMsg = $roomResult->num_rows === 0 
            ? "No rooms available. All rooms may be booked or under maintenance."
            : "Not enough available rooms. Only " . $roomResult->num_rows . " rooms available.";
        throw new Exception($errorMsg);
    }

    // Insert selected rooms into booking_rooms table
    $insertRoom = $con->prepare("INSERT INTO booking_rooms (booking_id, room_id) VALUES (?, ?)");
    while ($room = $roomResult->fetch_assoc()) {
        $roomId = $room['room_id'];
        $insertRoom->bind_param("ii", $bookingId, $roomId);
        if (!$insertRoom->execute()) {
            throw new Exception('Failed to assign room to booking');
        }
    }

    // Initiate Khalti payment
    $paymentData = [
        'return_url' => $RETURN_URL,
        'website_url' => $WEBSITE_URL,
        'amount' => $bookingAmount * 100,
        'purchase_order_id' => "booking-$bookingId",
        'purchase_order_name' => 'Room Booking',
        'customer_info' => [
            'name' => 'Customer Name',
            'email' => 'customer@example.com',
            'phone' => '9800000000',
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $KHALTI_API_URL);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Key $KHALTI_SECRET_KEY",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        throw new Exception('Failed to initiate payment: ' . curl_error($ch));
    }
    curl_close($ch);

    $paymentResult = json_decode($response, true);

    if (!isset($paymentResult['payment_url'])) {
        throw new Exception('Payment initiation failed: ' . ($paymentResult['message'] ?? 'Unknown error'));
    }

    // Insert into payment table
    $paymentStmt = $con->prepare("
        INSERT INTO payments (
            booking_id, 
            payment_idx, 
            payment_status, 
            amount, 
            payment_date
        ) VALUES (?, ?, ?, ?, NOW())
    ");
    $paymentIdx = $paymentResult['pidx'] ?? "booking-$bookingId";
    $paymentStatus = 'Pending';
    $paymentStmt->bind_param("issd", $bookingId, $paymentIdx, $paymentStatus, $bookingAmount);

    if (!$paymentStmt->execute()) {
        throw new Exception('Failed to record payment details');
    }

    // Commit transaction
    $con->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Booking created, redirecting to payment...',
        'booking_id' => $bookingId,
        'booking_status' => 'Pending',
        'payment_url' => $paymentResult['payment_url']
    ]);
} catch (Exception $e) {
    $con->rollback();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close statements safely
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        try {
            $stmt->close();
        } catch (Exception $e) {
            
        }
    }
    if (isset($roomQuery) && $roomQuery instanceof mysqli_stmt) {
        try {
            $roomQuery->close();
        } catch (Exception $e) {
            
        }
    }
    if (isset($insertRoom) && $insertRoom instanceof mysqli_stmt) {
        try {
            $insertRoom->close();
        } catch (Exception $e) {
           
        }
    }
    if (isset($paymentStmt) && $paymentStmt instanceof mysqli_stmt) {
        try {
            $paymentStmt->close();
        } catch (Exception $e) {
            
        }
    }
    if ($con instanceof mysqli && !$con->connect_error) {
        $con->close();
    }
}
?>