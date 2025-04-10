<?php
include '../helpers/connection.php';

if (isset(
    $_POST['token'],
)) {

    $token = $_POST['token'];

    $sql = "delete from tokens where token='$token'";

    $result = mysqli_query($con, $sql);


    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to logout user',
        ]);
        exit();
    } else {

        echo json_encode([
            'success' => true,
            'message' => 'User logged out successfully',
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'token is required',
    ]);
}
