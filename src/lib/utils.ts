import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function formatMonthYear(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Fix malformed socket URLs
 * Handles various edge cases like:
 * - Double protocols (https://https://)
 * - Truncated URLs (https, https/, https://https)
 * - Invalid protocols
 */
export function fixMalformedSocketUrl(url: string | undefined, context: string = '[Socket]'): string {
  const LOCALHOST_URL = 'http://localhost:5000';
  const PRODUCTION_URL = 'https://api.fieldsy.co.uk';

  if (!url || typeof url !== 'string') {
    console.warn(`${context} No socket URL provided, using localhost`);
    return LOCALHOST_URL;
  }

  let fixedUrl = url.trim();

  // Fix double protocol issues
  if (fixedUrl.match(/^https?:\/\/https?:\/\//)) {
    fixedUrl = fixedUrl.replace(/^(https?):\/\/https?:\/\//, '$1://');
    console.log(`${context} Fixed double protocol: ${url} -> ${fixedUrl}`);
  }

  // Fix truncated/malformed URLs
  if (fixedUrl.match(/^https?:?\/?\/?(?:https?)?\/?\/?$/i)) {
    console.warn(`${context} Malformed URL detected: "${url}", falling back to production`);
    return PRODUCTION_URL;
  }

  // Check for missing domain after protocol
  const urlParts = fixedUrl.match(/^(https?:\/\/)(.*)$/);
  if (urlParts) {
    const domain = urlParts[2];
    if (!domain || domain.match(/^\/+$/) || domain.length < 3) {
      console.warn(`${context} URL has invalid domain: "${url}", falling back to production`);
      return PRODUCTION_URL;
    }
  }

  // Must start with http:// or https://
  if (!fixedUrl.match(/^https?:\/\//)) {
    console.warn(`${context} Invalid protocol: "${url}", falling back to localhost`);
    return LOCALHOST_URL;
  }

  // Remove trailing /api
  if (fixedUrl.endsWith('/api')) {
    fixedUrl = fixedUrl.replace(/\/api$/, '');
  }

  return fixedUrl;
}

/**
 * Get the socket URL for admin panel
 */
export function getAdminSocketUrl(context: string = '[AdminSocket]'): string {
  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  let socketURL = apiURL.replace('/api', '');

  // Force production URL if running on fieldsy domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('fieldsy')) {
    socketURL = 'https://api.fieldsy.co.uk';
    console.log(`${context} Detected production domain, using: ${socketURL}`);
  }

  return fixMalformedSocketUrl(socketURL, context);
}