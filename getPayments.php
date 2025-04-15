<?php
include './helpers/connection.php';
include './helpers/authHelper.php';


$query = "
    SELECT 
        p.payment_id,
        p.booking_id,
        p.payment_idx,
        p.payment_status,
        p.amount,
        p.payment_date,
        u.full_name,
        b.booking_date,
        b.checkin_date,
        b.checkout_date,
        b.booking_amount
    FROM 
        payments p
    INNER JOIN 
        bookings b ON p.booking_id = b.booking_id
    INNER JOIN 
        users u ON b.user_id = u.user_id
    ORDER BY 
        p.payment_date DESC
";

$stmt = $con->prepare($query);
$stmt->execute();
$result = $stmt->get_result();

$payments = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
    echo json_encode(['success' => true, 'payments' => $payments]);
} else {
    echo json_encode(['success' => true, 'payments' => [], 'message' => 'No payments found']);
}

$stmt->close();
$con->close();
?>