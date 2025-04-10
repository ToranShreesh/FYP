<?php

function getUserIdFromToken($token)
{

    global $con;
    $sql = "select user_id from tokens where token='$token'";
    $result = mysqli_query($con, $sql);

    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify token',
        ]);
        exit();
    }

    $row = mysqli_fetch_assoc($result);

    if (!$row) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid token',
        ]);
        exit();
    }

    return $row['user_id'];
}


function isAdmin($token)
{
    $userId = getUserIdFromToken($token);

    global $con;

    $sql = "select * from users where user_id='$userId' and role='admin'";
    $result = mysqli_query($con, $sql);

    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify token',
        ]);
        exit();
    }

    $row = mysqli_fetch_assoc($result);

    if (!$row) {
        return false;
    } else {
        return true;
    }
}
