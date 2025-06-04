<?php

/**
 * This script creates symbolic links for the placeholder image in all necessary locations
 * to ensure that it's available everywhere it's needed.
 */

// Define paths
$baseDir = __DIR__ . '/..';
$publicImagesDir = __DIR__ . '/images';
$publicUploadsDir = __DIR__ . '/uploads';
$storagePublicUploadsDir = $baseDir . '/storage/app/public/uploads';

// Ensure directories exist
if (!file_exists($publicImagesDir)) {
    mkdir($publicImagesDir, 0755, true);
    echo "Created directory: {$publicImagesDir}\n";
}

if (!file_exists($publicUploadsDir)) {
    mkdir($publicUploadsDir, 0755, true);
    echo "Created directory: {$publicUploadsDir}\n";
}

if (!file_exists($storagePublicUploadsDir)) {
    mkdir($storagePublicUploadsDir, 0755, true);
    echo "Created directory: {$storagePublicUploadsDir}\n";
}

// Source file - we'll use the one in public/images as the source of truth
$sourceFile = $publicImagesDir . '/placeholder.jpg';

// Check if source file exists
if (!file_exists($sourceFile)) {
    echo "Source file not found: {$sourceFile}\n";
    exit(1);
}

// Create symbolic links or copy the file
$targetFiles = [
    $publicUploadsDir . '/placeholder.jpg',
    $storagePublicUploadsDir . '/placeholder.jpg',
];

foreach ($targetFiles as $targetFile) {
    if (file_exists($targetFile)) {
        unlink($targetFile);
        echo "Removed existing file: {$targetFile}\n";
    }
    
    // Try to create a symbolic link first
    if (@symlink($sourceFile, $targetFile)) {
        echo "Created symbolic link: {$targetFile} -> {$sourceFile}\n";
    } else {
        // If symlink fails, copy the file
        if (copy($sourceFile, $targetFile)) {
            echo "Copied file: {$sourceFile} -> {$targetFile}\n";
        } else {
            echo "Failed to create link or copy file: {$targetFile}\n";
        }
    }
}

echo "Done!\n"; 