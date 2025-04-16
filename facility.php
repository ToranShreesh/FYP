<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Check for token in $_POST or JSON body
$data = json_decode(file_get_contents('php://input'), true);
$token = isset($_POST['token']) ? $_POST['token'] : (isset($data['token']) ? $data['token'] : null);

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$isAdmin = isAdmin($token);

if (!$isAdmin) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' || ($method === 'POST' && empty($data['action']))) {
    // Get all facilities
    $query = "
        SELECT 
            facility_id,
            facility_name,
            description,
            facility_image_url
        FROM 
            facilities
        ORDER BY 
            facility_id
    ";

    $stmt = $con->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $facilities = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $facilities[] = $row;
        }
        echo json_encode(['success' => true, 'facilities' => $facilities]);
    } else {
        echo json_encode(['success' => true, 'facilities' => [], 'message' => 'No facilities found']);
    }

    $stmt->close();
} elseif ($method === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : (isset($data['action']) ? $data['action'] : '');

    error_log("Received POST data: " . print_r($_POST, true));
    error_log("Received JSON data: " . print_r($data, true));

    if ($action === 'edit') {
        // Edit a facility
        $facility_id = isset($_POST['facility_id']) ? (int)$_POST['facility_id'] : (isset($data['facility_id']) ? (int)$data['facility_id'] : 0);
        $facility_name = isset($_POST['facility_name']) ? trim($_POST['facility_name']) : (isset($data['facility_name']) ? trim($data['facility_name']) : '');
        $description = isset($_POST['description']) ? trim($_POST['description']) : (isset($data['description']) ? trim($data['description']) : '');
        $facility_image_url = isset($_POST['facility_image_url']) ? trim($_POST['facility_image_url']) : (isset($data['facility_image_url']) ? trim($data['facility_image_url']) : '');

        if ($facility_id <= 0 || empty($facility_name) || empty($description)) {
            echo json_encode(['success' => false, 'message' => 'Missing or invalid parameters']);
            exit;
        }

        // Handle image upload if provided
        if (!empty($_FILES['facility_image']['name'])) {
            $uploadDir = "uploads/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = basename($_FILES['facility_image']['name']);
            $filePath = $uploadDir . time() . '_' . $fileName;

            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($_FILES['facility_image']['type'], $allowedTypes)) {
                echo json_encode(['success' => false, 'message' => 'Invalid file type']);
                exit();
            }

            if (move_uploaded_file($_FILES['facility_image']['tmp_name'], $filePath)) {
                $facility_image_url = $filePath; // Update the image URL with the new file path
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
                exit();
            }
        }

        if (empty($facility_image_url)) {
            echo json_encode(['success' => false, 'message' => 'Image URL or file is required']);
            exit;
        }

        $query = "
            UPDATE facilities 
            SET 
                facility_name = ?, 
                description = ?, 
                facility_image_url = ?
            WHERE 
                facility_id = ?
        ";

        $stmt = $con->prepare($query);
        $stmt->bind_param('sssi', $facility_name, $description, $facility_image_url, $facility_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Facility updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update facility']);
        }

        $stmt->close();
    } elseif ($action === 'delete') {
        // Delete a facility
        $facility_id = isset($_POST['facility_id']) ? (int)$_POST['facility_id'] : (isset($data['facility_id']) ? (int)$data['facility_id'] : 0);

        if ($facility_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid facility ID']);
            exit;
        }

        // Optionally delete the image file from the server
        $query = "SELECT facility_image_url FROM facilities WHERE facility_id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param('i', $facility_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $imagePath = $row['facility_image_url'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        $stmt->close();

        $query = "DELETE FROM facilities WHERE facility_id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param('i', $facility_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Facility deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete facility']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$con->close();
?>