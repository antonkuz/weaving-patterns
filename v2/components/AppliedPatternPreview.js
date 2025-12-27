/**
 * AppliedPatternPreview Component (Canvas 2D)
 * 
 * Purpose: Render the final pattern using the Canvas 2D API
 * 
 * Features:
 * - Renders pattern grid based on binary pattern, color scheme, and grid config
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
    
    // Canvas
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
    
    this.init();
  }
  
  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }
    
    // Clear container
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Applied pattern preview');

    container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Canvas 2D context not available in this browser.');
      return;
    }

    this.resizeCanvasToGrid();
    this.update();

    if (this.onReady) {
      this.onReady();
    }
  }

  resizeCanvasToGrid() {
    if (!this.canvas || !this.ctx) return;

    const width = this.gridConfig.width * this.gridConfig.cellSize;
    const height = this.gridConfig.height * this.gridConfig.cellSize;

    // Handle high-DPI displays for crisp lines
    this.dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(height * this.dpr));

    // Draw in CSS pixels (scale up backing store)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  
  renderPattern() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.gridConfig.width * this.gridConfig.cellSize;
    const height = this.gridConfig.height * this.gridConfig.cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
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
      ctx.fillStyle = colorHex;
      
      // Draw cell
      const x = col * this.gridConfig.cellSize;
      const y = row * this.gridConfig.cellSize;
      ctx.fillRect(x, y, this.gridConfig.cellSize, this.gridConfig.cellSize);
    }
    
    // Draw grid lines (optional, subtle)
    ctx.strokeStyle = 'rgb(220, 220, 220)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let row = 0; row <= this.gridConfig.height; row++) {
      const y = row * this.gridConfig.cellSize + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    for (let col = 0; col <= this.gridConfig.width; col++) {
      const x = col * this.gridConfig.cellSize + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();
  }
  
  update() {
    this.renderPattern();
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
    this.resizeCanvasToGrid();
    this.update();
  }
  
  setAnimationProgress(progress) {
    this.animationProgress = progress;
    this.update();
  }
  
  setIsAnimating(isAnimating) {
    this.isAnimating = isAnimating;
    this.update();
  }
  
  // Cleanup method
  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppliedPatternPreview;
}

