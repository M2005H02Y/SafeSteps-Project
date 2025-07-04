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

// Helper function to safely decode a Base64 string to a UTF-8 string
export function b64_to_utf8(str: string): string {
  try {
    // atob decodes base64 to a binary string.
    const binaryString = atob(str);
    // Create a Uint8Array from the binary string.
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // Use TextDecoder to convert the bytes to a UTF-8 string.
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } catch (e) {
    console.error("Failed to decode base64 string", e);
    return "";
  }
}
