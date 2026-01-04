/**
 * Auto Gallery Page Script
 * 
 * Initializes the AutoGallery component with options data
 */

let autoGallery;

// Initialize auto gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if OPTIONS is available
  if (typeof OPTIONS === 'undefined') {
    console.error('OPTIONS not found. Make sure data/options.js is loaded.');
    return;
  }
  
  // Initialize AutoGallery component
  autoGallery = new AutoGallery('autogallery', OPTIONS, {
    initialBatchSize: 12,
    loadBatchSize: 8,
    scrollThreshold: 200
  });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (autoGallery) {
    autoGallery.destroy();
  }
});

