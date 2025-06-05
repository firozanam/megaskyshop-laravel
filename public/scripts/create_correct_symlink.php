<?php
/**
 * Create Correct Laravel Storage Symlink
 *
 * This script attempts to create the correct symbolic link for Laravel's public storage.
 * It links storage/app/public to public/storage.
 */

echo "<pre>";

// IMPORTANT: Determine the project root path assuming this script is in public/scripts/
$projectRoot = realpath(dirname(__FILE__) . '/../../');

if (!$projectRoot) {
    echo "Error: Could not determine project root. Ensure this script is in 'public/scripts/'.\n";
    exit;
}

echo "Project Root determined as: " . htmlspecialchars($projectRoot) . "\n";

$linkPath = $projectRoot . '/public/storage';
$targetPath = $projectRoot . '/storage/app/public';

echo "Target (actual files location): " . htmlspecialchars($targetPath) . "\n";
echo "Link Name (publicly accessible path): " . htmlspecialchars($linkPath) . "\n\n";

// Check if the target directory exists
if (!is_dir($targetPath)) {
    echo "Error: Target directory does not exist: " . htmlspecialchars($targetPath) . "\n";
    echo "Please ensure this path is correct and the directory exists before creating a symlink.\n";
    // Attempt to create it if it's a common case like storage/app/public missing
    if (basename($targetPath) === 'public' && basename(dirname($targetPath)) === 'app' && basename(dirname(dirname($targetPath))) === 'storage') {
        echo "Attempting to create directory: " . htmlspecialchars($targetPath) . "\n";
        if (!mkdir($targetPath, 0775, true)) {
            echo "Failed to create target directory: " . htmlspecialchars($targetPath) . "\n";
        } else {
            echo "Successfully created target directory: " . htmlspecialchars($targetPath) . "\n";
        }
    } else {
        exit;
    }
}

// Check if something already exists at the link path
if (file_exists($linkPath) || is_link($linkPath)) {
    echo "An item (file, directory, or symlink) already exists at: " . htmlspecialchars($linkPath) . "\n";
    echo "Attempting to remove it...\n";
    
    if (is_link($linkPath)) {
        if (unlink($linkPath)) {
            echo "Successfully removed existing symlink.\n";
        } else {
            echo "Error: Failed to remove existing symlink. Check permissions.\n";
            exit;
        }
    } elseif (is_dir($linkPath)) {
        // It's a directory, attempt to remove if it's empty or use rmdir for safety
        // For simplicity, this script will only try to remove it if it's a symlink.
        // If it's a directory, manual intervention might be needed or a more complex script.
        echo "Error: A directory (not a symlink) exists at the link path. Please remove it manually if it's safe to do so: " . htmlspecialchars($linkPath) . "\n";
        exit;
    } else {
        if (unlink($linkPath)) {
            echo "Successfully removed existing file.\n";
        } else {
            echo "Error: Failed to remove existing file. Check permissions.\n";
            exit;
        }
    }
}

// Attempt to create the symlink
echo "\nAttempting to create symbolic link...\n";
if (function_exists('symlink')) {
    if (symlink($targetPath, $linkPath)) {
        echo "SUCCESS: Symbolic link created successfully!\n";
        echo htmlspecialchars($linkPath) . " ---> " . htmlspecialchars($targetPath) . "\n";
    } else {
        echo "Error: Failed to create symbolic link. Possible reasons:\n";
        echo "  - PHP's symlink() function might be disabled by hosting provider (even if function_exists is true).\n";
        echo "  - Incorrect permissions on the parent directory ('public') to create a link.\n";
        echo "  - The target path might not be accessible or valid from the web server's perspective.\n";
    }
} else {
    echo "Error: PHP's symlink() function does not exist. Cannot create symbolic link.\n";
}

echo "\n--- Script finished ---\n";
echo "Please test if your images/files are now accessible via the '/storage/' URL.";
echo "IMPORTANT: Remember to DELETE THIS SCRIPT from your server immediately!";
echo "Path: " . htmlspecialchars($projectRoot . '/public/scripts/' . basename(__FILE__)) . "\n";
echo "</pre>";

?>
