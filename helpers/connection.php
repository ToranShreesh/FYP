<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');

$host = "localhost";
$user = "root";
$pass = "";
$db = "fyp";


$con = mysqli_connect($host, $user, $pass, $db);


if (!$con) {
    echo "Connection Failed";
    exit();
}
