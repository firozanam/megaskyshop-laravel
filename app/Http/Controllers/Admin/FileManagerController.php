<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FileManagerController extends Controller
{
    /**
     * Display the file manager page.
     */
    public function index()
    {
        $files = $this->getFiles();
        
        return Inertia::render('admin/filemanager/index', [
            'files' => $files,
        ]);
    }
    
    /**
     * Get all files from the uploads directory.
     */
    private function getFiles()
    {
        $files = Storage::disk('public')->files('uploads');
        
        return collect($files)->map(function ($file) {
            $url = Storage::disk('public')->url($file);
            
            // Ensure URL is properly formatted with current domain
            if (!parse_url($url, PHP_URL_HOST)) {
                $url = url($url);
            }
            
            return [
                'id' => Str::random(16),
                'name' => basename($file),
                'path' => $file,
                'url' => $url,
                'size' => Storage::disk('public')->size($file),
                'last_modified' => Storage::disk('public')->lastModified($file),
                'extension' => pathinfo($file, PATHINFO_EXTENSION),
            ];
        })->sortByDesc('last_modified')->values()->all();
    }
    
    /**
     * Upload a new file.
     */
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240', // Max 10MB
            ]);
            
            // Check if the uploads directory exists and create it if it doesn't
            $uploadsDirectory = 'uploads';
            if (!Storage::disk('public')->exists($uploadsDirectory)) {
                if (!Storage::disk('public')->makeDirectory($uploadsDirectory)) {
                    return response()->json(['error' => 'Failed to create uploads directory'], 500);
                }
            }
            
            $file = $request->file('file');
            
            if (!$file || !$file->isValid()) {
                return response()->json(['error' => 'Invalid file upload'], 422);
            }
            
            $filename = time() . '-' . Str::random(8) . '.' . $file->getClientOriginalExtension();
            
            $path = $file->storeAs('uploads', $filename, 'public');
            
            if (!$path) {
                return response()->json(['error' => 'Failed to upload file'], 500);
            }
            
            $url = Storage::disk('public')->url($path);
            
            // Ensure URL is properly formatted with current domain
            if (!parse_url($url, PHP_URL_HOST)) {
                $url = url($url);
            }
            
            return response()->json([
                'id' => Str::random(16),
                'name' => $filename,
                'path' => $path,
                'url' => $url,
                'size' => Storage::disk('public')->size($path),
                'last_modified' => Storage::disk('public')->lastModified($path),
                'extension' => $file->getClientOriginalExtension(),
            ]);
        } catch (\Exception $e) {
            \Log::error('File upload error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to upload file: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Delete a file.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);
        
        $path = $request->input('path');
        
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['success' => true]);
        }
        
        return response()->json(['error' => 'File not found'], 404);
    }
    
    /**
     * Check if the uploads directory exists and create it if it doesn't.
     */
    public function checkDirectory()
    {
        $uploadsDirectory = 'uploads';
        
        // Check if the uploads directory exists
        if (!Storage::disk('public')->exists($uploadsDirectory)) {
            // Create the uploads directory
            if (Storage::disk('public')->makeDirectory($uploadsDirectory)) {
                return response()->json([
                    'success' => true,
                    'message' => 'Uploads directory created successfully.',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create uploads directory.',
                ], 500);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Uploads directory exists.',
        ]);
    }
    
    /**
     * Clear the file manager cache.
     */
    public function clearCache()
    {
        try {
            // Clear Laravel's file cache
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
            
            // Clear the storage cache
            \Illuminate\Support\Facades\Artisan::call('view:clear');
            
            // Force a symlink recreation
            if (file_exists(public_path('storage'))) {
                unlink(public_path('storage'));
            }
            
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            
            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Cache clear error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage(),
            ], 500);
        }
    }
} 