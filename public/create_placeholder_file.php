<?php
// Create a blank image
$width = 600;
$height = 400;
$image = imagecreatetruecolor($width, $height);

// Define colors
$bg_color = imagecolorallocate($image, 220, 220, 220); // Light gray background
$text_color = imagecolorallocate($image, 80, 80, 80);  // Dark gray text

// Fill the background
imagefill($image, 0, 0, $bg_color);

// Add text
$text = "Placeholder Image";
$font_size = 5;
$text_width = imagefontwidth($font_size) * strlen($text);
$text_height = imagefontheight($font_size);

// Center the text
$x = ($width - $text_width) / 2;
$y = ($height - $text_height) / 2;

// Add the text to the image
imagestring($image, $font_size, $x, $y, $text, $text_color);

// Define the path
$storage_path = __DIR__ . '/../storage/app/public/uploads/placeholder.jpg';

// Save the image to file
imagejpeg($image, $storage_path, 90);

// Free up memory
imagedestroy($image);

echo "Placeholder image created at: $storage_path"; 