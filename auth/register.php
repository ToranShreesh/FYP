<?php
include '../helpers/connection.php';

if (isset(
    $_POST['name'],
    $_POST['email'],
    $_POST['password']
)) {

    $email = $_POST['email'];
    $name = $_POST['name'];
    $password = $_POST['password'];

    $sql = "select * from users where email='$email'";

    $result = mysqli_query($con, $sql);

    $count = mysqli_num_rows($result);



    if ($count > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already exists',
        ]);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);


    $sql = "insert into users (full_name, email, password,role) values('$name', '$email', '$hashedPassword', 'user')";

    $result = mysqli_query($con, $sql);


    if (!$result) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to register user',
        ]);
        exit();
    } else {

        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'name, email, and password are required',
    ]);
}
