# Laravel Maintenance Scripts for cPanel Shared Hosting

## 1. `laravel_prod_error-fixer.php` - Production Error Fixer

**What it does:**
🛠️ Fixes common Laravel production errors:
- File permission issues  
- Missing storage directories  
- Cache clearance (config, route, view)  
- Environment verification  

**How to run on cPanel:**
1. Upload to: `public_html/public/scripts/laravel_prod_error-fixer.php`
2. Run via browser:  
   `https://yourdomain.com/scripts/laravel_prod_error-fixer.php`
3. Review the automated fixes applied
4. Delete immediately after use

## 2. [laravel_symlink_creator.php](cci:7://file:///Volumes/Storage/SaaS%20Business%20Projects/megaskyshop-laravel/public/scripts/laravel_symlink_creator.php:0:0-0:0) - Storage Symlink Creator

**What it does:**
🔗 Creates `public/storage` → `storage/app/public` symlink  
🔄 Falls back to directory copy if symlinks disabled  
📁 Creates placeholder images if missing  
✅ Verifies symlink functionality  
📱 Mobile-friendly interface  

**How to run on cPanel:**
1. Upload to: `public_html/public/scripts/laravel_symlink_creator.php`
2. Run via browser:  
   `https://yourdomain.com/scripts/laravel_symlink_creator.php`
3. Check output for success/failure
4. Delete immediately after use

## 3. `laravel_permissions_fixer.php` - File Permission Fixer

**What it does:**

✅ Sets correct permissions (755 for directories, 644 for files)  
✅ Special permissions for storage (775) and bootstrap/cache (775)  
✅ Creates missing directories automatically  
✅ Skips vendor/node_modules/.git directories  
✅ Adds security .htaccess files to sensitive directories  

**How to run on cPanel:**
1. Upload to: `public_html/public/scripts/laravel_permissions_fixer.php`
2. Run via browser:  
   `https://yourdomain.com/scripts/laravel_permissions_fixer.php`
3. Delete immediately after use

## 4. `laravel_run_artisan.php` - Artisan Command Runner

**What it does:**
⚙️ Safely executes Artisan commands via web:
- `migrate`  
- `cache:clear`  
- `storage:link`  
- Custom command support  
🔒 Password protection option  

**How to run on cPanel:**
1. Upload to: `public_html/public/scripts/laravel_run_artisan.php`
2. Edit script to set password (line 15)
3. Run via browser:  
   `https://yourdomain.com/scripts/laravel_run_artisan.php`
4. Delete immediately after use

## Security Best Practices
1. Always delete scripts after use
2. Never leave scripts in public directories
3. Use .htaccess to block script directory if possible:
   ```apache
   <Files *.php>
      Deny from all
   </Files>

## 5. companion .htaccess security template:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Standard Laravel redirect to public/
    RewriteRule ^(.*)$ public/$1 [L]
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Block access to sensitive files
    <FilesMatch "(\.env|\.env.example|\.gitignore|composer\.json|composer\.lock|package\.json|webpack\.mix\.js)$">
        Require all denied
    </FilesMatch>
    
    # Block access to hidden files/folders
    RewriteCond %{SCRIPT_FILENAME} -d [OR]
    RewriteCond %{SCRIPT_FILENAME} -f
    RewriteRule "(^|/)\.(?!well-known)" - [F]
</IfModule>

# php -- BEGIN cPanel-generated handler, do not edit
# Set the "ea-php82" package as the default "PHP" programming language.
<IfModule mime_module>
    AddHandler application/x-httpd-ea-php82 .php .php8 .phtml
</IfModule>
# php -- END cPanel-generated handler, do not edit

# Additional security measures
<IfModule mod_headers.c>
    # Disable server signature
    ServerSignature Off
    
    # Prevent MIME sniffing
    Header set X-Content-Type-Options "nosniff"
    
    # Enable CSP (Content Security Policy) - adjust as needed
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:;"
</IfModule>

# Protect the scripts directory
<Directory "/public/scripts">
    <FilesMatch "\.(php|php5|phtml)$">
        Require all denied
    </FilesMatch>
</Directory>

# Disable directory browsing
Options -Indexes

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

## Key Security Features Added

### Enhanced Headers
- **XSS Protection**: Blocks cross-site scripting attacks  
- **MIME Sniffing Prevention**: Stops browsers from interpreting files as different MIME types  

### File Protection
- **Sensitive Files**: Blocks access to `.env`, config files, and development files  
- **Hidden Files**: Prevents access to all dotfiles (except `.well-known`)  
- **Script Directory**: Specifically blocks PHP execution in `/public/scripts`  

### Server Hardening
- **Directory Browsing**: Disables automatic directory index views  
- **Content Security Policy**: Basic CSP template (adjust as needed for your app)  
- **Compression**: Improves performance for text-based assets  

### Additional Recommendation
For maximum security, create a separate [.htaccess](cci:7://file:///Volumes/Storage/SaaS%20Business%20Projects/megaskyshop-laravel/.htaccess:0:0-0:0) in your `public/scripts` directory with:

```apache
<FilesMatch "\.(php|php5|phtml)$">
    Require all denied
</FilesMatch>
```