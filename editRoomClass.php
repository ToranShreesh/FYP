<?php
// Include database connection and helper files
include './helpers/connection.php';
include './helpers/authHelper.php';

if (!isset($_POST['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token);

if (!$isAdmin) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

if (!isset($_POST['room_class_name'])) {
    echo json_encode(['success' => false, 'message' => 'Room class name is required']);
    exit();
}

$roomClassName = $_POST['room_class_name'];

// Fetch room class ID
$query = $con->prepare("SELECT room_class_id FROM room_classes WHERE class_name = ?");
$query->bind_param("s", $roomClassName);
$query->execute();
$result = $query->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Room class not found']);
    exit();
}

$row = $result->fetch_assoc();
$roomClassId = $row['room_class_id'];
$query->close();

// UPDATE Room Class
$updateFields = [];
$params = [];
$paramTypes = "";

$fields = [
    'class_name' => 's',
    'base_price' => 'd',
    'description' => 's',
    'amenities' => 's',
    'occupancy' => 's',
    'room_size' => 'i',
    'drinks' => 'i',
    'smoking' => 'i',
    'bed_type' => 's'
];

foreach ($fields as $field => $type) {
    if (isset($_POST[$field])) {
        $value = $_POST[$field];
        
        if ($field === 'drinks' || $field === 'smoking') {
            $value = ($value === "Yes") ? 1 : 0;
        }
        
        $updateFields[] = "$field = ?";
        $params[] = $value;
        $paramTypes .= $type;
    }
}

if (!empty($updateFields)) {
    $query = "UPDATE room_classes SET " . implode(", ", $updateFields) . " WHERE room_class_id = ?";
    $params[] = $roomClassId;
    $paramTypes .= "i";

    $stmt = $con->prepare($query);
    $stmt->bind_param($paramTypes, ...$params);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Room class updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update room class']);
    }
    $stmt->close();
}

// Handle image upload
$uploadDir = "uploads/";
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!empty($_FILES['images']['name'][0])) {
    if (!isset($_FILES['images'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit();
    }
    
    foreach ($_FILES['images']['error'] as $key => $error) {
        if ($error !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'File upload error: ' . $error]);
            exit();
        }
    }
    
    foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
        if (!file_exists($tmpName)) {
            echo json_encode(['success' => false, 'message' => "Temp file does not exist: $tmpName"]);
            exit();
        }

        $fileName = basename($_FILES['images']['name'][$key]);
        $filePath = $uploadDir . $fileName;

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($_FILES['images']['type'][$key], $allowedTypes)) {
            echo json_encode(['success' => false, 'message' => 'Invalid file type']);
            exit();
        }

        if (move_uploaded_file($tmpName, $filePath)) {
            $stmt = $con->prepare("INSERT INTO images (room_class_id, room_image_url) VALUES (?, ?)");
            $stmt->bind_param("is", $roomClassId, $filePath);
            $stmt->execute();
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => "Failed to move file: $tmpName to $filePath"]);
            exit();
        }
    }
    echo json_encode(['success' => true, 'message' => 'Room class updated with images']);
}

// Handle removed images
if (isset($_POST['removed_images']) && is_array($_POST['removed_images'])) {
    foreach ($_POST['removed_images'] as $imageId) {
        $stmt = $con->prepare("SELECT room_image_url FROM images WHERE image_id = ? AND room_class_id = ?");
        $stmt->bind_param("ii", $imageId, $roomClassId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $imgRow = $result->fetch_assoc();
            $imgPath = $imgRow['room_image_url'];

            if (file_exists($imgPath)) {
                unlink($imgPath);
            }

            $deleteStmt = $con->prepare("DELETE FROM images WHERE image_id = ?");
            $deleteStmt->bind_param("i", $imageId);
            $deleteStmt->execute();
            $deleteStmt->close();
        }
        $stmt->close();
    }
}
?>