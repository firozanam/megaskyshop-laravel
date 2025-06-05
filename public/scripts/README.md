# Laravel cPanel Shared Hosting Scripts

This directory contains utility scripts designed to help with common issues encountered when deploying Laravel applications on cPanel shared hosting environments where terminal access is limited.

## Available Scripts

### 1. `fix_permissions.php`

This script fixes file and directory permissions for Laravel applications running on cPanel shared hosting.

**Features:**
- Sets appropriate permissions for directories (755) and files (644)
- Sets special permissions for storage directories (775) and files (664)
- Creates necessary directories if they don't exist
- Skips vendor, node_modules, and .git directories
- Creates security .htaccess files

**Usage:**
1. Upload this script to your public/scripts directory
2. Access it via browser: `https://yourdomain.com/scripts/fix_permissions.php`
3. Delete the script after use for security

### 2. `fix_storage_links.php`

This script creates the necessary storage links and placeholder images for Laravel applications.

**Features:**
- Creates symbolic link from storage/app/public to public/storage
- Falls back to directory copy if symlinks are not supported
- Creates placeholder images in all necessary locations
- Adds helper functions for PHP and JavaScript
- Updates AppServiceProvider to check for placeholder images

**Usage:**
1. Upload this script to your public/scripts directory
2. Access it via browser: `https://yourdomain.com/scripts/fix_storage_links.php`
3. Follow the next steps displayed at the end of the script
4. Delete the script after use for security

### 3. `run_artisan.php`

This script allows you to run Laravel artisan commands on shared hosting where terminal access is limited.

**Features:**
- Web interface for running common artisan commands
- Security restrictions to only allow safe commands
- Detailed command output display
- Error handling and status reporting

**Usage:**
1. Upload this script to your public/scripts directory
2. Access it via browser: `https://yourdomain.com/scripts/run_artisan.php`
3. Select a command from the dropdown or use the quick-access cards
4. Delete the script immediately after use for security (very important!)

**⚠️ SECURITY WARNING:** This script is potentially dangerous as it allows executing commands on your server. Use it only temporarily and delete immediately after use.

### 4. `fix_symlink_issue.php`

This script fixes issues with symbolic links in the uploads directory that can cause problems with Flysystem's file listing functionality.

**Features:**
- Replaces symbolic links with actual files in the uploads directory
- Updates the FileManagerController to better handle symlinks
- Fixes the "Unable to list contents" error with Flysystem
- Ensures compatibility with Laravel's file management system

**Usage:**
1. Upload this script to your public/scripts directory
2. Access it via browser: `https://yourdomain.com/scripts/fix_symlink_issue.php`
3. Restart your Laravel development server after running the script
4. Delete the script after use for security

## Deployment Process

For a smooth deployment to cPanel shared hosting, follow these steps:

1. Upload your Laravel application to the server
2. Run the `fix_permissions.php` script first
3. Run the `fix_storage_links.php` script
4. If you encounter any symlink-related errors, run the `fix_symlink_issue.php` script
5. Use the `run_artisan.php` script to run necessary artisan commands:
   - `cache:clear` - Clear application cache
   - `config:cache` - Create a cache file for faster configuration loading
   - `route:cache` - Create a route cache file for faster route registration
   - `view:cache` - Compile all Blade templates
   - `key:generate` - Generate application key (if needed)
   - `storage:link` - Create symbolic links (if the fix_storage_links.php script didn't work)
6. Delete all scripts after use for security

## Security Notes

- These scripts are designed for one-time use during deployment or troubleshooting
- Delete these scripts after use to prevent security vulnerabilities
- The scripts create appropriate .htaccess files to protect sensitive directories
- The `run_artisan.php` script is particularly sensitive and should be deleted immediately after use

## Troubleshooting

If you encounter issues:

1. Check the server information displayed at the bottom of each script
2. Ensure PHP has write permissions to the necessary directories
3. If symlinks don't work, the scripts will automatically use fallback methods
4. For file upload issues, ensure the public/uploads directory is writable
5. If artisan commands fail, check the error output for specific issues
6. If you see "Unable to list contents" errors related to symlinks, run the `fix_symlink_issue.php` script


---

## NEW SCRIPT: `fix_prod_error.php` (For Critical Production Errors)

This script is specifically designed to address critical errors like `file_put_contents(...): Failed to open stream: No such file or directory` when it's suspected that production is using incorrect local development paths.

**THE `fix_prod_error.php` SCRIPT IS A TEMPORARY SOLUTION AND POSES A SECURITY RISK IF LEFT ON THE SERVER. DELETE IT IMMEDIATELY AFTER USE.**

### Problem Identification (Current Issue)

The error message:
`file_put_contents(/Volumes/Storage/SaaS Business Projects/megaskyshop-laravel/storage/framework/views/...): Failed to open stream: No such file or directory`
indicates that your Laravel application on the production server is likely trying to use paths from your local development environment. This is often due to cached configuration or view files that were deployed from local to production.

### How to Use `fix_prod_error.php`

1.  **Upload**: Ensure `fix_prod_error.php` (which I will create for you) is uploaded to the `public/scripts/` directory on your production server (e.g., `/home/newsquar/megaskyshop.com/public/scripts/fix_prod_error.php`).
2.  **Access via Browser**: Open your web browser and navigate to `https://megaskyshop.com/scripts/fix_prod_error.php`.
3.  **Review Output**: The script will attempt to:
    *   Ensure necessary `storage` and `bootstrap/cache` directories exist and are writable.
    *   Clear Laravel's configuration, view, route, and general caches. This is the most critical step for the current error.
    *   Provide diagnostic information.
    Review the output shown in your browser for any errors or warnings.
4.  **Test Your Site**: After running the script, try accessing `https://megaskyshop.com/` again to see if the error is resolved.
5.  **DELETE THE SCRIPT**: This is CRITICAL. Once you've used the script (whether it fixes the issue or not), immediately delete `fix_prod_error.php` from your production server. Leaving it accessible is a major security vulnerability.

### If the Problem Persists after using `fix_prod_error.php`

If the script runs but the issue is not resolved:
*   Check the script's output for any specific error messages (e.g., permission denied errors that the script couldn't fix).
*   The underlying issue might be more complex, such as incorrect web server configuration, file ownership problems that the script user cannot change, or issues with the `.env` file on the server.
*   You may need to find a way to get terminal access or involve your hosting provider to further diagnose and fix file permission or ownership issues at a lower level.

**Relationship to `run_artisan.php`:**
While `run_artisan.php` can clear caches, `fix_prod_error.php` is more targeted for the specific path issue by also ensuring directory structures and attempting permission fixes *before* cache clearing, which can be crucial if directories like `storage/framework/views` are missing or unwritable.
 