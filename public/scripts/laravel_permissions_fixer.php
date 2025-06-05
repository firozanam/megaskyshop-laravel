<?php
/**
 * Laravel Permission Fix Script for cPanel Shared Hosting
 * 
 * This script fixes file and directory permissions for Laravel applications
 * running on cPanel shared hosting environments where terminal access is limited.
 * 
 * Usage: Upload this script to your public directory and access it via browser.
 */

// Set execution time limit to 300 seconds (5 minutes)
set_time_limit(300);

// Start output buffering
ob_start();

// Define the base directory (Laravel root)
$baseDir = dirname(__DIR__);

// Define permission constants
define('DIR_PERMISSION', 0755);  // Directories: rwxr-xr-x
define('FILE_PERMISSION', 0644); // Files: rw-r--r--
define('STORAGE_DIR_PERMISSION', 0775); // Storage directories: rwxrwxr-x
define('STORAGE_FILE_PERMISSION', 0664); // Storage files: rw-rw-r--

// Define directories that need special permissions
$storageDirs = [
    'storage/app',
    'storage/app/public',
    'storage/app/public/uploads',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'bootstrap/cache',
];

// Define directories to skip
$skipDirs = [
    'vendor',
    'node_modules',
    '.git',
];

// Define writable directories that should be checked/created
$writableDirs = [
    'storage/app/public/uploads',
    'public/uploads',
    'public/images',
    'public/storage',
];

// HTML header
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Permission Fix</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3 {
            color: #2d3748;
        }
        .success {
            color: #38a169;
            background-color: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 8px 12px;
            margin: 8px 0;
        }
        .warning {
            color: #d69e2e;
            background-color: #fffaf0;
            border-left: 4px solid #d69e2e;
            padding: 8px 12px;
            margin: 8px 0;
        }
        .error {
            color: #e53e3e;
            background-color: #fff5f5;
            border-left: 4px solid #e53e3e;
            padding: 8px 12px;
            margin: 8px 0;
        }
        .info {
            color: #3182ce;
            background-color: #ebf8ff;
            border-left: 4px solid #3182ce;
            padding: 8px 12px;
            margin: 8px 0;
        }
        code {
            background-color: #f7fafc;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        }
        pre {
            background-color: #f7fafc;
            padding: 12px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .progress-container {
            width: 100%;
            background-color: #e2e8f0;
            border-radius: 5px;
            margin: 10px 0;
        }
        .progress-bar {
            height: 20px;
            background-color: #4299e1;
            border-radius: 5px;
            width: 0%;
            transition: width 0.3s;
        }
    </style>
</head>
<body>
    <h1>Laravel Permission Fix for cPanel Shared Hosting</h1>
    <div class="progress-container">
        <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div id="log">
        <div class="info">Starting permission fix process...</div>
';

// Flush output
flush();

// Create writable directories if they don't exist
echo '<h2>Creating Required Directories</h2>';
foreach ($writableDirs as $dir) {
    $fullPath = $baseDir . '/' . $dir;
    if (!file_exists($fullPath)) {
        if (mkdir($fullPath, STORAGE_DIR_PERMISSION, true)) {
            echo "<div class='success'>Created directory: {$dir}</div>";
        } else {
            echo "<div class='error'>Failed to create directory: {$dir}</div>";
        }
    } else {
        echo "<div class='info'>Directory already exists: {$dir}</div>";
    }
    flush();
}

// Fix storage directory permissions
echo '<h2>Fixing Storage Directory Permissions</h2>';
foreach ($storageDirs as $dir) {
    $fullPath = $baseDir . '/' . $dir;
    if (file_exists($fullPath)) {
        if (chmod($fullPath, STORAGE_DIR_PERMISSION)) {
            echo "<div class='success'>Set permissions for {$dir} to " . decoct(STORAGE_DIR_PERMISSION) . "</div>";
        } else {
            echo "<div class='error'>Failed to set permissions for {$dir}</div>";
        }
    } else {
        if (mkdir($fullPath, STORAGE_DIR_PERMISSION, true)) {
            echo "<div class='success'>Created directory with correct permissions: {$dir}</div>";
        } else {
            echo "<div class='error'>Failed to create directory: {$dir}</div>";
        }
    }
    flush();
}

// Function to recursively fix permissions
function fixPermissions($dir, $baseLen) {
    global $skipDirs, $baseDir;
    
    $items = scandir($dir);
    $totalItems = count($items) - 2; // Subtract . and ..
    $processedItems = 0;
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        
        $path = $dir . '/' . $item;
        $relativePath = substr($path, $baseLen);
        
        // Skip specified directories
        foreach ($skipDirs as $skipDir) {
            if (strpos($relativePath, $skipDir) === 0) {
                echo "<div class='info'>Skipping: {$relativePath}</div>";
                flush();
                continue 2;
            }
        }
        
        if (is_dir($path)) {
            // Check if it's a storage directory
            $isStorageDir = strpos($relativePath, 'storage/') === 0 || strpos($relativePath, 'bootstrap/cache') === 0;
            $permission = $isStorageDir ? STORAGE_DIR_PERMISSION : DIR_PERMISSION;
            
            if (chmod($path, $permission)) {
                echo "<div class='success'>Set directory permissions: {$relativePath} to " . decoct($permission) . "</div>";
            } else {
                echo "<div class='warning'>Failed to set directory permissions: {$relativePath}</div>";
            }
            
            // Recursively fix permissions in subdirectories
            fixPermissions($path, $baseLen);
        } else {
            // Check if it's a storage file
            $isStorageFile = strpos($relativePath, 'storage/') === 0;
            $permission = $isStorageFile ? STORAGE_FILE_PERMISSION : FILE_PERMISSION;
            
            if (chmod($path, $permission)) {
                echo "<div class='success'>Set file permissions: {$relativePath} to " . decoct($permission) . "</div>";
            } else {
                echo "<div class='warning'>Failed to set file permissions: {$relativePath}</div>";
            }
        }
        
        $processedItems++;
        $progress = ($processedItems / $totalItems) * 100;
        echo "<script>document.getElementById('progress-bar').style.width = '{$progress}%';</script>";
        flush();
    }
}

// Fix permissions for the entire Laravel application
echo '<h2>Fixing Application Permissions</h2>';
fixPermissions($baseDir, strlen($baseDir) + 1);

// Create .htaccess file for storage directory
$storageHtaccess = $baseDir . '/storage/.htaccess';
$htaccessContent = "# Deny access to all files in this directory
<FilesMatch \".*\">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Allow access to the public directory
<FilesMatch \"^public/.*\">
    Order Allow,Deny
    Allow from all
</FilesMatch>";

if (file_put_contents($storageHtaccess, $htaccessContent)) {
    echo "<div class='success'>Created .htaccess file for storage directory</div>";
} else {
    echo "<div class='error'>Failed to create .htaccess file for storage directory</div>";
}

// Create .htaccess file for public/uploads directory
$uploadsDir = $baseDir . '/public/uploads';
if (file_exists($uploadsDir)) {
    $uploadsHtaccess = $uploadsDir . '/.htaccess';
    $uploadsHtaccessContent = "# Allow access to image and document files
<FilesMatch \"\\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|svg)$\">
    Require all granted
</FilesMatch>

# Prevent execution of PHP files
<FilesMatch \"\\.(php|phtml|php3|php4|php5|php7)$\">
    Require all denied
</FilesMatch>";

    if (file_put_contents($uploadsHtaccess, $uploadsHtaccessContent)) {
        echo "<div class='success'>Created .htaccess file for uploads directory</div>";
    } else {
        echo "<div class='error'>Failed to create .htaccess file for uploads directory</div>";
    }
}

// HTML footer
echo '
        <div class="success">Permission fix process completed!</div>
    </div>
    <h2>Server Information</h2>
    <pre>';
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Operating System: " . PHP_OS . "\n";
echo "Current User: " . get_current_user() . "\n";
echo "Current Working Directory: " . getcwd() . "\n";
echo "Base Directory: " . $baseDir . "\n";
echo '</pre>
    <h2>Next Steps</h2>
    <ol>
        <li>Run the <a href="../scripts/fix_storage_links.php">Storage Links Fix Script</a> to ensure proper storage links.</li>
        <li>Clear your Laravel application cache: <code>php artisan cache:clear</code></li>
        <li>Regenerate your application key if needed: <code>php artisan key:generate</code></li>
        <li>Delete this script after use for security.</li>
    </ol>
    <script>
        document.getElementById("progress-bar").style.width = "100%";
    </script>
</body>
</html>';

// End output buffering and flush
ob_end_flush(); 