<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

// Validate token
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
if (!isset($_POST['khalti_token'], $_POST['amount'], $_POST['booking_id'])) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit();
}

$khaltiToken = $_POST['khalti_token'];
$amount = $_POST['amount'];
$bookingId = $_POST['booking_id'];

// Start transaction
$con->begin_transaction();

try {
    // Insert payment record
    $stmt = $con->prepare("INSERT INTO payments (booking_id, user_id, khalti_token, amount, payment_status) VALUES (?, ?, ?, ?, ?)");
    $paymentStatus = 'completed'; // Assuming payment is successful for now

    $stmt->bind_param("iisis", $bookingId, $userId, $khaltiToken, $amount, $paymentStatus);

    if (!$stmt->execute()) {
        throw new Exception('Failed to save payment');
    }

    $stmt->close();

    // Update booking status to 'paid'
    $updateBookingStmt = $con->prepare("UPDATE bookings SET payment_status = 'paid' WHERE booking_id = ?");
    $updateBookingStmt->bind_param("i", $bookingId);
    if (!$updateBookingStmt->execute()) {
        throw new Exception('Failed to update booking payment status');
    }

    // Commit transaction
    $con->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Payment saved successfully'
    ]);
} catch (Exception $e) {
    // Rollback transaction in case of error
    $con->rollback();

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($updateBookingStmt)) $updateBookingStmt->close();
}
?>
