<?php
include './helpers/connection.php';
include './helpers/authHelper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/path/to/php_errors.log'); // Update to your log file path
error_reporting(E_ALL);

// Get token
if (!isset($_POST['token'])) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Token is required']);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token);

if (!$isAdmin) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Get action from $_POST
$action = isset($_POST['action']) ? $_POST['action'] : '';
error_log("Request method: $method, Action: $action, POST data: " . print_r($_POST, true));

// Fetch all facilities
if ($method === 'GET' || ($method === 'POST' && empty($action))) {
    error_log("Fetching all facilities");
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
    while ($row = $result->fetch_assoc()) {
        $facilities[] = $row;
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'facilities' => $facilities,
        'message' => empty($facilities) ? 'No facilities found' : null
    ]);

    $stmt->close();
} elseif ($method === 'POST') {
    if ($action === 'edit') {
        // Edit a facility
        $facility_id = isset($_POST['facility_id']) ? (int)$_POST['facility_id'] : 0;
        $facility_name = isset($_POST['facility_name']) ? trim($_POST['facility_name']) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $facility_image_url = isset($_POST['facility_image_url']) ? trim($_POST['facility_image_url']) : '';

        error_log("Edit action - facility_id: $facility_id, facility_name: $facility_name, description: $description, facility_image_url: $facility_image_url");

        if ($facility_id <= 0 || empty($facility_name)) {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Facility ID and name are required']);
            exit;
        }

        // Handle image upload
        if (!empty($_FILES['facility_image']['name'])) {
            $uploadDir = "uploads/";
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = basename($_FILES['facility_image']['name']);
            $filePath = $uploadDir . time() . '_' . $fileName;

            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($_FILES['facility_image']['type'], $allowedTypes)) {
                ob_clean();
                echo json_encode(['success' => false, 'message' => 'Invalid file type']);
                exit;
            }

            if (!move_uploaded_file($_FILES['facility_image']['tmp_name'], $filePath)) {
                ob_clean();
                echo json_encode(['success' => false, 'message' => 'Failed to upload image']);
                exit;
            }
            $facility_image_url = $filePath;
        }

        if (empty($facility_image_url)) {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Image URL or file is required']);
            exit;
        }

        $facility_image_url = ltrim($facility_image_url, './'); // Normalize path

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
        $stmt->execute();
        $affected_rows = $stmt->affected_rows;

        if ($affected_rows > 0) {
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Facility updated successfully']);
        } else {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'No facility updated: Invalid facility ID or no changes made']);
        }

        if ($stmt->error) {
           
        }
        $stmt->close();
    } elseif ($action === 'delete') {
        // Delete a facility
        $facility_id = isset($_POST['facility_id']) ? (int)$_POST['facility_id'] : 0;

        error_log("Delete action - facility_id: $facility_id");

        if ($facility_id <= 0) {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Invalid facility ID']);
            exit;
        }

        // Delete image file
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

        // Delete facility
        $query = "DELETE FROM facilities WHERE facility_id = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param('i', $facility_id);

        if ($stmt->execute()) {
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Facility deleted successfully']);
        } else {
            ob_clean();
            echo json_encode(['success' => false, 'message' => 'Failed to delete facility']);
        }

        if ($stmt->error) {
            
        }
        $stmt->close();
    } else {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
    }
} else {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

$con->close();
?>