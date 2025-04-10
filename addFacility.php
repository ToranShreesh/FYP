<?php
// Include database connection and helper files
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php';

header('Content-Type: application/json');

// Validate admin token
if (!isset($_POST['token'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Token is required',
    ]);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token);

if (!$isAdmin) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access',
    ]);
    exit();
}

// Validate required fields
if (!isset($_POST['name'], $_POST['description'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields',
    ]);
    exit();
}

$name = $_POST['name'];
$description = mysqli_real_escape_string($con, $_POST['description']);

// Placeholder for image URL
$imageUrl = '';

// Handle image upload (if any)
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageDir = './images/';

    if (!is_dir($imageDir)) {
        mkdir($imageDir, 0755, true);
    }

    $imageName = $_FILES['image']['name'];
    $tmpName = $_FILES['image']['tmp_name'];
    $fileExtension = strtolower(pathinfo($imageName, PATHINFO_EXTENSION));

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (!in_array($fileExtension, $allowedExtensions)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.',
        ]);
        exit();
    }

    $uniqueFileName = uniqid() . '_' . basename($imageName);
    $filePath = $imageDir . $uniqueFileName;

    if (move_uploaded_file($tmpName, $filePath)) {
        $imageUrl = $filePath;
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to upload image.',
        ]);
        exit();
    }
}

// Insert into database
$stmt = $con->prepare("INSERT INTO facilities (facility_name, description, facility_image_url) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $description, $imageUrl);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Facility added successfully',
        'facility_id' => $stmt->insert_id,
        'image_url' => $imageUrl,
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add facility',
    ]);
}

$stmt->close();
$con->close();
?>
