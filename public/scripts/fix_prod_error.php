<?php

// IMPORTANT: DELETE THIS FILE IMMEDIATELY AFTER USE!
// Access this script via your browser: https://megaskyshop.com/scripts/fix_prod_error.php

echo "<pre>"; // For readable output in the browser

// Define the base path of the Laravel application
// This script is in public/scripts, so Laravel root is ../../
$basePath = __DIR__ . '/../../';

// Function to execute Artisan commands
function runArtisanCommand($command, $basePath) {
    $phpExecutable = 'php'; // Or specify full path if known, e.g., /usr/bin/php
    $artisanPath = escapeshellarg($basePath . 'artisan');
    $fullCommand = escapeshellcmd($phpExecutable . ' ' . $artisanPath . ' ' . $command);

    echo "Running: $fullCommand\n";
    // Try to prevent timeouts for longer commands if possible, though server limits apply
    // @set_time_limit(300); // 5 minutes, might not be allowed

    $output = shell_exec($fullCommand . ' --no-interaction --quiet 2>&1');

    if ($output === null) {
        echo "Output: Command may have failed to execute (null output). Check server error logs for PHP errors or if shell_exec is disabled/restricted.\n\n";
    } elseif (trim($output) === '') {
        echo "Output: Command executed. (No specific output, often means success for clear commands with --quiet).\n\n";
    }
     else {
        echo "Output:\n$output\n\n";
    }
    return $output;
}

// --- Step 1: Check and create directories ---
$pathsToEnsure = [
    'storage/framework/views',
    'storage/framework/cache/data', // For file cache driver
    'storage/framework/sessions',
    'storage/logs',
    'storage/app/public', // Often used with storage:link
    'bootstrap/cache',    // For compiled services, packages, config cache
];

echo "--- Ensuring directories exist and are writable ---\n";
foreach ($pathsToEnsure as $relativePath) {
    $path = $basePath . $relativePath;
    $parentDir = dirname($path);

    // Ensure parent directory exists first
    if (!is_dir($parentDir)) {
        echo "Attempting to create parent directory: $parentDir\n";
        if (mkdir($parentDir, 0775, true)) {
            echo "Parent directory created: $parentDir\n";
        } else {
            // Check again, might have been created by a concurrent process or mkdir might return false if it already exists (race condition)
            if (!is_dir($parentDir)){
                echo "ERROR: Failed to create parent directory: $parentDir. Check permissions of its parent.\n";
                // continue; // Optionally skip this path if parent can't be made
            }
        }
    }

    // Now ensure the target directory exists
    if (!is_dir($path)) {
        echo "Attempting to create directory: $path\n";
        if (mkdir($path, 0775, true)) {
            echo "Directory created: $path\n";
        } else {
            if (!is_dir($path)) { // Double check if it was created despite returning false
                 echo "ERROR: Failed to create directory: $path. Check permissions of parent: " . dirname($path) . "\n";
                 continue; // Skip to next path if creation fails
            }
        }
    } else {
        echo "Directory exists: $path\n";
    }

    // Attempt to make the directory writable if it exists
    if (is_dir($path)) {
        if (!is_writable($path)) {
            echo "Attempting to make directory writable: $path\n";
            if (chmod($path, 0775)) { // Common permissions, adjust if needed for your server
                echo "Permissions set to 0775 for: $path\n";
            } else {
                echo "WARNING: Failed to set 0775 permissions for: $path. Manual intervention might be needed for writability.\n";
            }
        } else {
            echo "Directory is writable: $path\n";
        }
    } else {
        // This case should ideally not be reached if creation logic above is sound
        echo "WARNING: Directory $path reported as not existing after creation attempt. Check for issues.\n";
    }
}
echo "\n";

// --- Step 2: Clear Caches using Artisan --- 
// Crucial for fixing incorrect path issues from dev environment
echo "--- Clearing Laravel Caches (this may take a moment) ---\n";

// Run config:clear first as it's most likely to hold incorrect absolute paths
runArtisanCommand('config:clear', $basePath);

// Then clear other caches that might depend on config
runArtisanCommand('view:clear', $basePath);
runArtisanCommand('cache:clear', $basePath);
runArtisanCommand('route:clear', $basePath);
// runArtisanCommand('event:clear', $basePath); // Uncomment if you use event caching
// runArtisanCommand('optimize:clear', $basePath); // To clear any compiled optimized files (config, route, view, events)

echo "--- Cache clearing attempts finished. ---\n\n";

// --- Step 3: Additional checks ---
echo "--- Verifying .env file presence ---\n";
$envPath = $basePath . '.env';
if (file_exists($envPath)) {
    echo ".env file exists at: $envPath\n";
    if (is_readable($envPath)) {
        echo ".env file is readable.\n";
    } else {
        echo "WARNING: .env file exists but is NOT readable by the script. This is a critical issue for Laravel to function.\n";
    }
} else {
    echo "CRITICAL ERROR: .env file does NOT exist at: $envPath. Laravel will not work correctly.\n";
}
echo "\n";

echo "--- Checking storage link (if applicable) ---\n";
$publicStoragePath = $basePath . 'public/storage';
if (is_link($publicStoragePath)) {
    echo "Symbolic link public/storage exists.\n";
    $linkTarget = readlink($publicStoragePath);
    echo "It points to: " . $linkTarget . "\n";
    
    $expectedTargetResolved = realpath($basePath . 'storage/app/public');
    $linkTargetResolved = realpath($publicStoragePath); 

    if ($linkTargetResolved && $expectedTargetResolved && $linkTargetResolved === $expectedTargetResolved) {
        echo "Symbolic link target appears correct and accessible.\n";
    } else {
        echo "WARNING: Symbolic link public/storage may not be pointing correctly, its target is inaccessible, or realpath failed.\n";
        echo "Expected target should resolve to: " . ($expectedTargetResolved ?: $basePath . 'storage/app/public (could not resolve)') . "\n";
        echo "If you use public disk and files are missing, this might be why. Consider 'php artisan storage:link' when you have terminal access.\n";
    }
} else {
    echo "Symbolic link public/storage does not exist. If you use the 'public' disk for file uploads/access, run 'php artisan storage:link' when you have terminal access.\n";
}
echo "\n";

echo "--- Script finished --- \n";
echo "Access your site (e.g., https://megaskyshop.com/) to see if the issue is resolved.\n";
echo "IMPORTANT: Remember to DELETE THIS SCRIPT from your server immediately!\n";
echo "Path: " . __FILE__ . "\n";
echo "</pre>";

?>
