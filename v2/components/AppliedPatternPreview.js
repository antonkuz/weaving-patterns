/**
 * AppliedPatternPreview Component (Canvas 2D)
 * 
 * Purpose: Render the final pattern using the Canvas 2D API
 * 
 * Features:
 * - Renders pattern grid based on binary pattern, color scheme, and grid config
 */

class AppliedPatternPreview {
  constructor(containerId, onReady = null, options = {}) {
    this.containerId = containerId;
    this.onReady = onReady;
    
    // State
    this.binaryPattern = [1, 1, 0, 1, 1, 1, 0];
    this.colorScheme = { 0: '#F27821', 1: '#8C3363' };
    this.gridConfig = { width: 7, height: 1, cellSize: 50 };
    
    // Animation state
    this.animation = {
      isActive: false,
      direction: null,        // 'up' | 'down' | 'left' | 'right' | null
      speed: 5,              // Cells per second (0-20)
      offsetX: 0,            // Current X offset (discrete steps)
      offsetY: 0,            // Current Y offset (discrete steps)
      lastUpdateTime: 0,     // Timestamp of last update
      animationInterval: null // setInterval reference for cleanup
    };
    
    // Canvas
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
    
    // Controls visibility (default true for backward compatibility)
    this.showControls = options.showControls !== undefined ? options.showControls : true;
    
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

    // Create wrapper for canvas and controls
    const wrapper = document.createElement('div');
    wrapper.className = 'preview-wrapper';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Applied pattern preview');

    wrapper.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Canvas 2D context not available in this browser.');
      return;
    }

    // Add animation controls if enabled
    if (this.showControls) {
      const controlsHTML = this.renderAnimationControls();
      wrapper.insertAdjacentHTML('beforeend', controlsHTML);
    }

    container.appendChild(wrapper);

    this.resizeCanvasToGrid();
    this.update();
    
    if (this.showControls) {
      this.attachAnimationEventListeners();
    }

    if (this.onReady) {
      this.onReady();
    }
  }

  renderAnimationControls() {
    const direction = this.animation.direction;
    const speed = this.animation.speed;
    
    return `
      <div class="animation-controls">
        <div class="direction-controls">
          <button class="dir-btn ${direction === 'up' ? 'active' : ''}" data-direction="up">↑</button>
          <div class="direction-row">
            <button class="dir-btn ${direction === 'left' ? 'active' : ''}" data-direction="left">←</button>
            <button class="dir-btn ${direction === null ? 'active' : ''}" data-direction="stop">●</button>
            <button class="dir-btn ${direction === 'right' ? 'active' : ''}" data-direction="right">→</button>
          </div>
          <button class="dir-btn ${direction === 'down' ? 'active' : ''}" data-direction="down">↓</button>
        </div>
        <div class="speed-control">
          <label for="speed-slider">Speed:</label>
          <input type="range" id="speed-slider" class="speed-slider" min="0" max="20" value="${speed}" step="1">
          <span class="speed-value">${speed} cells/sec</span>
        </div>
      </div>
    `;
  }
  
  attachAnimationEventListeners() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Direction buttons
    const dirButtons = container.querySelectorAll('.dir-btn');
    dirButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const direction = e.target.dataset.direction;
        if (direction === 'stop') {
          this.setAnimationDirection(null);
        } else {
          this.setAnimationDirection(direction);
        }
      });
    });
    
    // Speed slider
    const speedSlider = container.querySelector('#speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        this.setAnimationSpeed(speed);
        this.updateSpeedDisplay(speed);
      });
    }
  }
  
  updateAnimationControls() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Update direction button states
    const dirButtons = container.querySelectorAll('.dir-btn');
    dirButtons.forEach(btn => {
      const btnDirection = btn.dataset.direction;
      if (btnDirection === 'stop' && this.animation.direction === null) {
        btn.classList.add('active');
      } else if (btnDirection === this.animation.direction) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  updateSpeedDisplay(speed) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const speedValue = container.querySelector('.speed-value');
    if (speedValue) {
      speedValue.textContent = `${speed} cells/sec`;
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
    
    for (let i = 0; i < maxCells; i++) {
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
  }
  
  update() {
    // Use animated render if animation is active, otherwise use simple render
    if (this.animation.isActive) {
      this.renderPatternWithAnimation();
    } else {
      this.renderPattern();
    }
  }
  
  renderPatternWithAnimation() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const width = this.gridConfig.width * this.gridConfig.cellSize;
    const height = this.gridConfig.height * this.gridConfig.cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    const maxCells = this.gridConfig.width * this.gridConfig.height;
    
    for (let i = 0; i < maxCells; i++) {
      const row = Math.floor(i / this.gridConfig.width);
      const col = i % this.gridConfig.width;
      
      // Apply animation offsets
      const adjustedRow = row + this.animation.offsetY;
      const adjustedCol = col + this.animation.offsetX;
      
      // Calculate pattern index with wrapping
      let patternIndex = (adjustedRow * this.gridConfig.width + adjustedCol) % this.binaryPattern.length;
      // Handle negative modulo results
      if (patternIndex < 0) {
        patternIndex += this.binaryPattern.length;
      }
      const patternValue = this.binaryPattern[patternIndex];
      
      // Get color for this pattern value
      const colorHex = this.colorScheme[patternValue] || '#000000';
      ctx.fillStyle = colorHex;
      
      // Draw cell
      const x = col * this.gridConfig.cellSize;
      const y = row * this.gridConfig.cellSize;
      ctx.fillRect(x, y, this.gridConfig.cellSize, this.gridConfig.cellSize);
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
    this.resizeCanvasToGrid();
    this.update();
  }
  
  setShowControls(show) {
    this.showControls = show;
    
    // If component is already initialized, update controls visibility
    const container = document.getElementById(this.containerId);
    if (container) {
      const wrapper = container.querySelector('.preview-wrapper');
      if (wrapper) {
        const controlsContainer = wrapper.querySelector('.animation-controls');
        
        if (show && !controlsContainer) {
          // Controls should be shown but don't exist - add them
          const controlsHTML = this.renderAnimationControls();
          wrapper.insertAdjacentHTML('beforeend', controlsHTML);
          this.attachAnimationEventListeners();
        } else if (!show && controlsContainer) {
          // Controls should be hidden but exist - remove them
          controlsContainer.remove();
        }
      }
    }
  }
  
  // Get animation state for export
  getAnimationState() {
    return {
      direction: this.animation.direction,
      speed: this.animation.speed
    };
  }
  
  // Animation control methods
  setAnimationDirection(direction) {
    // direction: 'up' | 'down' | 'left' | 'right' | null
    const wasActive = this.animation.isActive;
    
    // Stop current animation if running
    if (wasActive) {
      this.stopAnimation();
    }
    
    // Update direction
    this.animation.direction = direction;
    
    // Reset offsets when direction changes
    this.animation.offsetX = 0;
    this.animation.offsetY = 0;
    
    // Restart animation if a direction is set
    if (direction !== null) {
      this.startAnimation();
    }
    
    this.updateAnimationControls();
    this.update();
  }
  
  setAnimationSpeed(speed) {
    // speed: 0-20 cells per second
    const clampedSpeed = Math.max(0, Math.min(20, speed));
    this.animation.speed = clampedSpeed;
    
    // If animation is active, restart with new speed
    if (this.animation.isActive) {
      this.stopAnimation();
      this.startAnimation();
    }
  }
  
  startAnimation() {
    if (this.animation.direction === null || this.animation.speed === 0) {
      return;
    }
    
    // Stop any existing animation
    this.stopAnimation();
    
    this.animation.isActive = true;
    this.animation.lastUpdateTime = Date.now();
    
    // Calculate step interval in milliseconds
    const stepInterval = 1000 / this.animation.speed;
    
    // Start animation loop
    this.animation.animationInterval = setInterval(() => {
      this.updateAnimation();
    }, stepInterval);
  }
  
  stopAnimation() {
    if (this.animation.animationInterval) {
      clearInterval(this.animation.animationInterval);
      this.animation.animationInterval = null;
    }
    this.animation.isActive = false;
  }
  
  updateAnimation() {
    if (!this.animation.isActive || this.animation.direction === null) {
      return;
    }
    
    // Update offset based on direction (discrete step)
    switch (this.animation.direction) {
      case 'right':
        this.animation.offsetX--;
        break;
      case 'left':
        this.animation.offsetX++;
        break;
      case 'down':
        this.animation.offsetY--;
        break;
      case 'up':
        this.animation.offsetY++;
        break;
    }
    
    // Redraw with new offsets
    this.update();
  }
  
  // Cleanup method
  destroy() {
    // Stop animation before cleanup
    this.stopAnimation();
    
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

