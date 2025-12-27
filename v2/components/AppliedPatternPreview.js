/**
 * AppliedPatternPreview Component (p5.js)
 * 
 * Purpose: Render the final pattern using p5.js
 * 
 * Features:
 * - Renders pattern grid based on binary pattern, color scheme, and grid config
 * - Uses p5.js instance mode
 * - Handles animation progress (when isAnimating is true)
 */

class AppliedPatternPreview {
  constructor(containerId, onReady = null) {
    this.containerId = containerId;
    this.onReady = onReady;
    
    // State
    this.binaryPattern = [0, 1, 0, 1];
    this.colorScheme = { 0: '#FFFFFF', 1: '#000000' };
    this.gridConfig = { width: 7, height: 8, cellSize: 50 };
    this.animationProgress = 0;
    this.isAnimating = false;
    
    this.p5Instance = null;
    this.sketch = null;
    
    this.init();
  }
  
  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }
    
    // Clear container
    container.innerHTML = '<div id="p5-sketch-container"></div>';
    
    // Create p5.js sketch in instance mode
    this.createSketch();
    
    const sketchContainer = document.getElementById('p5-sketch-container');
    if (sketchContainer && typeof p5 !== 'undefined') {
      this.p5Instance = new p5(this.sketch, sketchContainer);
      
      if (this.onReady) {
        this.onReady();
      }
    } else {
      console.error('p5.js library not loaded. Make sure to include p5.js before this component.');
    }
  }
  
  createSketch() {
    const self = this;
    
    this.sketch = function(p) {
      p.setup = function() {
        const width = self.gridConfig.width * self.gridConfig.cellSize;
        const height = self.gridConfig.height * self.gridConfig.cellSize;
        p.createCanvas(width, height);
        p.noLoop(); // Don't continuously redraw unless needed
      };
      
      p.draw = function() {
        self.renderPattern(p);
      };
    };
  }
  
  renderPattern(p) {
    // Clear canvas
    p.background(255);
    
    const maxCells = this.gridConfig.width * this.gridConfig.height;
    const cellsToRender = this.isAnimating ? 
      Math.min(this.animationProgress + 1, maxCells) : 
      maxCells;
    
    for (let i = 0; i < cellsToRender; i++) {
      const row = Math.floor(i / this.gridConfig.width);
      const col = i % this.gridConfig.width;
      
      // Calculate pattern index
      const patternIndex = i % this.binaryPattern.length;
      const patternValue = this.binaryPattern[patternIndex];
      
      // Get color for this pattern value
      const colorHex = this.colorScheme[patternValue] || '#000000';
      const color = p.color(colorHex);
      p.fill(color);
      p.noStroke();
      
      // Draw cell
      const x = col * this.gridConfig.cellSize;
      const y = row * this.gridConfig.cellSize;
      p.rect(x, y, this.gridConfig.cellSize, this.gridConfig.cellSize);
    }
    
    // Draw grid lines (optional, subtle)
    p.stroke(220);
    p.strokeWeight(1);
    p.noFill();
    for (let row = 0; row <= this.gridConfig.height; row++) {
      const y = row * this.gridConfig.cellSize;
      p.line(0, y, this.gridConfig.width * this.gridConfig.cellSize, y);
    }
    for (let col = 0; col <= this.gridConfig.width; col++) {
      const x = col * this.gridConfig.cellSize;
      p.line(x, 0, x, this.gridConfig.height * this.gridConfig.cellSize);
    }
  }
  
  update() {
    if (this.p5Instance && this.p5Instance.redraw) {
      this.p5Instance.redraw();
    }
  }
  
  // Update methods
  setBinaryPattern(pattern) {
    this.binaryPattern = [...pattern];
    this.update();
  }
  
  setColorScheme(scheme) {
    this.colorScheme = { ...scheme };
    this.update();
  }
  
  setGridConfig(config) {
    this.gridConfig = { ...config };
    // Need to recreate canvas with new size
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
    this.init();
  }
  
  setAnimationProgress(progress) {
    this.animationProgress = progress;
    this.update();
  }
  
  setIsAnimating(isAnimating) {
    this.isAnimating = isAnimating;
    if (this.isAnimating && this.p5Instance) {
      // Start animation loop
      this.p5Instance.loop();
    } else if (this.p5Instance) {
      this.p5Instance.noLoop();
      this.update();
    }
  }
  
  // Cleanup method
  destroy() {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppliedPatternPreview;
}

