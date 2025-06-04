<?php

// This script creates a storage symlink for cPanel shared hosting
// where you might not have shell access to run "php artisan storage:link"

$targetFolder = __DIR__ . '/../storage/app/public';
$linkFolder = __DIR__ . '/storage';

// Check if the link already exists
if (file_exists($linkFolder)) {
    echo "Link already exists. Removing it first...<br>";
    
    // Check if it's a symlink or a directory
    if (is_link($linkFolder)) {
        unlink($linkFolder);
    } else {
        // It's a directory, use rmdir
        rmdir($linkFolder);
    }
}

// Create symlink
if (symlink($targetFolder, $linkFolder)) {
    echo "Storage link created successfully!<br>";
    echo "Target: " . $targetFolder . "<br>";
    echo "Link: " . $linkFolder . "<br>";
} else {
    echo "Failed to create storage link.<br>";
    echo "Error: " . error_get_last()['message'] . "<br>";
    
    // Fallback to directory copy if symlink fails
    echo "Trying fallback method (copying files)...<br>";
    
    // Create directory if it doesn't exist
    if (!file_exists($linkFolder)) {
        mkdir($linkFolder, 0755, true);
    }
    
    // Check if uploads directory exists in target
    $uploadsTarget = $targetFolder . '/uploads';
    $uploadsLink = $linkFolder . '/uploads';
    
    if (!file_exists($uploadsTarget)) {
        mkdir($uploadsTarget, 0755, true);
        echo "Created uploads directory in storage/app/public<br>";
    }
    
    // Create uploads directory in public/storage if it doesn't exist
    if (!file_exists($uploadsLink)) {
        mkdir($uploadsLink, 0755, true);
        echo "Created uploads directory in public/storage<br>";
    }
    
    echo "Fallback directory structure created. Note: This is not a real symlink, so you'll need to manually sync files.<br>";
}

// Check the result
if (file_exists($linkFolder)) {
    echo "Link verification: Link exists!<br>";
    
    // Check if it's a real symlink
    if (is_link($linkFolder)) {
        echo "It's a proper symbolic link.<br>";
    } else {
        echo "It's a regular directory (fallback method used).<br>";
    }
} else {
    echo "Link verification failed: The link doesn't exist.<br>";
}

// Display info about the server
echo "<h3>Server Information</h3>";
echo "PHP Version: " . phpversion() . "<br>";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Filename: " . $_SERVER['SCRIPT_FILENAME'] . "<br>";
echo "Operating System: " . PHP_OS . "<br>";
echo "Symlink function available: " . (function_exists('symlink') ? 'Yes' : 'No') . "<br>"; 