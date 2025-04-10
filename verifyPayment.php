<?php
include './helpers/connection.php';

$KHALTI_SECRET_KEY = 'b8e052b48a8942a6afbf955e765d585a';
$KHALTI_LOOKUP_URL = 'https://a.khalti.com/api/v2/epayment/lookup/';

if (!isset($_GET['pidx'])) {
    echo json_encode(['success' => false, 'message' => 'Payment index (pidx) is required']);
    exit();
}

$pidx = $_GET['pidx'];

// Initiate Khalti payments lookup
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $KHALTI_LOOKUP_URL);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['pidx' => $pidx]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Key $KHALTI_SECRET_KEY",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(['success' => false, 'message' => 'Verification failed: ' . curl_error($ch)]);
    curl_close($ch);
    exit();
}
curl_close($ch);

$paymentResult = json_decode($response, true);

// Check if payments is completed
if (isset($paymentResult['status']) && $paymentResult['status'] === 'Completed') {
    // Start a transaction to ensure data consistency
    $con->begin_transaction();

    try {
        // Find the booking_id associated with this pidx in the payments table
        $stmt = $con->prepare("SELECT booking_id FROM payments WHERE payment_idx = ?");
        $stmt->bind_param("s", $pidx);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('No payments record found for this pidx');
        }

        $row = $result->fetch_assoc();
        $bookingId = $row['booking_id'];

        // Update payments status in the payments table
        $updateStmt = $con->prepare("UPDATE payments SET payment_status = 'Completed' WHERE payment_idx = ?");
        $updateStmt->bind_param("s", $pidx);
        
        if (!$updateStmt->execute()) {
            throw new Exception('Failed to update payments status');
        }

        // Commit the transaction
        $con->commit();

        echo json_encode(['success' => true, 'message' => 'Payment verified successfully', 'booking_id' => $bookingId]);
    } catch (Exception $e) {
        // Rollback the transaction on error
        $con->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    } finally {
        // Only close statements if they are still open
        if (isset($stmt) && $stmt instanceof mysqli_stmt && !$stmt->errno) {
            $stmt->close();
        }
        if (isset($updateStmt) && $updateStmt instanceof mysqli_stmt && !$updateStmt->errno) {
            $updateStmt->close();
        }
        $con->close();
    }
} else {
    $status = $paymentResult['status'] ?? 'Unknown';
    $con->close();
    echo json_encode(['success' => false, 'message' => "Payment not completed. Status: $status"]);
}
?>