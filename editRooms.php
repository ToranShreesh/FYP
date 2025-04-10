<?php
include './helpers/connection.php'; // Database connection
include './helpers/authHelper.php'; // Authentication helper

// Check if token is provided
if (!isset($_POST['token'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Token is required',
    ]);
    exit();
}

$token = $_POST['token'];
$isAdmin = isAdmin($token); // Check if the user is an admin

if (!$isAdmin) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access',
    ]);
    exit();
}

// Fetch all rooms with their associated room class details
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT r.room_id, rc.class_name, r.floor_number, r.room_number, r.is_enabled 
            FROM rooms r
            JOIN room_classes rc ON r.room_class_id = rc.room_class_id";

    $result = mysqli_query($con, $sql);

    if ($result) {
        $rooms = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rooms[] = $row;
        }

        echo json_encode([
            'success' => true,
            'rooms' => $rooms,
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch rooms',
        ]);
    }
    exit();
}

// Update room details with partial updates
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    if ($action === 'edit') {
        if (!isset($_POST['room_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID is required',
            ]);
            exit();
        }

        $roomId = $_POST['room_id'];
        $updates = [];

        if (isset($_POST['class_name'])) {
            $className = $_POST['class_name'];
            $getClassIdSql = "SELECT room_class_id FROM room_classes WHERE class_name = '$className'";
            $classResult = mysqli_query($con, $getClassIdSql);

            if (mysqli_num_rows($classResult) === 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid class_name. No such room class exists.',
                ]);
                exit();
            }

            $classRow = mysqli_fetch_assoc($classResult);
            $roomClassId = $classRow['room_class_id'];
            $updates[] = "room_class_id = '$roomClassId'";
        }
        if (isset($_POST['floor_number'])) {
            $floorNumber = $_POST['floor_number'];
            $updates[] = "floor_number = '$floorNumber'";
        }
        if (isset($_POST['room_number'])) {
            $roomNumber = $_POST['room_number'];
            $updates[] = "room_number = '$roomNumber'";
        }

        if (!empty($updates)) {
            $updateSql = "UPDATE rooms SET " . implode(", ", $updates) . " WHERE room_id = '$roomId'";
            $updateResult = mysqli_query($con, $updateSql);

            if ($updateResult) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Room updated successfully',
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to update room',
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No valid fields provided for update',
            ]);
        }
    }
    
    if ($action === 'delete') {
        if (!isset($_POST['room_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID is required',
            ]);
            exit();
        }
        
        $roomId = $_POST['room_id'];
        $deleteSql = "DELETE FROM rooms WHERE room_id = '$roomId'";
        $deleteResult = mysqli_query($con, $deleteSql);
        
        if ($deleteResult) {
            echo json_encode([
                'success' => true,
                'message' => 'Room deleted successfully',
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete room',
            ]);
        }
    }
    
    if ($action === 'disable' || $action === 'enable') {
        if (!isset($_POST['room_id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Room ID is required',
            ]);
            exit();
        }
    
        $roomId = $_POST['room_id'];
        $newStatus = ($action === 'disable') ? 0 : 1; // 0 for disable, 1 for enable
        $statusSql = "UPDATE rooms SET is_enabled = '$newStatus' WHERE room_id = '$roomId'";
        $statusResult = mysqli_query($con, $statusSql);
    
        if ($statusResult) {
            echo json_encode([
                'success' => true,
                'message' => "Room " . ($action === 'disable' ? "disabled" : "enabled") . " successfully",
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => "Failed to " . ($action === 'disable' ? "disable" : "enable") . " room",
            ]);
        }
        exit();
    }
}
?>
