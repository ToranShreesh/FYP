<?php
include './helpers/connection.php';

// Ensure PHPMailer is installed via Composer or included manually
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Adjust path if PHPMailer is installed via Composer

$KHALTI_SECRET_KEY = 'b8e052b48a8942a6afbf955e765d585a';
$KHALTI_LOOKUP_URL = 'https://a.khalti.com/api/v2/epayment/lookup/';

if (!isset($_GET['pidx'])) {
    echo json_encode(['success' => false, 'message' => 'Payment index (pidx) is required']);
    exit();
}

$pidx = $_GET['pidx'];

// Log the request for debugging with timestamp
error_log("[" . date('Y-m-d H:i:s') . "] Processing pidx: $pidx", 3, "payment.log");

// Start a transaction to lock the payment record
$con->begin_transaction();

try {
    // Lock the payment record to prevent concurrent processing
    $stmt = $con->prepare("
        SELECT payment_status, booking_id 
        FROM payments 
        WHERE payment_idx = ? 
        FOR UPDATE
    ");
    $stmt->bind_param("s", $pidx);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if ($row['payment_status'] === 'Completed') {
            echo json_encode(['success' => true, 'message' => 'Payment already verified', 'booking_id' => $row['booking_id']]);
            $con->commit();
            $stmt->close();
            $con->close();
            exit();
        } elseif ($row['payment_status'] === 'Cancelled') {
            echo json_encode(['success' => false, 'message' => 'Payment already cancelled', 'booking_id' => $row['booking_id']]);
            $con->commit();
            $stmt->close();
            $con->close();
            exit();
        }
        $bookingId = $row['booking_id'];
    } else {
        throw new Exception('No payment record found for this pidx');
    }
    $stmt->close();

    // Initiate Khalti payment lookup
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
        throw new Exception('Verification failed: ' . curl_error($ch));
    }
    curl_close($ch);

    $paymentResult = json_decode($response, true);

    // Check payment status
    if (isset($paymentResult['status'])) {
        if ($paymentResult['status'] === 'Completed') {
            $stmt = $con->prepare("
                SELECT p.booking_id, p.amount, u.email, u.full_name
                FROM payments p
                JOIN bookings b ON p.booking_id = b.booking_id
                JOIN users u ON b.user_id = u.user_id
                WHERE p.payment_idx = ?
            ");
            if (!$stmt) {
                throw new Exception('Failed to prepare select statement');
            }
            $stmt->bind_param("s", $pidx);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                throw new Exception('No payment record found for this pidx');
            }

            $row = $result->fetch_assoc();
            $bookingId = $row['booking_id'];
            $paymentAmount = $row['amount'];
            $userEmail = $row['email'];
            $userName = $row['full_name'] ?? 'Customer';

            error_log("[" . date('Y-m-d H:i:s') . "] Sending email to: $userEmail for booking ID: $bookingId", 3, "email.log");

            // Update payment status to Completed
            $updateStmt = $con->prepare("UPDATE payments SET payment_status = 'Completed' WHERE payment_idx = ?");
            if (!$updateStmt) {
                throw new Exception('Failed to prepare payment update statement');
            }
            $updateStmt->bind_param("s", $pidx);
            
            if (!$updateStmt->execute()) {
                throw new Exception('Failed to update payment status');
            }

            // Update booking status to Confirmed
            $bookingStmt = $con->prepare("UPDATE bookings SET booking_status = 'Completed' WHERE booking_id = ?");
            if (!$bookingStmt) {
                throw new Exception('Failed to prepare booking update statement');
            }
            $bookingStmt->bind_param("i", $bookingId);
            
            if (!$bookingStmt->execute()) {
                throw new Exception('Failed to update booking status');
            }

            $con->commit();

            $mail = new PHPMailer(true);
            try {
                $mail->SMTPDebug = 2;
                $mail->Debugoutput = function($str, $level) {
                    error_log("[" . date('Y-m-d H:i:s') . "] SMTP Debug level $level: $str", 3, "smtp_debug.log");
                };
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'nabinshreesh195@gmail.com';
                $mail->Password = 'eirt xqtd yvkv bddt';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                $mail->Port = 465;

                $mail->setFrom('nabinshreesh195@gmail.com', 'Hotel Booking');
                $mail->addAddress($userEmail, $userName);

                $mail->isHTML(true);
                $mail->Subject = 'Payment Confirmation - Booking ID: ' . $bookingId;
                $mail->Body = '
                    <h2>Payment Confirmation</h2>
                    <p>Dear ' . htmlspecialchars($userName) . ',</p>
                    <p>Your payment for the booking has been successfully completed.</p>
                    <h3>Payment Details:</h3>
                    <ul>
                        <li><strong>Booking ID:</strong> ' . $bookingId . '</li>
                        <li><strong>Payment Amount:</strong> NPR ' . number_format($paymentAmount, 2) . '</li>
                        <li><strong>Payment Status:</strong> Completed</li>
                        <li><strong>Transaction ID (pidx):</strong> ' . htmlspecialchars($pidx) . '</li>
                    </ul>
                    <p>Thank you for choosing our services. If you have any questions, please contact us at support@hotelbooking.com.</p>
                    <p>Best regards,<br>Hotel Booking Team</p>
                ';
                $mail->AltBody = "
                    Payment Confirmation\n\n
                    Dear " . $userName . ",\n
                    Your payment for the booking has been successfully completed.\n\n
                    Payment Details:\n
                    - Booking ID: " . $bookingId . "\n
                    - Payment Amount: NPR " . number_format($paymentAmount, 2) . "\n
                    - Payment Status: Completed\n
                    - Transaction ID (pidx): " . $pidx . "\n\n
                    Thank you for choosing our services. If you have any questions, please contact us at support@hotelbooking.com.\n\n
                    Best regards,\n
                    Hotel Booking Team
                ";

                $mail->send();
               
            } catch (Exception $e) {
               
            }

            echo json_encode([
                'success' => true,
                'message' => 'Payment verified successfully',
                'booking_id' => $bookingId
            ]);
        } elseif ($paymentResult['status'] === 'Canceled' || $paymentResult['status'] === 'User canceled') {
            // Handle canceled payment
            // Delete booking_rooms records
            $deleteStmt = $con->prepare("DELETE FROM booking_rooms WHERE booking_id = ?");
            if (!$deleteStmt) {
                throw new Exception('Failed to prepare booking_rooms delete statement');
            }
            $deleteStmt->bind_param("i", $bookingId);
            
            if (!$deleteStmt->execute()) {
                throw new Exception('Failed to delete booking_rooms records');
            }

            // Update payment status to Cancelled
            $updateStmt = $con->prepare("UPDATE payments SET payment_status = 'Cancelled' WHERE payment_idx = ?");
            if (!$updateStmt) {
                throw new Exception('Failed to prepare payment update statement');
            }
            $updateStmt->bind_param("s", $pidx);
            
            if (!$updateStmt->execute()) {
                throw new Exception('Failed to update payment status');
            }

            // Update booking status to Cancelled
            $bookingStmt = $con->prepare("UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?");
            if (!$bookingStmt) {
                throw new Exception('Failed to prepare booking update statement');
            }
            $bookingStmt->bind_param("i", $bookingId);
            
            if (!$bookingStmt->execute()) {
                throw new Exception('Failed to update booking status');
            }

            $con->commit();

            echo json_encode([
                'success' => false,
                'message' => 'Payment was cancelled by the user',
                'booking_id' => $bookingId
            ]);
        } else {
            $status = $paymentResult['status'] ?? 'Unknown';
            echo json_encode(['success' => false, 'message' => "Payment not completed. Status: $status"]);
        }
    } else {
        throw new Exception('Invalid response from Khalti API');
    }
} catch (Exception $e) {
    $con->rollback();
    
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        try {
            $stmt->close();
        } catch (Exception $e) {
            
        }
    }
    if (isset($updateStmt) && $updateStmt instanceof mysqli_stmt) {
        try {
            $updateStmt->close();
        } catch (Exception $e) {
            
        }
    }
    if (isset($bookingStmt) && $bookingStmt instanceof mysqli_stmt) {
        try {
            $bookingStmt->close();
        } catch (Exception $e) {
           
        }
    }
    if (isset($deleteStmt) && $deleteStmt instanceof mysqli_stmt) {
        try {
            $deleteStmt->close();
        } catch (Exception $e) {
            
        }
    }
    if ($con instanceof mysqli && !$con->connect_error) {
        $con->close();
    }
}
?>