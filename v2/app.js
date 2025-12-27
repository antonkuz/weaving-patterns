/**
 * Main Application Script
 * 
 * Wires together all components and manages shared state
 */

// Application state
const appState = {
  binaryPattern: [0, 1, 0, 1],
  colorScheme: { 0: '#FFFFFF', 1: '#000000' },
  gridConfig: { width: 8, height: 8, cellSize: 50 },
  isAnimating: false,
  animationProgress: 0,
  animationInterval: null
};

// Component instances
let binaryPatternDesigner;
let colorSchemeDesigner;
let gridConfigDesigner;
let appliedPatternPreview;
let saveExport;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeComponents();
  wireUpComponents();
});

function initializeComponents() {
  // Initialize BinaryPatternDesigner
  binaryPatternDesigner = new BinaryPatternDesigner(
    'binary-pattern-designer',
    appState.binaryPattern,
    (pattern) => {
      appState.binaryPattern = pattern;
      updatePreview();
    }
  );
  
  // Initialize ColorSchemeDesigner
  colorSchemeDesigner = new ColorSchemeDesigner(
    'color-scheme-designer',
    appState.colorScheme,
    (scheme) => {
      appState.colorScheme = scheme;
      updatePreview();
    }
  );
  
  // Initialize GridConfigDesigner
  gridConfigDesigner = new GridConfigDesigner(
    'grid-config-designer',
    appState.gridConfig,
    (config) => {
      appState.gridConfig = config;
      updatePreview();
    }
  );
  
  // Initialize AppliedPatternPreview
  appliedPatternPreview = new AppliedPatternPreview(
    'applied-pattern-preview',
    () => {
      // Component ready callback
      updatePreview();
    }
  );
  
  // Initialize SaveExport
  saveExport = new SaveExport(
    'save-export',
    () => getPatternData()
  );
}

function wireUpComponents() {
  // Set up animation button
  const animateButton = document.getElementById('btn-animate');
  if (animateButton) {
    animateButton.addEventListener('click', () => {
      toggleAnimation();
    });
  }
  
  // Initial preview update
  updatePreview();
}

function updatePreview() {
  if (appliedPatternPreview) {
    appliedPatternPreview.setBinaryPattern(appState.binaryPattern);
    appliedPatternPreview.setColorScheme(appState.colorScheme);
    appliedPatternPreview.setGridConfig(appState.gridConfig);
    appliedPatternPreview.setAnimationProgress(appState.animationProgress);
    appliedPatternPreview.setIsAnimating(appState.isAnimating);
  }
}

function toggleAnimation() {
  appState.isAnimating = !appState.isAnimating;
  
  const animateButton = document.getElementById('btn-animate');
  if (animateButton) {
    animateButton.textContent = appState.isAnimating ? 'Stop Animation' : 'Start Animation';
    animateButton.classList.toggle('active', appState.isAnimating);
  }
  
  if (appState.isAnimating) {
    startAnimation();
  } else {
    stopAnimation();
  }
  
  updatePreview();
}

function startAnimation() {
  const maxCells = appState.gridConfig.width * appState.gridConfig.height;
  
  // Reset progress
  appState.animationProgress = 0;
  
  // Clear any existing interval
  if (appState.animationInterval) {
    clearInterval(appState.animationInterval);
  }
  
  // Start animation interval
  appState.animationInterval = setInterval(() => {
    appState.animationProgress++;
    
    if (appState.animationProgress >= maxCells) {
      // Animation complete, stop
      stopAnimation();
      const animateButton = document.getElementById('btn-animate');
      if (animateButton) {
        animateButton.textContent = 'Start Animation';
        animateButton.classList.remove('active');
      }
    } else {
      updatePreview();
    }
  }, 100); // Update every 100ms (10 cells per second)
}

function stopAnimation() {
  if (appState.animationInterval) {
    clearInterval(appState.animationInterval);
    appState.animationInterval = null;
  }
  appState.isAnimating = false;
  updatePreview();
}

function getPatternData() {
  return {
    binaryPattern: appState.binaryPattern,
    colorScheme: appState.colorScheme,
    gridConfig: appState.gridConfig
  };
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopAnimation();
  if (appliedPatternPreview) {
    appliedPatternPreview.destroy();
  }
});

