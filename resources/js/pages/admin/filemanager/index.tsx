import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Download,
    RefreshCw,
    Trash2,
    Upload,
    Search,
    Image as ImageIcon,
    FileIcon,
    FileText,
    File,
    X,
    ZoomIn,
    Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatBytes } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { type BreadcrumbItem } from '@/types';

// Default fallback image for broken images - data URL for a simple placeholder
const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMkYyRjIiLz4KICA8cGF0aCBkPSJNODAgNjBIMTIwVjE0MEg4MFY2MFoiIGZpbGw9IiNEMUQxRDEiLz4KICA8cGF0aCBkPSJNNTIuOCA5NC40TDY3LjIgODBMMTAwIDExMkwxMzIuOCA4MEwxNDcuMiA5NC40TDEwMCAxNDEuNkw1Mi44IDk0LjRaIiBmaWxsPSIjQTNBM0EzIi8+CiAgPGNpcmNsZSBjeD0iNjgiIGN5PSI2NCIgcj0iOCIgZmlsbD0iI0QxRDFEMSIvPgo8L3N2Zz4K';

interface FileItem {
    id: string;
    name: string;
    path: string;
    url: string;
    size: number;
    last_modified: number;
    extension: string;
}

interface FileManagerProps {
    files: FileItem[];
}

interface ImageDimensions {
    width: number;
    height: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'File Manager',
        href: '/admin/filemanager',
    },
];

export default function FileManager({ files = [] }: FileManagerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<Record<string, ImageDimensions>>({});
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
    const [alertState, setAlertState] = useState<{
        show: boolean;
        type: 'success' | 'error';
        message: string;
    }>({
        show: false,
        type: 'success',
        message: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Handle file drop
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        setIsUploading(true);
        console.log('Starting file upload...', acceptedFiles[0].name);
        
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }
            
            console.log('Sending upload request with CSRF token:', csrfToken.substring(0, 10) + '...');
            
            const response = await fetch('/admin/filemanager/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    // Don't set Content-Type header when sending FormData
                    // The browser will set it with the correct boundary
                },
                credentials: 'same-origin', // Include cookies
            });
            
            console.log('Upload response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload error response:', errorData);
                throw new Error(errorData.message || 'Failed to upload file');
            }
            
            const responseData = await response.json();
            console.log('Upload successful, response data:', responseData);
            
            // Reload the page to show the new file
            console.log('Reloading page to show new file...');
            router.reload();
            
            setAlertState({
                show: true,
                type: 'success',
                message: 'File uploaded successfully!',
            });
        } catch (error) {
            console.error('Upload error:', error);
            setAlertState({
                show: true,
                type: 'error',
                message: 'Failed to upload file. Please try again.',
            });
        } finally {
            setIsUploading(false);
        }
    }, []);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc'],
        },
        maxSize: 10485760, // 10MB
    });
    
    // Handle manual file upload
    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };
    
    // Handle file input change
    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        console.log('Starting file upload from input...', files[0].name);
        
        const formData = new FormData();
        formData.append('file', files[0]);
        
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }
            
            console.log('Sending upload request with CSRF token:', csrfToken.substring(0, 10) + '...');
            
            const response = await fetch('/admin/filemanager/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    // Don't set Content-Type header when sending FormData
                },
                credentials: 'same-origin', // Include cookies
            });
            
            console.log('Upload response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload error response:', errorData);
                throw new Error(errorData.message || 'Failed to upload file');
            }
            
            const responseData = await response.json();
            console.log('Upload successful, response data:', responseData);
            
            // Reload the page to show the new file
            console.log('Reloading page to show new file...');
            router.reload();
            
            setAlertState({
                show: true,
                type: 'success',
                message: 'File uploaded successfully!',
            });
        } catch (error) {
            console.error('Upload error:', error);
            setAlertState({
                show: true,
                type: 'error',
                message: 'Failed to upload file. Please try again.',
            });
        } finally {
            setIsUploading(false);
            
            // Clear the file input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    // Handle refresh
    const handleRefresh = () => {
        router.reload();
    };
    
    // Handle cache clearing
    const handleClearCache = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }
            
            const response = await fetch('/admin/filemanager/clear-cache', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear cache');
            }
            
            // Reload the page to show the updated files
            router.reload();
            
            setAlertState({
                show: true,
                type: 'success',
                message: 'Cache cleared successfully!',
            });
        } catch (error) {
            console.error('Cache clear error:', error);
            setAlertState({
                show: true,
                type: 'error',
                message: 'Failed to delete file. Please try again.',
            });
        } finally {
            setConfirmDeleteOpen(false);
        }
    };
    
    // Get image URL with proper error handling
    const getImageUrl = (file: FileItem): string => {
        // If we've already encountered an error for this file, return the fallback image
        if (imageErrors[file.id]) {
            return FALLBACK_IMAGE_URL;
        }
        
        // Check if the URL is properly formed
        if (!file.url || file.url.trim() === '') {
            setImageErrors(prev => ({
                ...prev,
                [file.id]: true
            }));
            return FALLBACK_IMAGE_URL;
        }
        
        try {
            // If URL is absolute but uses localhost, replace with current hostname
            if (file.url.startsWith('http://localhost') || file.url.startsWith('https://localhost')) {
                const currentUrl = new URL(window.location.href);
                const fileUrl = new URL(file.url);
                fileUrl.host = currentUrl.host;
                fileUrl.protocol = currentUrl.protocol;
                fileUrl.port = currentUrl.port;
                return fileUrl.toString();
            }
            
            // If URL doesn't start with http or /, add the storage prefix with current domain
            if (!file.url.startsWith('http') && !file.url.startsWith('/')) {
                const baseUrl = window.location.origin;
                return `${baseUrl}/storage/${file.url}`;
            }
            
            // If URL starts with / but not //, prepend current origin
            if (file.url.startsWith('/') && !file.url.startsWith('//')) {
                const baseUrl = window.location.origin;
                return `${baseUrl}${file.url}`;
            }
            
            return file.url;
        } catch (error) {
            console.error('Error parsing URL:', error);
            setImageErrors(prev => ({
                ...prev,
                [file.id]: true
            }));
            return FALLBACK_IMAGE_URL;
        }
    };
    
    // Handle image load
    const handleImageLoad = (file: FileItem, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageDimensions(prev => ({
            ...prev,
            [file.id]: {
                width: img.naturalWidth,
                height: img.naturalHeight
            }
        }));
        setImageLoading(prev => ({
            ...prev,
            [file.id]: false
        }));
    };
    
    // Handle image error
    const handleImageError = (file: FileItem) => {
        console.error(`Image failed to load: ${file.url} (${file.name})`);
        
        // Try alternative URL formats before giving up
        const originalUrl = file.url;
        let alternativeUrl = '';
        
        if (originalUrl.includes('localhost')) {
            // Try with 127.0.0.1 instead of localhost
            alternativeUrl = originalUrl.replace('localhost', '127.0.0.1');
            console.log(`Retrying with alternative URL: ${alternativeUrl}`);
            
            // Create a new image to test the alternative URL
            const img = new Image();
            img.onload = () => {
                console.log(`Alternative URL worked: ${alternativeUrl}`);
                // Update the URL in our files array
                const updatedFiles = [...files];
                const fileIndex = updatedFiles.findIndex(f => f.id === file.id);
                if (fileIndex !== -1) {
                    updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], url: alternativeUrl };
                    // We can't directly update the files prop, but we can force a re-render
                    setImageLoading(prev => ({ ...prev }));
                }
            };
            img.onerror = () => {
                console.error(`Alternative URL also failed: ${alternativeUrl}`);
                setImageErrors(prev => ({
                    ...prev,
                    [file.id]: true
                }));
                setImageLoading(prev => ({
                    ...prev,
                    [file.id]: false
                }));
            };
            img.src = alternativeUrl;
        } else {
            // No alternatives worked, mark as error
            setImageErrors(prev => ({
                ...prev,
                [file.id]: true
            }));
            setImageLoading(prev => ({
                ...prev,
                [file.id]: false
            }));
        }
    };
    
    // Track image loading state
    useEffect(() => {
        const newLoadingState: Record<string, boolean> = {};
        
        files.forEach(file => {
            if (isImage(file.extension)) {
                newLoadingState[file.id] = true;
            }
        });
        
        setImageLoading(newLoadingState);
    }, [files]);
    
    // Prefetch the fallback image
    useEffect(() => {
        const img = new Image();
        img.src = FALLBACK_IMAGE_URL;
    }, []);
    
    // Filter files based on search term
    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Get file icon based on extension
    const getFileIcon = (extension: string) => {
        const ext = extension.toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            return <ImageIcon className="h-6 w-6 text-blue-500" />;
        } else if (['pdf'].includes(ext)) {
            return <FileText className="h-6 w-6 text-red-500" />;
        } else if (['doc', 'docx', 'txt'].includes(ext)) {
            return <FileText className="h-6 w-6 text-blue-500" />;
        } else {
            return <File className="h-6 w-6 text-gray-500" />;
        }
    };
    
    // Check if file is an image
    const isImage = (extension: string) => {
        const ext = extension.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    };
    
    // Check if the uploads directory exists
    useEffect(() => {
        const checkUploadsDirectory = async () => {
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                if (!csrfToken) {
                    console.error('CSRF token not found');
                    return;
                }
                
                const response = await fetch('/admin/filemanager/check-directory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    credentials: 'same-origin',
                }).catch(error => {
                    console.error('Failed to check uploads directory:', error);
                    return null;
                });
                
                if (!response || !response.ok) {
                    console.warn('Failed to check uploads directory. File uploads may not work correctly.');
                }
            } catch (error) {
                console.error('Error checking uploads directory:', error);
            }
        };
        
        checkUploadsDirectory();
    }, []);
    
    // Log file URLs for debugging
    useEffect(() => {
        if (files.length > 0) {
            console.log('File URLs sample:', {
                originalUrl: files[0].url,
                processedUrl: getImageUrl(files[0]),
                currentOrigin: window.location.origin,
                files: files.slice(0, 2).map(file => ({
                    name: file.name,
                    originalUrl: file.url,
                    processedUrl: getImageUrl(file)
                }))
            });
        }
    }, [files]);
    
    // Handle file deletion
    const handleDeleteFile = async () => {
        if (!selectedFile) return;
        
        try {
            const response = await fetch('/admin/filemanager/destroy', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ path: selectedFile.path }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete file');
            }
            
            // Reload the page to update the file list
            router.reload();
            
            setAlertState({
                show: true,
                type: 'success',
                message: 'File deleted successfully!',
            });
        } catch (error) {
            console.error('Delete error:', error);
            setAlertState({
                show: true,
                type: 'error',
                message: 'Failed to delete file. Please try again.',
            });
        } finally {
            setConfirmDeleteOpen(false);
        }
    };
    
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="File Manager" />
            
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">File Manager</h1>
                        <p className="text-muted-foreground">
                            Upload and manage your files
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleRefresh}
                            disabled={isUploading}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={handleClearCache}
                            disabled={isUploading}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="mr-2 h-4 w-4" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M7 8h.01" />
                                <path d="M12 8h.01" />
                                <path d="M17 8h.01" />
                                <path d="M7 12h.01" />
                                <path d="M12 12h.01" />
                                <path d="M17 12h.01" />
                                <path d="M7 16h.01" />
                                <path d="M12 16h.01" />
                                <path d="M17 16h.01" />
                            </svg>
                            Clear Cache
                        </Button>
                        
                        <Button 
                            onClick={handleFileUpload}
                            disabled={isUploading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileInputChange}
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                    </div>
                </div>
                
                {/* Alert messages */}
                {alertState.show && (
                    <Alert variant={alertState.type === 'success' ? 'default' : 'destructive'}>
                        {alertState.type === 'success' ? (
                            <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                            <XCircleIcon className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {alertState.type === 'success' ? 'Success' : 'Error'}
                        </AlertTitle>
                        <AlertDescription>{alertState.message}</AlertDescription>
                    </Alert>
                )}
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* File Upload Area */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Upload Files</CardTitle>
                            <CardDescription>
                                Drag and drop or click to upload
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div 
                                {...getRootProps()} 
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                                    isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-10 w-10 text-gray-400" />
                                    <p className="text-sm font-medium">
                                        {isDragActive
                                            ? 'Drop the file here...'
                                            : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Images up to 10MB
                                    </p>
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <h3 className="text-sm font-medium mb-2">Supported Formats</h3>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>• Images: JPG, PNG, GIF, WebP</p>
                                    <p>• Documents: PDF, DOC, DOCX, TXT</p>
                                    <p>• Max file size: 10MB</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* File List */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Files</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search files..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <CardDescription>
                                {filteredFiles.length} files found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredFiles.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredFiles.map((file) => (
                                        <div 
                                            key={file.id} 
                                            className={`border rounded-lg overflow-hidden hover:border-primary cursor-pointer transition-colors ${
                                                selectedFile?.id === file.id ? 'ring-2 ring-primary border-primary' : ''
                                            }`}
                                            onClick={() => setSelectedFile(file)}
                                        >
                                            <div className="aspect-square flex items-center justify-center bg-gray-100 relative">
                                                {isImage(file.extension) ? (
                                                    <>
                                                        {imageLoading[file.id] && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                                            </div>
                                                        )}
                                                        
                                                        {imageErrors[file.id] ? (
                                                            <div className="flex flex-col items-center justify-center">
                                                                <XCircleIcon className="h-8 w-8 text-red-500" />
                                                                <span className="mt-2 text-xs text-red-500">Failed to load image</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <img 
                                                                    src={getImageUrl(file)} 
                                                                    alt={file.name} 
                                                                    className="w-full h-full object-contain p-2"
                                                                    onLoad={(e) => handleImageLoad(file, e)}
                                                                    onError={() => handleImageError(file)}
                                                                    style={{ display: imageLoading[file.id] ? 'none' : 'block' }}
                                                                />
                                                                
                                                                {!imageLoading[file.id] && !imageErrors[file.id] && (
                                                                    <button 
                                                                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPreviewOpen(true);
                                                                        }}
                                                                    >
                                                                        <ZoomIn className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        {getFileIcon(file.extension)}
                                                        <span className="mt-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                                            {file.extension.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-2">
                                                <p className="text-sm font-medium truncate" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>{formatBytes(file.size)}</span>
                                                    <span>{formatDistanceToNow(new Date(file.last_modified * 1000), { addSuffix: true })}</span>
                                                </div>
                                                {isImage(file.extension) && imageDimensions[file.id] && !imageErrors[file.id] && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {imageDimensions[file.id].width} × {imageDimensions[file.id].height}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileIcon className="h-12 w-12 text-gray-300" />
                                    <h3 className="mt-4 text-lg font-medium">No files found</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchTerm ? 'Try a different search term' : 'Upload your first file'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {/* File Actions */}
                {selectedFile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected File</CardTitle>
                            <CardDescription>
                                Actions for the selected file
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg">
                                        {isImage(selectedFile.extension) && !imageErrors[selectedFile.id] ? (
                                            <img 
                                                src={getImageUrl(selectedFile)} 
                                                alt={selectedFile.name} 
                                                className="w-full h-full object-contain p-1"
                                                onError={() => handleImageError(selectedFile)}
                                            />
                                        ) : (
                                            getFileIcon(selectedFile.extension)
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-medium truncate max-w-[200px]" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {formatBytes(selectedFile.size)} • {selectedFile.extension.toUpperCase()}
                                        </p>
                                        {isImage(selectedFile.extension) && imageDimensions[selectedFile.id] && !imageErrors[selectedFile.id] && (
                                            <p className="text-xs text-muted-foreground">
                                                {imageDimensions[selectedFile.id].width} × {imageDimensions[selectedFile.id].height} pixels
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 md:ml-auto">
                                    {isImage(selectedFile.extension) && !imageErrors[selectedFile.id] && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setPreviewOpen(true)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                    )}
                                    
                                    <Button variant="outline" asChild>
                                        <a href={selectedFile.url} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                    
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => setConfirmDeleteOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-1">File URL</p>
                                <div className="flex">
                                    <Input 
                                        value={imageErrors[selectedFile.id] && isImage(selectedFile.extension) ? FALLBACK_IMAGE_URL : getImageUrl(selectedFile)} 
                                        readOnly 
                                        className="rounded-r-none"
                                    />
                                    <Button 
                                        variant="secondary"
                                        className="rounded-l-none"
                                        onClick={() => {
                                            const url = imageErrors[selectedFile.id] && isImage(selectedFile.extension) ? FALLBACK_IMAGE_URL : getImageUrl(selectedFile);
                                            navigator.clipboard.writeText(url);
                                            setAlertState({
                                                show: true,
                                                type: 'success',
                                                message: 'URL copied to clipboard!',
                                            });
                                            setTimeout(() => {
                                                setAlertState(prev => ({ ...prev, show: false }));
                                            }, 3000);
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {/* Image Preview Modal */}
            {selectedFile && isImage(selectedFile.extension) && (
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>{selectedFile.name}</span>
                                <DialogClose asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" aria-label="Close">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </DialogClose>
                            </DialogTitle>
                            {imageDimensions[selectedFile.id] && !imageErrors[selectedFile.id] && (
                                <DialogDescription>
                                    {imageDimensions[selectedFile.id].width} × {imageDimensions[selectedFile.id].height} pixels • {formatBytes(selectedFile.size)}
                                </DialogDescription>
                            )}
                            {imageErrors[selectedFile.id] && (
                                <DialogDescription className="text-red-500">
                                    Failed to load image preview
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
                            {imageErrors[selectedFile.id] ? (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <XCircleIcon className="h-16 w-16 text-red-500 mb-4" />
                                    <p className="text-red-500 text-center">The image failed to load. It may be corrupted or the file path is invalid.</p>
                                </div>
                            ) : (
                                <img 
                                    src={getImageUrl(selectedFile)} 
                                    alt={selectedFile.name} 
                                    className="max-w-full max-h-[70vh] object-contain"
                                    onError={() => handleImageError(selectedFile)}
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" asChild>
                                <a href={getImageUrl(selectedFile)} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the file
                            <span className="font-medium"> {selectedFile?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteFile}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
} 