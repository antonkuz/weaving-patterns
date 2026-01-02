/**
 * Gallery Page Script
 * 
 * Initializes the Gallery component with pattern data
 */

let gallery;

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if GALLERY_PATTERNS is available
  if (typeof GALLERY_PATTERNS === 'undefined') {
    console.error('GALLERY_PATTERNS not found. Make sure data/gallery-patterns.js is loaded.');
    return;
  }
  
  // Initialize Gallery component
  gallery = new Gallery('gallery', GALLERY_PATTERNS);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (gallery) {
    gallery.destroy();
  }
});

