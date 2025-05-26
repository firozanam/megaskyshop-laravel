<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class CopyProductsCSV extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:copy-csv';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Copy products CSV file from docs directory to storage for seeding';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sourceFile = base_path('docs/megaskyshop.products.csv');
        $destinationDir = storage_path('app/public');
        $destinationFile = $destinationDir . '/megaskyshop.products.csv';

        // Create the directory if it doesn't exist
        if (!File::exists($destinationDir)) {
            File::makeDirectory($destinationDir, 0755, true);
        }

        // Copy the file
        if (File::exists($sourceFile)) {
            File::copy($sourceFile, $destinationFile);
            $this->info('CSV file copied successfully to storage.');
        } else {
            $this->error('Source CSV file not found in docs directory!');
            return 1;
        }

        return 0;
    }
}
