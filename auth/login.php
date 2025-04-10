<?php
include '../helpers/connection.php';



if (isset(
    $_POST['email'],
    $_POST['password']
)) {

    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "select * from users where email='$email'";

    $result = mysqli_query($con, $sql);

    $count = mysqli_num_rows($result);



    if ($count === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found!',
        ]);
        exit();
    }

    $user = mysqli_fetch_assoc($result);
    $hashedPassword = $user['password'];
    $user_id = $user['user_id'];

    $isPasswordCorrect = password_verify($password, $hashedPassword);

    if (!$isPasswordCorrect) {
        echo json_encode([
            'success' => false,
            'message' => 'Incorrect password!',
        ]);
        exit();
    }

    $token = random_bytes(32);
    $token = bin2hex($token);

    $sql = "insert into tokens (token, user_id) values('$token', '$user_id')";

    $result = mysqli_query($con, $sql);


    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to login',
        ]);
        exit();
    } else {

        echo json_encode([
            'success' => true,
            'message' => 'User logged in successfully',
            'token' => $token,
            'role' => $user['role'],
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'email, and password are required',
    ]);
}
