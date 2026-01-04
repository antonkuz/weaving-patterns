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
  
  // Setup animation control button
  setupAnimationControlButton();
});

function setupAnimationControlButton() {
  const btn = document.getElementById('animation-control-btn');
  const icon = document.getElementById('animation-control-icon');
  
  if (!btn || !icon) return;
  
  // Update icon based on current animation state
  function updateButtonIcon() {
    if (autoGallery.animationsEnabled) {
      icon.src = 'assets/pause.png';
      icon.alt = 'Pause';
    } else {
      icon.src = 'assets/play.png';
      icon.alt = 'Play';
    }
  }
  
  // Initial state (animations start enabled)
  updateButtonIcon();
  
  // Handle button click
  btn.addEventListener('click', () => {
    if (autoGallery) {
      autoGallery.toggleAnimations();
      updateButtonIcon();
    }
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (autoGallery) {
    autoGallery.destroy();
  }
});

