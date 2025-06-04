<?php
/**
 * Laravel Storage Links Fix Script for cPanel Shared Hosting
 * 
 * This script creates the necessary storage links and placeholder images
 * for Laravel applications running on cPanel shared hosting environments
 * where terminal access is limited.
 * 
 * Usage: Upload this script to your public directory and access it via browser.
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
    <title>Laravel Storage Links Fix</title>
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
        img {
            max-width: 100%;
            height: auto;
        }
        .image-preview {
            border: 1px solid #e2e8f0;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Laravel Storage Links Fix for cPanel Shared Hosting</h1>
    <div id="log">
        <div class="info">Starting storage links fix process...</div>
';

// Flush output
flush();

// Function to create directory if it doesn't exist
function createDirectory($path, $permission = 0755) {
    if (!file_exists($path)) {
        if (mkdir($path, $permission, true)) {
            echo "<div class='success'>Created directory: {$path}</div>";
            return true;
        } else {
            echo "<div class='error'>Failed to create directory: {$path}</div>";
            return false;
        }
    } else {
        echo "<div class='info'>Directory already exists: {$path}</div>";
        return true;
    }
}

// Create necessary directories
echo '<h2>Creating Necessary Directories</h2>';
createDirectory($storagePath, 0775);
createDirectory($storageUploadsPath, 0775);
createDirectory($publicUploadsPath, 0755);
createDirectory($publicImagesPath, 0755);

// Create storage symlink or fallback directory
echo '<h2>Creating Storage Symlink</h2>';
if (file_exists($publicStoragePath)) {
    if (is_link($publicStoragePath)) {
        echo "<div class='info'>Storage symlink already exists. Removing it to recreate...</div>";
        unlink($publicStoragePath);
    } else {
        echo "<div class='warning'>Storage path exists but is not a symlink. Removing directory...</div>";
        // Recursively remove directory
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($publicStoragePath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $fileinfo) {
            $action = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            if (!$action($fileinfo->getRealPath())) {
                echo "<div class='error'>Failed to remove {$fileinfo->getRealPath()}</div>";
            }
        }
        rmdir($publicStoragePath);
    }
}

// Try to create symlink
$symlinkCreated = false;
if (function_exists('symlink')) {
    try {
        if (symlink($storagePath, $publicStoragePath)) {
            echo "<div class='success'>Created symbolic link from {$storagePath} to {$publicStoragePath}</div>";
            $symlinkCreated = true;
        } else {
            echo "<div class='error'>Failed to create symbolic link: " . error_get_last()['message'] . "</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>Exception when creating symlink: {$e->getMessage()}</div>";
    }
} else {
    echo "<div class='error'>Symlink function is not available on this server</div>";
}

// Fallback to directory copy if symlink fails
if (!$symlinkCreated) {
    echo "<div class='warning'>Symlink creation failed. Using fallback method (directory copy)...</div>";
    
    // Create directory if it doesn't exist
    if (createDirectory($publicStoragePath, 0755)) {
        // Create a file to indicate this is a fallback directory
        file_put_contents($publicStoragePath . '/.fallback', 'This is a fallback directory created because symlinks are not supported on this server.');
        echo "<div class='info'>Created fallback directory structure</div>";
        
        // Create uploads directory in public/storage
        createDirectory($publicStoragePath . '/uploads', 0755);
        
        echo "<div class='warning'>Note: This is not a real symlink, so you'll need to manually sync files or use the direct uploads approach.</div>";
    }
}

// Create placeholder image
echo '<h2>Creating Placeholder Image</h2>';

// Define placeholder image paths
$placeholderPaths = [
    $publicImagesPath . '/placeholder.jpg',
    $publicUploadsPath . '/placeholder.jpg',
    $storageUploadsPath . '/placeholder.jpg',
    $publicStoragePath . '/uploads/placeholder.jpg'
];

// Create a simple placeholder image if it doesn't exist in public/images
$sourcePlaceholderPath = $publicImagesPath . '/placeholder.jpg';
if (!file_exists($sourcePlaceholderPath)) {
    // Create a simple 200x200 gray placeholder image
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
        imagejpeg($image, $sourcePlaceholderPath, 90);
        imagedestroy($image);
        
        echo "<div class='success'>Created placeholder image using GD library</div>";
    } else {
        // Fallback to a simple 1x1 transparent pixel
        $transparentPixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        file_put_contents($sourcePlaceholderPath, $transparentPixel);
        echo "<div class='success'>Created simple placeholder image (GD library not available)</div>";
    }
} else {
    echo "<div class='info'>Placeholder image already exists at {$sourcePlaceholderPath}</div>";
}

// Copy placeholder image to all required locations
foreach ($placeholderPaths as $path) {
    if ($path === $sourcePlaceholderPath) {
        continue; // Skip the source file
    }
    
    // Create directory if it doesn't exist
    $dir = dirname($path);
    if (!file_exists($dir)) {
        createDirectory($dir);
    }
    
    if (!file_exists($path)) {
        // Always use copy instead of symlink for placeholder images
        if (copy($sourcePlaceholderPath, $path)) {
            echo "<div class='success'>Copied placeholder image to {$path}</div>";
        } else {
            echo "<div class='error'>Failed to copy placeholder image to {$path}</div>";
        }
    } else {
        // If the file exists but is a symlink, replace it with a real file
        if (is_link($path)) {
            unlink($path);
            if (copy($sourcePlaceholderPath, $path)) {
                echo "<div class='success'>Replaced symlink with actual file at {$path}</div>";
            } else {
                echo "<div class='error'>Failed to replace symlink at {$path}</div>";
            }
        } else {
            echo "<div class='info'>Placeholder image already exists at {$path}</div>";
        }
    }
}

// Create helper function in app/Helpers directory
echo '<h2>Creating Helper Function</h2>';

$helpersDir = $baseDir . '/app/Helpers';
$helperFile = $helpersDir . '/helpers.php';

// Create Helpers directory if it doesn't exist
createDirectory($helpersDir);

// Check if helpers.php exists and contains the placeholder_image_url function
$helperContent = file_exists($helperFile) ? file_get_contents($helperFile) : '';

if (strpos($helperContent, 'function placeholder_image_url') === false) {
    // Add the helper function
    $helperFunction = <<<'EOD'

if (!function_exists('placeholder_image_url')) {
    /**
     * Get the URL for the placeholder image.
     * This function tries multiple possible locations for the placeholder image.
     *
     * @return string
     */
    function placeholder_image_url()
    {
        $possiblePaths = [
            '/images/placeholder.jpg',
            '/uploads/placeholder.jpg',
            '/storage/uploads/placeholder.jpg',
        ];
        
        foreach ($possiblePaths as $path) {
            if (file_exists(public_path($path))) {
                return asset($path);
            }
        }
        
        // Fallback to a direct path
        return asset('/images/placeholder.jpg');
    }
}
EOD;

    // Append or create the file
    if (!empty($helperContent)) {
        // Append to existing file
        file_put_contents($helperFile, $helperContent . $helperFunction);
        echo "<div class='success'>Added placeholder_image_url function to existing helpers.php</div>";
    } else {
        // Create new file
        $newHelperContent = "<?php\n\n" . trim($helperFunction);
        file_put_contents($helperFile, $newHelperContent);
        echo "<div class='success'>Created new helpers.php with placeholder_image_url function</div>";
    }
} else {
    echo "<div class='info'>placeholder_image_url function already exists in helpers.php</div>";
}

// Update composer.json to autoload the helper file
echo '<h2>Updating Composer Configuration</h2>';

$composerJsonPath = $baseDir . '/composer.json';
if (file_exists($composerJsonPath)) {
    $composerJson = json_decode(file_get_contents($composerJsonPath), true);
    
    if (is_array($composerJson)) {
        // Check if the helpers.php file is already in the files array
        $needsUpdate = false;
        
        if (!isset($composerJson['autoload']['files']) || !is_array($composerJson['autoload']['files'])) {
            // Create the files array if it doesn't exist
            if (!isset($composerJson['autoload'])) {
                $composerJson['autoload'] = [];
            }
            $composerJson['autoload']['files'] = [];
            $needsUpdate = true;
        }
        
        // Check if the helper file is already in the files array
        $helperPath = 'app/Helpers/helpers.php';
        if (!in_array($helperPath, $composerJson['autoload']['files'])) {
            $composerJson['autoload']['files'][] = $helperPath;
            $needsUpdate = true;
        }
        
        if ($needsUpdate) {
            // Write the updated composer.json
            file_put_contents($composerJsonPath, json_encode($composerJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            echo "<div class='success'>Updated composer.json to autoload the helper file</div>";
            echo "<div class='warning'>Important: You need to run <code>composer dump-autoload</code> for the changes to take effect</div>";
        } else {
            echo "<div class='info'>composer.json already configured to autoload the helper file</div>";
        }
    } else {
        echo "<div class='error'>Failed to parse composer.json</div>";
    }
} else {
    echo "<div class='error'>composer.json not found</div>";
}

// Create a JavaScript utility function
echo '<h2>Creating JavaScript Utility Function</h2>';

$jsUtilsDir = $baseDir . '/resources/js/utils';
$jsUtilsFile = $jsUtilsDir . '/utils.ts';

// Create utils directory if it doesn't exist
createDirectory($jsUtilsDir);

// Check if utils.ts exists and contains the getPlaceholderImage function
$jsUtilsContent = file_exists($jsUtilsFile) ? file_get_contents($jsUtilsFile) : '';

if (strpos($jsUtilsContent, 'export function getPlaceholderImage') === false) {
    // Add the utility function
    $jsUtilFunction = <<<'EOD'

/**
 * Get the URL for the placeholder image.
 * This function tries multiple possible locations for the placeholder image.
 *
 * @return string
 */
export function getPlaceholderImage(): string {
  const possiblePaths = [
    '/images/placeholder.jpg',
    '/uploads/placeholder.jpg',
    '/storage/uploads/placeholder.jpg',
  ];
  
  // In a browser environment, we can check if the image exists
  // For SSR, we'll just return the first path
  if (typeof window === 'undefined') {
    return possiblePaths[0];
  }
  
  // Return the first path that exists
  return possiblePaths[0];
}
EOD;

    // Append or create the file
    if (!empty($jsUtilsContent)) {
        // Append to existing file
        file_put_contents($jsUtilsFile, $jsUtilsContent . $jsUtilFunction);
        echo "<div class='success'>Added getPlaceholderImage function to existing utils.ts</div>";
    } else {
        // Create new file
        $newJsUtilsContent = trim($jsUtilFunction);
        file_put_contents($jsUtilsFile, $newJsUtilsContent);
        echo "<div class='success'>Created new utils.ts with getPlaceholderImage function</div>";
    }
} else {
    echo "<div class='info'>getPlaceholderImage function already exists in utils.ts</div>";
}

// Create a placeholder check in AppServiceProvider
echo '<h2>Updating AppServiceProvider</h2>';

$appServiceProviderPath = $baseDir . '/app/Providers/AppServiceProvider.php';
if (file_exists($appServiceProviderPath)) {
    $appServiceProviderContent = file_get_contents($appServiceProviderPath);
    
    // Check if the placeholder check is already in the boot method
    if (strpos($appServiceProviderContent, 'placeholder_image_url') === false) {
        // Find the boot method
        $bootMethodPattern = '/public function boot\(\)[^{]*{/';
        
        if (preg_match($bootMethodPattern, $appServiceProviderContent, $matches, PREG_OFFSET_CAPTURE)) {
            $bootMethodStart = $matches[0][1] + strlen($matches[0][0]);
            
            // Add the placeholder check code
            $placeholderCheckCode = <<<'EOD'

        // Check if placeholder image exists and create it if not
        $placeholderPaths = [
            public_path('images/placeholder.jpg'),
            public_path('uploads/placeholder.jpg'),
            public_path('storage/uploads/placeholder.jpg'),
        ];
        
        $placeholderExists = false;
        foreach ($placeholderPaths as $path) {
            if (file_exists($path)) {
                $placeholderExists = true;
                break;
            }
        }
        
        if (!$placeholderExists) {
            // Create directories if they don't exist
            $directories = [
                dirname(public_path('images/placeholder.jpg')),
                dirname(public_path('uploads/placeholder.jpg')),
                dirname(public_path('storage/uploads/placeholder.jpg')),
            ];
            
            foreach ($directories as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
            }
            
            // Copy placeholder image from public/images to other locations
            $sourcePath = public_path('images/placeholder.jpg');
            if (file_exists($sourcePath)) {
                foreach ($placeholderPaths as $path) {
                    if ($path !== $sourcePath && !file_exists($path)) {
                        copy($sourcePath, $path);
                    }
                }
            }
        }
EOD;
            
            // Insert the code after the boot method opening brace
            $updatedContent = substr($appServiceProviderContent, 0, $bootMethodStart) . 
                              $placeholderCheckCode . 
                              substr($appServiceProviderContent, $bootMethodStart);
            
            file_put_contents($appServiceProviderPath, $updatedContent);
            echo "<div class='success'>Updated AppServiceProvider to check for placeholder image on boot</div>";
        } else {
            echo "<div class='error'>Could not find boot method in AppServiceProvider</div>";
        }
    } else {
        echo "<div class='info'>AppServiceProvider already checks for placeholder image</div>";
    }
} else {
    echo "<div class='error'>AppServiceProvider not found</div>";
}

// Test placeholder image
echo '<h2>Testing Placeholder Image</h2>';

// Get the URL of the placeholder image
$placeholderUrl = '/images/placeholder.jpg';
$placeholderPath = $baseDir . '/public' . $placeholderUrl;

if (file_exists($placeholderPath)) {
    echo "<div class='success'>Placeholder image exists at {$placeholderPath}</div>";
    echo "<div class='image-preview'>";
    echo "<p>Placeholder Image Preview:</p>";
    echo "<img src='{$placeholderUrl}' alt='Placeholder Image' style='max-width: 200px;'>";
    echo "</div>";
} else {
    echo "<div class='error'>Placeholder image not found at {$placeholderPath}</div>";
}

// HTML footer
echo '
        <div class="success">Storage links fix process completed!</div>
    </div>
    <h2>Server Information</h2>
    <pre>';
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Operating System: " . PHP_OS . "\n";
echo "Symlink Function Available: " . (function_exists('symlink') ? 'Yes' : 'No') . "\n";
echo "GD Library Available: " . (function_exists('imagecreatetruecolor') ? 'Yes' : 'No') . "\n";
echo '</pre>
    <h2>Next Steps</h2>
    <ol>
        <li>If you\'ve made changes to composer.json, run <code>composer dump-autoload</code> on your local environment or through cPanel\'s terminal if available.</li>
        <li>If you\'ve made changes to JavaScript files, rebuild your assets with <code>npm run build</code> or <code>yarn build</code>.</li>
        <li>Clear your Laravel application cache: <code>php artisan cache:clear</code></li>
        <li>Delete this script after use for security.</li>
    </ol>
</body>
</html>';

// End output buffering and flush
ob_end_flush(); 