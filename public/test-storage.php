<?php

$storage_path = __DIR__ . '/storage/uploads/placeholder.jpg';
$public_url = '/storage/uploads/placeholder.jpg';

echo "<h1>Storage Access Test</h1>";
echo "<p>Testing file access to: $public_url</p>";

if (file_exists($storage_path)) {
    echo "<p style='color:green'>File exists at: $storage_path</p>";
    echo "<p>File size: " . filesize($storage_path) . " bytes</p>";
    echo "<p>File permissions: " . substr(sprintf('%o', fileperms($storage_path)), -4) . "</p>";
    echo "<p>File readable: " . (is_readable($storage_path) ? 'Yes' : 'No') . "</p>";
    
    // Display the image directly
    echo "<p>Direct file output:</p>";
    echo "<img src='$public_url' alt='Placeholder' style='max-width:300px;border:1px solid #ccc;'>";
} else {
    echo "<p style='color:red'>File does not exist at: $storage_path</p>";
    
    // Check if the directory exists
    $dir = dirname($storage_path);
    if (!file_exists($dir)) {
        echo "<p style='color:red'>Directory does not exist: $dir</p>";
    } else {
        echo "<p style='color:green'>Directory exists: $dir</p>";
        echo "<p>Directory contents:</p><pre>";
        print_r(scandir($dir));
        echo "</pre>";
    }
}

// Check symlink
$symlink_source = __DIR__ . '/storage';
$symlink_target = realpath($symlink_source);
echo "<p>Symlink check:</p>";
echo "<p>Source: $symlink_source</p>";
echo "<p>Target: $symlink_target</p>";
echo "<p>Is symlink: " . (is_link($symlink_source) ? 'Yes' : 'No') . "</p>";

// phpinfo for debugging
echo "<h2>Server Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Script Filename: " . $_SERVER['SCRIPT_FILENAME'] . "</p>"; 