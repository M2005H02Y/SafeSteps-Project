import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Transforms a Cloudinary URL for a PDF or other document into a URL for an image preview.
 * It replaces the file extension with .jpg to leverage Cloudinary's automatic format conversion.
 * @param url The original Cloudinary file URL.
 * @returns A URL for a JPG preview of the file.
 */
export function getCloudinaryImagePreview(url: string): string {
  if (!url) return '';
  // This is a robust way to replace the extension. It finds the last dot
  // and replaces everything after it with '.jpg'.
  const parts = url.split('.');
  if (parts.length > 1) {
    parts.pop(); // remove original extension
    return `${parts.join('.')}.jpg`;
  }
  return `${url}.jpg`; // Fallback if no extension is found
}
