import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges multiple class names into a single string, handling Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 * @param dateString ISO date string to format
 * @param options Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Return 'Invalid Date' if the date is not valid
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    
    // Default options if none provided
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Formats a number as a currency string
 * @param amount Number to format
 * @param currency Currency code (default: BDT for Bangladeshi Taka)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currency = 'BDT', locale = 'en-US'): string {
    if (amount === null || amount === undefined || amount === '') {
        return 'N/A';
    }
    
    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if the converted amount is a valid number
    if (isNaN(numAmount)) {
        return 'Invalid Amount';
    }
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numAmount);
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

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get the placeholder image URL
 */
export function getPlaceholderImage(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use the current origin to build the URL
    return `${window.location.origin}/images/placeholder.jpg`;
  }
  
  // Fallback for non-browser environments
  return '/images/placeholder.jpg';
}
