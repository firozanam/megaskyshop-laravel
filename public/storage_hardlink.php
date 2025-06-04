<?php

// This script creates a hardlink/copy solution for cPanel shared hosting
// where symlinks might not be allowed due to security restrictions

// Use absolute paths based on document root
$docRoot = $_SERVER['DOCUMENT_ROOT'] ?? __DIR__;
// Fix the storage path - the current path shows it's in /home/newsquar/storage instead of /home/newsquar/megaskyshop.com/storage
$targetDir = dirname($docRoot) . '/megaskyshop.com/storage/app/public';
// Try alternative paths if the above doesn't exist
if (!is_dir($targetDir)) {
    $targetDir = $docRoot . '/storage/app/public';
}
if (!is_dir($targetDir)) {
    $targetDir = dirname($docRoot) . '/storage/app/public';
}

$publicDir = $docRoot . '/storage';

echo "<h1>Storage Hard Link/Copy Solution</h1>";
echo "<p>Using document root: $docRoot</p>";

// Create the public storage directory if it doesn't exist
if (!file_exists($publicDir)) {
    if (mkdir($publicDir, 0755, true)) {
        echo "<p>Created storage directory in public folder</p>";
    } else {
        echo "<p style='color:red'>Failed to create storage directory</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
        exit;
    }
}

// Create the uploads directory in the target location
if (!file_exists($targetDir)) {
    if (mkdir($targetDir, 0755, true)) {
        echo "<p>Created storage app/public directory</p>";
    } else {
        echo "<p style='color:red'>Failed to create storage app/public directory</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
    }
}

// Create the uploads directory in the target location
if (!file_exists($targetDir . '/uploads')) {
    if (mkdir($targetDir . '/uploads', 0755, true)) {
        echo "<p>Created uploads directory in storage/app/public</p>";
    } else {
        echo "<p style='color:red'>Failed to create uploads directory in storage/app/public</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
    }
}

// Create the uploads directory in public storage if it doesn't exist
if (!file_exists($publicDir . '/uploads')) {
    if (mkdir($publicDir . '/uploads', 0755, true)) {
        echo "<p>Created uploads directory in public/storage</p>";
    } else {
        echo "<p style='color:red'>Failed to create uploads directory in public/storage</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
    }
}

// Check permissions and ownership
echo "<h2>Directory Permissions</h2>";
if (function_exists('posix_getpwuid')) {
    $targetOwner = posix_getpwuid(fileowner($targetDir));
    $publicOwner = posix_getpwuid(fileowner($publicDir));
    echo "<p>Target directory owner: " . ($targetOwner['name'] ?? 'Unknown') . "</p>";
    echo "<p>Public directory owner: " . ($publicOwner['name'] ?? 'Unknown') . "</p>";
}
echo "<p>Target directory permissions: " . substr(sprintf('%o', fileperms($targetDir)), -4) . "</p>";
echo "<p>Public directory permissions: " . substr(sprintf('%o', fileperms($publicDir)), -4) . "</p>";

// Function to copy files from source to destination
function syncDirectory($source, $destination) {
    if (!is_dir($source)) {
        echo "<p style='color:red'>Source directory doesn't exist: $source</p>";
        return false;
    }
    
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    $dir = opendir($source);
    $count = 0;
    
    while (($file = readdir($dir)) !== false) {
        if ($file != '.' && $file != '..') {
            $sourceFile = $source . '/' . $file;
            $destFile = $destination . '/' . $file;
            
            if (is_dir($sourceFile)) {
                // Recursively sync subdirectories
                $subCount = syncDirectory($sourceFile, $destFile);
                if (is_numeric($subCount)) {
                    $count += $subCount;
                }
            } else {
                // Copy the file if it doesn't exist or is different
                if (!file_exists($destFile) || md5_file($sourceFile) !== md5_file($destFile)) {
                    echo "<p>Attempting to copy: " . basename($sourceFile) . " to " . $destFile . "</p>";
                    
                    if (copy($sourceFile, $destFile)) {
                        chmod($destFile, 0644); // Set proper permissions
                        $count++;
                        echo "<p style='color:green'>Successfully copied: " . basename($sourceFile) . "</p>";
                    } else {
                        echo "<p style='color:red'>Failed to copy: " . basename($sourceFile) . "</p>";
                        echo "<p>Error: " . error_get_last()['message'] . "</p>";
                        
                        // Try alternative copy method
                        echo "<p>Trying alternative copy method...</p>";
                        $content = file_get_contents($sourceFile);
                        if ($content !== false && file_put_contents($destFile, $content)) {
                            chmod($destFile, 0644);
                            $count++;
                            echo "<p style='color:green'>Alternative copy method succeeded for: " . basename($sourceFile) . "</p>";
                        } else {
                            echo "<p style='color:red'>Alternative copy method also failed</p>";
                        }
                    }
                }
            }
        }
    }
    
    closedir($dir);
    return $count;
}

// Sync the uploads directory
echo "<h2>Synchronizing Files</h2>";
echo "<p>From: $targetDir</p>";
echo "<p>To: $publicDir</p>";

$filesCopied = syncDirectory($targetDir, $publicDir);
echo "<p style='font-weight:bold'>Files synchronized: " . ($filesCopied === false ? 'Error' : $filesCopied) . "</p>";

// Create a .htaccess file in the public/storage directory to prevent execution of PHP files
$htaccessContent = "# Prevent execution of PHP files\n" .
                 "<FilesMatch \"\.(php|phtml|php3|php4|php5|php7)$\">\n" .
                 "  Require all denied\n" .
                 "</FilesMatch>\n\n" .
                 "# Allow access to image and document files\n" .
                 "<FilesMatch \"\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|txt|svg|webp)$\">\n" .
                 "  Require all granted\n" .
                 "</FilesMatch>";

file_put_contents($publicDir . '/.htaccess', $htaccessContent);
echo "<p>Created .htaccess file for security</p>";

// Create a README file to explain the directory's purpose
$readmeContent = "This directory contains copies of files from storage/app/public\n" .
               "It is maintained by the storage_hardlink.php script\n" .
               "DO NOT MODIFY FILES DIRECTLY IN THIS DIRECTORY";
file_put_contents($publicDir . '/README.txt', $readmeContent);

// Manual fix for missing uploads folder - create it and fix permissions
if (!is_dir($publicDir . '/uploads')) {
    echo "<p>Creating uploads directory in public storage folder...</p>";
    mkdir($publicDir . '/uploads', 0755, true);
}

// Create a sample image file directly in the public/storage/uploads folder
$sampleImageFile = $publicDir . '/uploads/placeholder.jpg';
$sampleImageUrl = '';

if (!file_exists($sampleImageFile)) {
    echo "<p>Creating a placeholder image file...</p>";
    
    // Simple 1x1 pixel transparent GIF
    $transparentGif = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    
    if (file_put_contents($sampleImageFile, $transparentGif)) {
        chmod($sampleImageFile, 0644);
        echo "<p style='color:green'>Created placeholder image in public/storage/uploads</p>";
        
        // Output URL to placeholder
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
        $sampleImageUrl = $baseUrl . '/storage/uploads/placeholder.jpg';
        
        echo "<p>Placeholder image URL: <a href='$sampleImageUrl' target='_blank'>$sampleImageUrl</a></p>";
    } else {
        echo "<p style='color:red'>Failed to create placeholder image</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
    }
}

// Add a note about scheduling
echo "<div style='margin-top: 20px; padding: 10px; background-color: #ffffcc; border: 1px solid #ffcc00;'>";
echo "<h3>Important Note:</h3>";
echo "<p>Since this is not a real symbolic link, you'll need to run this script regularly to sync new files.</p>";
echo "<p>You can set up a cPanel cron job to run this script daily using this command:</p>";
echo "<code>php " . $_SERVER['DOCUMENT_ROOT'] . "/storage_hardlink.php</code>";
echo "<p>Or set up a cron job with curl:</p>";
echo "<code>curl -s " . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/storage_hardlink.php") . " > /dev/null</code>";
echo "</div>";

// Display server information
echo "<h2>Server Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $docRoot . "</p>";
echo "<p>Script Path: " . __FILE__ . "</p>";
echo "<p>Storage Path (app/public): " . $targetDir . "</p>";
echo "<p>Public Storage Path: " . $publicDir . "</p>";
echo "<p>OS: " . PHP_OS . "</p>";
echo "<p>PHP safe mode: " . (ini_get('safe_mode') ? 'On' : 'Off') . "</p>";
echo "<p>Open basedir: " . ini_get('open_basedir') . "</p>";

// Test file creation to check permissions
$testFile = $targetDir . '/uploads/test_file.txt';
if (file_put_contents($testFile, 'This is a test file to check write permissions. Created at: ' . date('Y-m-d H:i:s'))) {
    echo "<p style='color:green'>Successfully created test file in storage/app/public/uploads</p>";
    
    // Copy it to public/storage to test the copy functionality
    if (copy($testFile, $publicDir . '/uploads/test_file.txt')) {
        echo "<p style='color:green'>Successfully copied test file to public/storage/uploads</p>";
        
        // Output URL to test file
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
        $testUrl = $baseUrl . '/storage/uploads/test_file.txt';
        
        echo "<p>Test file URL: <a href='$testUrl' target='_blank'>$testUrl</a></p>";
    } else {
        echo "<p style='color:red'>Failed to copy test file to public/storage/uploads</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
        
        // Try alternative copy method
        $content = file_get_contents($testFile);
        if ($content !== false && file_put_contents($publicDir . '/uploads/test_file.txt', $content)) {
            echo "<p style='color:green'>Alternative copy method succeeded for test file</p>";
            
            $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
            $testUrl = $baseUrl . '/storage/uploads/test_file.txt';
            
            echo "<p>Test file URL: <a href='$testUrl' target='_blank'>$testUrl</a></p>";
        }
    }
} else {
    echo "<p style='color:red'>Failed to create test file in storage/app/public/uploads. Check permissions.</p>";
    echo "<p>Error: " . error_get_last()['message'] . "</p>";
}

// List all files in the uploads directory
echo "<h2>Files in Storage/Uploads</h2>";
if (is_dir($targetDir . '/uploads')) {
    $files = scandir($targetDir . '/uploads');
    if (count($files) > 2) { // More than . and ..
        echo "<ul>";
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                echo "<li>$file</li>";
            }
        }
        echo "</ul>";
    } else {
        echo "<p>No files found in uploads directory.</p>";
    }
} else {
    echo "<p>Uploads directory does not exist.</p>";
} 