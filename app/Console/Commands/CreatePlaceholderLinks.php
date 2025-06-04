<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CreatePlaceholderLinks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'placeholder:link';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create symbolic links for the placeholder image in all necessary locations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Define paths
        $publicImagesDir = public_path('images');
        $publicUploadsDir = public_path('uploads');
        $storagePublicUploadsDir = storage_path('app/public/uploads');

        // Ensure directories exist
        if (!File::exists($publicImagesDir)) {
            File::makeDirectory($publicImagesDir, 0755, true);
            $this->info("Created directory: {$publicImagesDir}");
        }

        if (!File::exists($publicUploadsDir)) {
            File::makeDirectory($publicUploadsDir, 0755, true);
            $this->info("Created directory: {$publicUploadsDir}");
        }

        if (!File::exists($storagePublicUploadsDir)) {
            File::makeDirectory($storagePublicUploadsDir, 0755, true);
            $this->info("Created directory: {$storagePublicUploadsDir}");
        }

        // Source file - we'll use the one in public/images as the source of truth
        $sourceFile = $publicImagesDir . '/placeholder.jpg';

        // Check if source file exists
        if (!File::exists($sourceFile)) {
            $this->error("Source file not found: {$sourceFile}");
            return 1;
        }

        // Create symbolic links or copy the file
        $targetFiles = [
            $publicUploadsDir . '/placeholder.jpg',
            $storagePublicUploadsDir . '/placeholder.jpg',
        ];

        foreach ($targetFiles as $targetFile) {
            if (File::exists($targetFile)) {
                File::delete($targetFile);
                $this->info("Removed existing file: {$targetFile}");
            }
            
            // Try to create a symbolic link first
            try {
                File::link($sourceFile, $targetFile);
                $this->info("Created symbolic link: {$targetFile} -> {$sourceFile}");
            } catch (\Exception $e) {
                // If symlink fails, copy the file
                try {
                    File::copy($sourceFile, $targetFile);
                    $this->info("Copied file: {$sourceFile} -> {$targetFile}");
                } catch (\Exception $e) {
                    $this->error("Failed to create link or copy file: {$targetFile}");
                    $this->error($e->getMessage());
                }
            }
        }

        $this->info("Placeholder links created successfully!");
        return 0;
    }
} 