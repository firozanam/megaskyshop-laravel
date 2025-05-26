<?php

namespace App\Console\Commands;

use App\Models\HomepageSection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RemoveDuplicateHomepageSections extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:remove-duplicate-homepage-sections {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Removes duplicate homepage sections, keeping the one with the lowest ID for each section_name';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for duplicate homepage sections...');

        // Get all section names that have duplicates
        $duplicateSectionNames = DB::table('homepage_sections')
            ->select('section_name')
            ->groupBy('section_name')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('section_name');

        if ($duplicateSectionNames->isEmpty()) {
            $this->info('No duplicate homepage sections found!');
            return 0;
        }

        $this->info('Found ' . $duplicateSectionNames->count() . ' section types with duplicates:');
        foreach ($duplicateSectionNames as $sectionName) {
            $this->line('- ' . $sectionName);
        }

        // For each section name with duplicates, find all but keep the one with the lowest ID
        $totalToDelete = 0;
        
        foreach ($duplicateSectionNames as $sectionName) {
            $sections = HomepageSection::where('section_name', $sectionName)
                ->orderBy('id')
                ->get();
            
            $this->info("\nDuplicates for section: {$sectionName}");
            $this->table(
                ['ID', 'Title', 'Is Active', 'Sort Order', 'Created At'],
                $sections->map(function ($section) {
                    return [
                        'ID' => $section->id,
                        'Title' => $section->title,
                        'Is Active' => $section->is_active ? 'Yes' : 'No',
                        'Sort Order' => $section->sort_order,
                        'Created At' => $section->created_at,
                    ];
                })
            );
            
            // Keep the first one (lowest ID), delete the rest
            $toDelete = $sections->slice(1);
            $totalToDelete += $toDelete->count();
            
            if ($this->option('dry-run')) {
                $this->warn("Would delete the following IDs for {$sectionName}: " . $toDelete->pluck('id')->implode(', '));
            } else {
                $idsToDelete = $toDelete->pluck('id')->toArray();
                HomepageSection::whereIn('id', $idsToDelete)->delete();
                $this->info("Deleted IDs for {$sectionName}: " . implode(', ', $idsToDelete));
            }
        }

        if ($this->option('dry-run')) {
            $this->warn("\nDRY RUN SUMMARY: Would delete {$totalToDelete} duplicate entries.");
            $this->info("Run the command without --dry-run to actually delete the duplicates.");
        } else {
            $this->info("\nSUCCESS: Deleted {$totalToDelete} duplicate entries.");
        }

        return 0;
    }
} 