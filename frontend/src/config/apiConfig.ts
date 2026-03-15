/**
 * Centralized API configuration to handle environment variables and fallbacks.
 * This ensures that the application works correctly even if .env files are missing,
 * such as in a fresh collaborator environment.
 */

// Fallback URLs (change these if you have a primary production domain)
const FALLBACK_API = 'https://job-listing-portal-ten-omega.vercel.app/api';
const FALLBACK_SITE = 'https://job-listing-portal-ten-omega.vercel.app';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API;

// The root URL of the backend server (for static files/uploads)
export const BACKEND_URL = API_URL.replace('/api', '');

// The root URL of the frontend website
// Dynamically determine the site URL in the browser, otherwise use fallback
export const SITE_URL = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE);

export default {
    API_URL,
    BACKEND_URL,
    SITE_URL,
};
