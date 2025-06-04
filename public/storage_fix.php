<?php

// This script creates a direct uploads folder in the public directory
// as an alternative solution to the storage symbolic link issue

// Use absolute paths based on document root
$docRoot = $_SERVER['DOCUMENT_ROOT'] ?? __DIR__;

// Try multiple possible storage locations
$possibleStoragePaths = [
    dirname($docRoot) . '/storage/app/public/uploads',
    dirname($docRoot) . '/megaskyshop.com/storage/app/public/uploads',
    $docRoot . '/storage/app/public/uploads',
    dirname($docRoot) . '/public_html/storage/app/public/uploads',
    dirname(dirname($docRoot)) . '/storage/app/public/uploads',
    // Add the home directory structure that we saw in the output
    '/home/newsquar/storage/app/public/uploads',
    '/home/newsquar/megaskyshop.com/storage/app/public/uploads',
];

$publicUploadsDir = $docRoot . '/uploads';

echo "<h1>Direct Public Uploads Solution</h1>";
echo "<p>Using document root: $docRoot</p>";

// Create the public uploads directory if it doesn't exist
if (!file_exists($publicUploadsDir)) {
    if (mkdir($publicUploadsDir, 0755, true)) {
        echo "<p style='color:green'>Created uploads directory in public folder</p>";
    } else {
        echo "<p style='color:red'>Failed to create uploads directory</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
        exit;
    }
}

// Create a placeholder image file
$placeholderFile = $publicUploadsDir . '/placeholder.jpg';
if (!file_exists($placeholderFile)) {
    // Base64 encoded 1x1 transparent pixel
    $transparentPixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    
    if (file_put_contents($placeholderFile, $transparentPixel)) {
        chmod($placeholderFile, 0644);
        echo "<p style='color:green'>Created placeholder image at $placeholderFile</p>";
    } else {
        echo "<p style='color:red'>Failed to create placeholder image</p>";
        echo "<p>Error: " . error_get_last()['message'] . "</p>";
    }
}

// Function to copy files from source to destination
function syncFiles($source, $destination) {
    if (!is_dir($source)) {
        echo "<p style='color:orange'>Source directory doesn't exist: $source</p>";
        return 0;
    }
    
    if (!is_dir($destination)) {
        mkdir($destination, 0755, true);
    }
    
    $count = 0;
    $files = scandir($source);
    
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            $sourceFile = $source . '/' . $file;
            $destFile = $destination . '/' . $file;
            
            if (is_file($sourceFile)) {
                echo "<p>Copying $file...</p>";
                
                if (copy($sourceFile, $destFile)) {
                    chmod($destFile, 0644);
                    $count++;
                    echo "<p style='color:green'>Successfully copied $file</p>";
                } else {
                    echo "<p style='color:red'>Failed to copy $file</p>";
                    echo "<p>Error: " . error_get_last()['message'] . "</p>";
                    
                    // Try alternative method
                    $content = file_get_contents($sourceFile);
                    if ($content !== false && file_put_contents($destFile, $content)) {
                        chmod($destFile, 0644);
                        $count++;
                        echo "<p style='color:green'>Alternative method: Successfully copied $file</p>";
                    }
                }
            }
        }
    }
    
    return $count;
}

// Try to find and copy files from all possible storage locations
echo "<h2>Searching for files in possible storage locations</h2>";
$totalFilesCopied = 0;

foreach ($possibleStoragePaths as $storageDir) {
    echo "<h3>Checking: $storageDir</h3>";
    
    if (is_dir($storageDir)) {
        echo "<p style='color:green'>Directory found!</p>";
        echo "<p>Copying files from: $storageDir</p>";
        echo "<p>To: $publicUploadsDir</p>";
        
        $filesCopied = syncFiles($storageDir, $publicUploadsDir);
        echo "<p>Files copied from this location: $filesCopied</p>";
        $totalFilesCopied += $filesCopied;
    } else {
        echo "<p style='color:orange'>Directory not found</p>";
    }
}

echo "<h2>Total files copied: $totalFilesCopied</h2>";

// Create placeholder files for images that appear to be missing based on the error logs
$missingFiles = [
    'ml3W4bN5UQczurJl606WeZD2SN3GjYoDOVaQY2m0.jpg',
    'xWBG4zOEUpgAIQ9AzjUfx3t7C1BBCN291nIBhksI.jpg',
    'W9zQ6CzWpmgeGLZPKoMzEN8cXi3Kp1FQxuftLEgh.webp',
    '85CYKXrfLzXHo2dH5e4ju5xezGzO9jGkUyXZV6qC.webp',
    'BmdpNVNzVdxatSdOt49NCzEnzdVeS3MbcRiHqUdc.jpg',
    'L0FsMLIvRnRHV0S0itqG4AjQRoKeasSouigD0eNR.jpg',
    'lYiIeeGQ31JVLhtWPqwxO3rD1LYKvZqtWvSRRXtD.webp'
];

echo "<h2>Creating placeholder images for missing files</h2>";
// Base64 encoded 1x1 transparent pixel
$transparentPixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

foreach ($missingFiles as $file) {
    $filePath = $publicUploadsDir . '/' . $file;
    if (!file_exists($filePath)) {
        echo "<p>Creating placeholder for: $file</p>";
        if (file_put_contents($filePath, $transparentPixel)) {
            chmod($filePath, 0644);
            echo "<p style='color:green'>Successfully created placeholder for $file</p>";
        } else {
            echo "<p style='color:red'>Failed to create placeholder for $file</p>";
        }
    } else {
        echo "<p>File already exists: $file</p>";
    }
}

// Create a .htaccess file in the public/uploads directory
$htaccessContent = "# Allow access to image and document files\n" .
                 "<FilesMatch \"\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|svg)$\">\n" .
                 "  Require all granted\n" .
                 "</FilesMatch>\n\n" .
                 "# Prevent execution of PHP files\n" .
                 "<FilesMatch \"\.(php|phtml|php3|php4|php5|php7)$\">\n" .
                 "  Require all denied\n" .
                 "</FilesMatch>";

file_put_contents($publicUploadsDir . '/.htaccess', $htaccessContent);
echo "<p>Created .htaccess file for security</p>";

// List all available files
echo "<h2>Files in public/uploads directory</h2>";
$files = scandir($publicUploadsDir);
if (count($files) > 2) {
    echo "<ul>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..' && $file != '.htaccess') {
            $fileUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . 
                       "://$_SERVER[HTTP_HOST]/uploads/$file";
            echo "<li><a href='$fileUrl' target='_blank'>$file</a></li>";
        }
    }
    echo "</ul>";
} else {
    echo "<p>No files found (except for system files)</p>";
}

// Instructions for database update
echo "<h2>Database Update</h2>";
echo "<p>You may need to update your database records to reflect the new image paths. Here's a sample SQL query:</p>";
echo "<pre>
UPDATE product_images 
SET image_path = REPLACE(image_path, 'uploads/', '')
WHERE image_path LIKE 'uploads/%';
</pre>";

// Instructions for Laravel config
echo "<h2>Laravel Configuration</h2>";
echo "<p>To make this solution work with your Laravel application, you may need to update your image URLs in the database.</p>";
echo "<p>You can add this URL prefix to your .env file:</p>";
echo "<pre>
APP_URL=https://$_SERVER[HTTP_HOST]
ASSET_URL=https://$_SERVER[HTTP_HOST]
</pre>";

echo "<p>And modify your config/filesystems.php to use the direct uploads path:</p>";
echo "<pre>
'public' => [
    'driver' => 'local',
    'root' => public_path('uploads'),
    'url' => env('APP_URL').'/uploads',
    'visibility' => 'public',
],
</pre>";

// Create a PHP fix script for future uploads
$fixScript = <<<'EOD'
<?php
// Fix script to automatically copy newly uploaded files to public/uploads
namespace App\Observers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class UploadsObserver
{
    public function created($model)
    {
        $this->syncUploads($model);
    }

    public function updated($model)
    {
        $this->syncUploads($model);
    }

    private function syncUploads($model)
    {
        // Only process models with image_path attribute
        if (!isset($model->image_path)) {
            return;
        }

        $imagePath = $model->image_path;
        
        // Check if this is an upload path
        if (strpos($imagePath, 'uploads/') === 0 || strpos($imagePath, 'uploads\\') === 0) {
            $filename = basename($imagePath);
            $sourcePath = storage_path('app/public/' . $imagePath);
            $targetPath = public_path('uploads/' . $filename);
            
            // Ensure the uploads directory exists
            if (!File::isDirectory(public_path('uploads'))) {
                File::makeDirectory(public_path('uploads'), 0755, true);
            }
            
            // Copy the file to public/uploads
            if (File::exists($sourcePath)) {
                try {
                    File::copy($sourcePath, $targetPath);
                    Log::info("Copied uploaded file to public directory: {$filename}");
                } catch (\Exception $e) {
                    Log::error("Failed to copy uploaded file: {$e->getMessage()}");
                }
            }
        }
    }
}
EOD;

$observerPath = $publicUploadsDir . '/UploadsObserver.php.txt';
file_put_contents($observerPath, $fixScript);
echo "<p>Created a sample observer script for future uploads. <a href='/uploads/UploadsObserver.php.txt' target='_blank'>View script</a></p>";

// Add note about cron job
echo "<div style='margin-top: 20px; padding: 10px; background-color: #ffffcc; border: 1px solid #ffcc00;'>";
echo "<h3>Automatic Synchronization</h3>";
echo "<p>Set up a cPanel cron job to run this script daily:</p>";
echo "<code>php " . $docRoot . "/storage_fix.php</code>";
echo "<p>Or with curl:</p>";
echo "<code>curl -s " . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/storage_fix.php") . " > /dev/null</code>";
echo "<p>Recommended cron schedule: 0 */6 * * * (every 6 hours)</p>";
echo "</div>";

// Server information
echo "<h2>Server Information</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $docRoot . "</p>";
echo "<p>Public Uploads Path: " . $publicUploadsDir . "</p>";

// Path check
echo "<h2>Directory Permission Check</h2>";
if (is_writable($publicUploadsDir)) {
    echo "<p style='color:green'>The uploads directory is writable</p>";
} else {
    echo "<p style='color:red'>The uploads directory is not writable</p>";
}

// File check for one of the missing files
foreach ($missingFiles as $file) {
    $filePath = $publicUploadsDir . '/' . $file;
    if (file_exists($filePath)) {
        echo "<p style='color:green'>Successfully created: $file</p>";
        echo "<p>File URL: <a href='/uploads/$file' target='_blank'>/uploads/$file</a></p>";
    }
} 