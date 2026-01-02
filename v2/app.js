/**
 * Main Application Script
 * 
 * Wires together all components and manages shared state
 */

// Application state
const appState = {
  binaryPattern: [1, 1, 0, 1, 1, 1, 0],
  colorScheme: { 0: '#F27821', 1: '#8C3363' },
  gridConfig: { width: 7, height: 1, cellSize: 50 }
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
    },
    () => appState.binaryPattern.length
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
  // Initial preview update
  updatePreview();
}

function updatePreview() {
  if (appliedPatternPreview) {
    appliedPatternPreview.setBinaryPattern(appState.binaryPattern);
    appliedPatternPreview.setColorScheme(appState.colorScheme);
    appliedPatternPreview.setGridConfig(appState.gridConfig);
  }
}


function getPatternData() {
  const animationState = appliedPatternPreview ? appliedPatternPreview.getAnimationState() : null;
  
  const data = {
    binaryPattern: appState.binaryPattern,
    colorScheme: appState.colorScheme,
    gridConfig: appState.gridConfig
  };
  
  // Include animation metadata if available
  if (animationState && animationState.direction !== null) {
    data.animation = animationState;
  }
  
  return data;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (appliedPatternPreview) {
    appliedPatternPreview.destroy();
  }
});



