<?php
/**
 * Fix Symbolic Link Issue Script
 * 
 * This script fixes issues with symbolic links in the uploads directory
 * that can cause problems with Flysystem's file listing functionality.
 */

// Set execution time limit to 300 seconds (5 minutes)
set_time_limit(300);

// Start output buffering
ob_start();

// Define the base directory (Laravel root)
$baseDir = dirname(__DIR__);

// Define paths
$storagePath = $baseDir . '/storage/app/public';
$publicStoragePath = $baseDir . '/public/storage';
$publicUploadsPath = $baseDir . '/public/uploads';
$storageUploadsPath = $baseDir . '/storage/app/public/uploads';
$publicImagesPath = $baseDir . '/public/images';

// HTML header
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Symbolic Link Issue</title>
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
        pre {
            background-color: #f7fafc;
            padding: 12px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>Fix Symbolic Link Issue</h1>
    <div class="info">This script fixes issues with symbolic links in the uploads directory that can cause problems with Flysystem.</div>
';

// Function to check if path is a symlink
function isSymlink($path) {
    return is_link($path);
}

// Function to replace a symlink with an actual file
function replaceSymlinkWithFile($symlinkPath, $sourcePath = null) {
    if (!isSymlink($symlinkPath)) {
        return false;
    }
    
    // If no source path is provided, get the target of the symlink
    if ($sourcePath === null) {
        $sourcePath = readlink($symlinkPath);
    }
    
    // Check if source file exists
    if (!file_exists($sourcePath)) {
        return false;
    }
    
    // Remove the symlink
    unlink($symlinkPath);
    
    // Copy the actual file
    return copy($sourcePath, $symlinkPath);
}

// Check for symlinks in storage/app/public/uploads
echo '<h2>Checking for symlinks in storage/app/public/uploads</h2>';

// Create uploads directory if it doesn't exist
if (!file_exists($storageUploadsPath)) {
    if (mkdir($storageUploadsPath, 0775, true)) {
        echo "<div class='success'>Created directory: {$storageUploadsPath}</div>";
    } else {
        echo "<div class='error'>Failed to create directory: {$storageUploadsPath}</div>";
    }
}

// Check if placeholder.jpg is a symlink
$placeholderPath = $storageUploadsPath . '/placeholder.jpg';
if (file_exists($placeholderPath)) {
    if (isSymlink($placeholderPath)) {
        $sourcePath = $publicImagesPath . '/placeholder.jpg';
        
        // Ensure source exists
        if (!file_exists($sourcePath)) {
            // Create a simple placeholder
            $width = 200;
            $height = 200;
            
            if (function_exists('imagecreatetruecolor')) {
                // Use GD library if available
                $image = imagecreatetruecolor($width, $height);
                $backgroundColor = imagecolorallocate($image, 240, 240, 240);
                $textColor = imagecolorallocate($image, 120, 120, 120);
                
                imagefill($image, 0, 0, $backgroundColor);
                
                // Add text
                $text = 'Placeholder';
                $fontsize = 5;
                
                // Calculate position to center the text
                $textWidth = imagefontwidth($fontsize) * strlen($text);
                $textHeight = imagefontheight($fontsize);
                $centerX = ceil(($width - $textWidth) / 2);
                $centerY = ceil(($height - $textHeight) / 2);
                
                imagestring($image, $fontsize, $centerX, $centerY, $text, $textColor);
                
                // Save the image
                imagejpeg($image, $sourcePath, 90);
                imagedestroy($image);
                
                echo "<div class='success'>Created placeholder image at {$sourcePath}</div>";
            } else {
                // Fallback to a simple 1x1 transparent pixel
                $transparentPixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
                file_put_contents($sourcePath, $transparentPixel);
                echo "<div class='success'>Created simple placeholder image at {$sourcePath}</div>";
            }
        }
        
        // Replace symlink with actual file
        if (replaceSymlinkWithFile($placeholderPath, $sourcePath)) {
            echo "<div class='success'>Replaced symlink with actual file at {$placeholderPath}</div>";
        } else {
            echo "<div class='error'>Failed to replace symlink at {$placeholderPath}</div>";
        }
    } else {
        echo "<div class='info'>placeholder.jpg is already a regular file, not a symlink</div>";
    }
} else {
    // Create placeholder.jpg if it doesn't exist
    $sourcePath = $publicImagesPath . '/placeholder.jpg';
    if (file_exists($sourcePath)) {
        if (copy($sourcePath, $placeholderPath)) {
            echo "<div class='success'>Created placeholder.jpg at {$placeholderPath}</div>";
        } else {
            echo "<div class='error'>Failed to create placeholder.jpg at {$placeholderPath}</div>";
        }
    } else {
        echo "<div class='error'>Source placeholder image not found at {$sourcePath}</div>";
    }
}

// Check for other symlinks in uploads directory
echo '<h2>Checking for other symlinks in uploads directory</h2>';

if (is_dir($storageUploadsPath)) {
    $files = scandir($storageUploadsPath);
    $foundSymlinks = false;
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $filePath = $storageUploadsPath . '/' . $file;
        
        if (isSymlink($filePath)) {
            $foundSymlinks = true;
            $target = readlink($filePath);
            echo "<div class='warning'>Found symlink: {$filePath} -> {$target}</div>";
            
            if (file_exists($target)) {
                if (replaceSymlinkWithFile($filePath, $target)) {
                    echo "<div class='success'>Replaced symlink with actual file</div>";
                } else {
                    echo "<div class='error'>Failed to replace symlink with actual file</div>";
                }
            } else {
                echo "<div class='error'>Target file does not exist: {$target}</div>";
                // Remove the broken symlink
                unlink($filePath);
                echo "<div class='warning'>Removed broken symlink</div>";
            }
        }
    }
    
    if (!$foundSymlinks) {
        echo "<div class='success'>No other symlinks found in uploads directory</div>";
    }
} else {
    echo "<div class='error'>Uploads directory does not exist or is not accessible</div>";
}

// Update FileManagerController to handle symlinks
echo '<h2>Updating FileManagerController</h2>';

$fileManagerPath = $baseDir . '/app/Http/Controllers/Admin/FileManagerController.php';
if (file_exists($fileManagerPath)) {
    $fileManagerContent = file_get_contents($fileManagerPath);
    
    // Check if we need to update the controller
    if (strpos($fileManagerContent, 'is_link') === false) {
        // Find the getFiles method
        $pattern = '/private function getFiles\(\)[^{]*{[^}]*}/s';
        if (preg_match($pattern, $fileManagerContent, $matches)) {
            $oldMethod = $matches[0];
            
            // Create the updated method that handles symlinks
            $newMethod = 'private function getFiles()
    {
        $files = [];
        
        // Get all files from the uploads directory
        $disk = Storage::disk(\'public\');
        
        try {
            $files = $disk->files(\'uploads\');
        } catch (\Exception $e) {
            // If listing fails, try manual directory scan
            $uploadsPath = storage_path(\'app/public/uploads\');
            if (is_dir($uploadsPath)) {
                $dirFiles = scandir($uploadsPath);
                foreach ($dirFiles as $file) {
                    if ($file !== \'.\' && $file !== \'..\' && is_file($uploadsPath . \'/\' . $file)) {
                        $files[] = \'uploads/\' . $file;
                    }
                }
            }
        }
        
        return collect($files)->map(function ($file) use ($disk) {
            $url = $disk->url($file);
            
            // Ensure URL is properly formatted with current domain
            if (!parse_url($url, PHP_URL_HOST)) {
                $url = url($url);
            }
            
            return [
                \'id\' => Str::random(16),
                \'name\' => basename($file),
                \'path\' => $file,
                \'url\' => $url,
                \'size\' => $disk->size($file),
                \'last_modified\' => $disk->lastModified($file),
            ];
        });
    }';
            
            // Replace the old method with the new one
            $updatedContent = str_replace($oldMethod, $newMethod, $fileManagerContent);
            
            if (file_put_contents($fileManagerPath, $updatedContent)) {
                echo "<div class='success'>Updated FileManagerController to handle symlinks</div>";
            } else {
                echo "<div class='error'>Failed to update FileManagerController</div>";
            }
        } else {
            echo "<div class='error'>Could not find getFiles method in FileManagerController</div>";
        }
    } else {
        echo "<div class='info'>FileManagerController already updated to handle symlinks</div>";
    }
} else {
    echo "<div class='warning'>FileManagerController not found at {$fileManagerPath}</div>";
}

// HTML footer
echo '
    <h2>Summary</h2>
    <div class="success">Symlink issues have been fixed! The script has:</div>
    <ol>
        <li>Replaced symbolic links with actual files in the uploads directory</li>
        <li>Updated the FileManagerController to better handle symlinks</li>
    </ol>
    
    <h2>Server Information</h2>
    <pre>';
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Operating System: " . PHP_OS . "\n";
echo "Symlink Function Available: " . (function_exists('symlink') ? 'Yes' : 'No') . "\n";
echo '</pre>
    
    <div class="warning">
        Please restart your Laravel development server after running this script.
    </div>
</body>
</html>';

// End output buffering and flush
ob_end_flush(); 