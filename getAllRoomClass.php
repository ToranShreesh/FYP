<?php
include './helpers/connection.php'; // Ensure this initializes $con as your DB connection

// Fetch all columns from room_classes and images
$sql = "
    SELECT rc.*, 
           GROUP_CONCAT(i.image_id, '::', i.room_image_url SEPARATOR '|') AS images 
    FROM room_classes rc
    LEFT JOIN images i ON rc.room_class_id = i.room_class_id
    GROUP BY rc.room_class_id
";


$result = mysqli_query($con, $sql);

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => "Failed to fetch room classes: " . mysqli_error($con), // Debugging output
    ]);
    exit();
}

$roomClasses = [];
while ($row = mysqli_fetch_assoc($result)) {
    if ($row['images']) {
        $imagesArray = explode('|', $row['images']);
        $row['images'] = array_map(function ($image) {
            list($id, $src) = explode('::', $image);
            return ['id' => $id, 'src' => $src];
        }, $imagesArray);
    } else {
        $row['images'] = [];
    }
    $roomClasses[] = $row;
}


echo json_encode([
    'success' => true,
    'room_classes' => $roomClasses
], JSON_UNESCAPED_SLASHES);

?>
