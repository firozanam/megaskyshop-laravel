<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CopyProductImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:copy-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Copy product images from CSV references to storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to copy product images...');
        
        // Read the CSV file
        $csvFile = storage_path('app/public/megaskyshop.products.csv');
        
        if (!File::exists($csvFile)) {
            $this->error('CSV file not found!');
            return 1;
        }
        
        // Ensure the uploads directory exists
        if (!Storage::disk('public')->exists('uploads')) {
            Storage::disk('public')->makeDirectory('uploads');
        }
        
        // Open and read the CSV file
        $file = fopen($csvFile, 'r');
        
        // Skip header row
        fgetcsv($file);
        
        $copied = 0;
        $failed = 0;
        
        // Process each row
        while (($row = fgetcsv($file)) !== false) {
            // Image path is usually the 7th column (index 6)
            $imagePath = $row[6] ?? '';
            
            if (empty($imagePath)) {
                continue;
            }
            
            $filename = basename($imagePath);
            $sourcePath = public_path($imagePath);
            $destinationPath = storage_path('app/public/uploads/' . $filename);
            
            // Check if source file exists
            if (File::exists($sourcePath)) {
                // Create directory if it doesn't exist
                File::ensureDirectoryExists(dirname($destinationPath));
                
                // Copy the file
                if (File::copy($sourcePath, $destinationPath)) {
                    $this->info("Copied: {$filename}");
                    $copied++;
                } else {
                    $this->error("Failed to copy: {$filename}");
                    $failed++;
                }
            } else {
                $this->warn("Source file not found: {$sourcePath}");
                $failed++;
            }
        }
        
        fclose($file);
        
        $this->info("Done! Copied {$copied} images, failed {$failed}.");
        
        return 0;
    }
} 