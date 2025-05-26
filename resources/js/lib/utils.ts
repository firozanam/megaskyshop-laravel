import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts a YouTube URL to an embed URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function getYouTubeEmbedUrl(url: string): string {
    if (!url) return '';
    
    // If it's already an embed URL, return it
    if (url.includes('youtube.com/embed/')) {
        return url;
    }
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    // Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/);
    if (watchMatch) {
        videoId = watchMatch[1];
    }
    
    // Short YouTube URL: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
        videoId = shortMatch[1];
    }
    
    // YouTube /v/ URL: https://www.youtube.com/v/VIDEO_ID
    const vMatch = url.match(/youtube\.com\/v\/([^?&]+)/);
    if (vMatch) {
        videoId = vMatch[1];
    }
    
    // YouTube shorts URL: https://youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
    if (shortsMatch) {
        videoId = shortsMatch[1];
    }
    
    // If we found a video ID, return the embed URL
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If the URL doesn't match any known format, return an empty string
    return '';
}
