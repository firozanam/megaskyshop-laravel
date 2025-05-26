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
            return [
                'id' => Str::random(16),
                'name' => basename($file),
                'path' => $file,
                'url' => Storage::disk('public')->url($file),
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
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
        ]);
        
        $file = $request->file('file');
        $filename = time() . '-' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        
        $path = $file->storeAs('uploads', $filename, 'public');
        
        if (!$path) {
            return response()->json(['error' => 'Failed to upload file'], 500);
        }
        
        return response()->json([
            'id' => Str::random(16),
            'name' => $filename,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
            'size' => Storage::disk('public')->size($path),
            'last_modified' => Storage::disk('public')->lastModified($path),
            'extension' => $file->getClientOriginalExtension(),
        ]);
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
} 