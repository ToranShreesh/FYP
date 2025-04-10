<?php
// Include database connection and helper files
include './helpers/connection.php';
include './helpers/authHelper.php';

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

// Check if required fields are provided
if (
    isset(
        $_POST['class_name'],
        $_POST['base_price'],
        $_POST['description'],
        $_POST['amenities'],
        $_POST['occupancy'],
        $_POST['room_size'],
        $_POST['drinks'],
        $_POST['smoking'],
        $_POST['bed_type']
    )
) {
    // Retrieve POST data
    $className = $_POST['class_name'];
    $basePrice = $_POST['base_price'];
    $description = mysqli_real_escape_string($con, $_POST['description']);
    $amenities = $_POST['amenities']; // Keep as JSON string
    $occupancy = $_POST['occupancy'];
    $roomSize = $_POST['room_size'];
    $drinks = (int)$_POST['drinks']; // Ensure it's an integer
    $smoking = (int)$_POST['smoking']; // Ensure it's an integer
    $bedType = $_POST['bed_type'];

    // Insert room class details into the database
    $stmt = $con->prepare("INSERT INTO room_classes (class_name, base_price, description, amenities, occupancy, room_size, drinks, smoking, bed_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssiss", $className, $basePrice, $description, $amenities, $occupancy, $roomSize, $drinks, $smoking, $bedType);


    if (!$stmt->execute()) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add room class',
        ]);
        exit();
    }

    $roomClassId = $stmt->insert_id;
    $stmt->close();

    // Handle image uploads (if any)
    $uploadedImages = [];
    $failedImages = [];

    if (isset($_FILES['images'])) {
        $imageDir = './images/';

        if (!is_dir($imageDir)) {
            mkdir($imageDir, 0755, true);
        }

        $fileNames = $_FILES['images']['name'];
        $tmpNames = $_FILES['images']['tmp_name'];
        $fileErrors = $_FILES['images']['error'];

        if (is_array($fileNames)) {
            foreach ($fileNames as $key => $fileName) {
                processFileUpload($fileName, $tmpNames[$key], $fileErrors[$key], $imageDir, $roomClassId, $uploadedImages, $failedImages, $con);
            }
        } else {
            processFileUpload($fileNames, $tmpNames, $fileErrors, $imageDir, $roomClassId, $uploadedImages, $failedImages, $con);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Room class and images added successfully',
        'room_class_id' => $roomClassId,
        'uploaded_images' => $uploadedImages,
        'failed_images' => $failedImages,
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields',
    ]);
}

function processFileUpload($fileName, $tmpName, $fileError, $imageDir, $roomClassId, &$uploadedImages, &$failedImages, $con)
{
    if ($fileError !== UPLOAD_ERR_OK) {
        $failedImages[] = "$fileName (Error Code: $fileError)";
        return false;
    }

    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $allowedExtensions)) {
        $failedImages[] = "$fileName (Invalid File Type)";
        return false;
    }

    $uniqueFileName = uniqid() . '_' . basename($fileName);
    $filePath = $imageDir . $uniqueFileName;

    if (move_uploaded_file($tmpName, $filePath)) {
        $stmtImage = $con->prepare("INSERT INTO images (room_image_url, room_class_id) VALUES (?, ?)");
        $stmtImage->bind_param("si", $filePath, $roomClassId);

        if ($stmtImage->execute()) {
            $uploadedImages[] = $filePath;
        } else {
            $failedImages[] = $fileName;
        }
        $stmtImage->close();
    } else {
        $failedImages[] = $fileName;
    }
}
?>
