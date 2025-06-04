<?php
/**
 * Laravel Artisan Command Runner for cPanel Shared Hosting
 * 
 * This script allows you to run Laravel artisan commands on shared hosting
 * where terminal access is limited.
 * 
 * ⚠️ SECURITY WARNING: This script is potentially dangerous as it allows
 * executing arbitrary commands. Use it only temporarily and delete immediately after use.
 * 
 * Usage: Upload this script to your public/scripts directory and access it via browser.
 */

// Set execution time limit to 300 seconds (5 minutes)
set_time_limit(300);

// Start output buffering
ob_start();

// Define the base directory (Laravel root)
$baseDir = dirname(__DIR__);

// List of safe commands that can be executed
$safeCommands = [
    'cache:clear' => 'Clear application cache',
    'config:cache' => 'Create a cache file for faster configuration loading',
    'config:clear' => 'Remove the configuration cache file',
    'route:cache' => 'Create a route cache file for faster route registration',
    'route:clear' => 'Remove the route cache file',
    'view:cache' => 'Compile all of the application\'s Blade templates',
    'view:clear' => 'Clear all compiled view files',
    'key:generate' => 'Generate application key',
    'migrate' => 'Run database migrations',
    'migrate:status' => 'Show the status of each migration',
    'optimize:clear' => 'Remove the cached bootstrap files',
    'storage:link' => 'Create the symbolic links configured for the application',
    'queue:restart' => 'Restart queue worker daemons after their current job',
    'queue:clear' => 'Delete all of the jobs from the specified queue',
    'package:discover' => 'Rebuild the cached package manifest',
];

// HTML header
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Artisan Command Runner</title>
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
        .command-output {
            background-color: #1a202c;
            color: #e2e8f0;
            padding: 12px;
            border-radius: 5px;
            font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            margin-top: 10px;
            white-space: pre-wrap;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 1rem;
        }
        .card h3 {
            margin-top: 0;
        }
        form {
            margin-bottom: 20px;
        }
        input[type="text"], select {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }
        button {
            background-color: #4299e1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #3182ce;
        }
        .security-warning {
            background-color: #742a2a;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="security-warning">
        ⚠️ SECURITY WARNING: This script is potentially dangerous as it allows executing commands on your server.
        Delete this file immediately after use!
    </div>
    <h1>Laravel Artisan Command Runner</h1>
';

// Check if PHP is running as CGI/FastCGI
$isCgi = (substr(php_sapi_name(), 0, 3) === 'cgi');
if ($isCgi) {
    echo '<div class="warning">PHP is running as CGI/FastCGI. Some commands may not work as expected.</div>';
}

// Check if a command was submitted
if (isset($_POST['command']) || isset($_GET['command'])) {
    $command = $_POST['command'] ?? $_GET['command'];
    $options = $_POST['options'] ?? $_GET['options'] ?? '';
    
    // Security check - only allow predefined safe commands
    $commandBase = explode(' ', $command)[0];
    if (!array_key_exists($commandBase, $safeCommands)) {
        echo '<div class="error">Error: Command not allowed for security reasons.</div>';
    } else {
        echo '<h2>Running Command: <code>php artisan ' . htmlspecialchars($command . ' ' . $options) . '</code></h2>';
        
        // Change to the base directory
        chdir($baseDir);
        
        // Prepare the command
        $artisanCommand = 'php artisan ' . escapeshellcmd($command) . ' ' . escapeshellcmd($options) . ' 2>&1';
        
        // Execute the command
        $output = [];
        $returnVar = 0;
        exec($artisanCommand, $output, $returnVar);
        
        // Display the output
        echo '<div class="command-output">';
        if ($returnVar === 0) {
            echo implode("\n", array_map('htmlspecialchars', $output));
            echo "\n\n" . '<span style="color: #68d391;">Command completed successfully!</span>';
        } else {
            echo implode("\n", array_map('htmlspecialchars', $output));
            echo "\n\n" . '<span style="color: #f56565;">Command failed with exit code: ' . $returnVar . '</span>';
        }
        echo '</div>';
    }
}

// Command form
echo '
    <h2>Run Artisan Command</h2>
    <form method="post">
        <div>
            <label for="command">Select Command:</label>
            <select name="command" id="command">
';

foreach ($safeCommands as $cmd => $description) {
    echo '<option value="' . $cmd . '">' . $cmd . ' - ' . $description . '</option>';
}

echo '
            </select>
        </div>
        <div>
            <label for="options">Options (optional):</label>
            <input type="text" name="options" id="options" placeholder="--force --quiet">
        </div>
        <button type="submit">Run Command</button>
    </form>

    <h2>Common Commands</h2>
    <div class="grid">
';

// Display common commands as cards
$commonCommands = [
    'cache:clear' => 'Clears the application cache',
    'config:cache' => 'Creates a cache file for faster configuration loading',
    'route:cache' => 'Creates a route cache file for faster route registration',
    'view:cache' => 'Compiles all Blade templates',
    'key:generate' => 'Generates a new application key',
    'storage:link' => 'Creates a symbolic link from public/storage to storage/app/public',
    'optimize:clear' => 'Removes the cached bootstrap files',
];

foreach ($commonCommands as $cmd => $description) {
    echo '
        <div class="card">
            <h3>' . $cmd . '</h3>
            <p>' . $description . '</p>
            <form method="get">
                <input type="hidden" name="command" value="' . $cmd . '">
                <button type="submit">Run</button>
            </form>
        </div>
    ';
}

echo '
    </div>

    <h2>Server Information</h2>
    <pre>';
echo "PHP Version: " . phpversion() . "\n";
echo "Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "Operating System: " . PHP_OS . "\n";
echo "PHP SAPI: " . php_sapi_name() . "\n";
echo "Current Working Directory: " . getcwd() . "\n";
echo "Base Directory: " . $baseDir . "\n";
echo '</pre>

    <div class="security-warning">
        ⚠️ SECURITY WARNING: Delete this file immediately after use!
    </div>
</body>
</html>';

// End output buffering and flush
ob_end_flush(); 