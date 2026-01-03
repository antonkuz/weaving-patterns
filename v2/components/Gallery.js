/**
 * Gallery Component
 * 
 * Purpose: Display patterns in a grid layout
 * 
 * Features:
 * - Renders grid of pattern tiles
 * - Each tile uses AppliedPatternPreview for rendering
 * - Supports animated previews
 */

class Gallery {
  constructor(containerId, patterns) {
    this.containerId = containerId;
    this.patterns = patterns || [];
    this.previewInstances = []; // Store all AppliedPatternPreview instances
    this.resizeTimeout = null;
    
    this.init();
    this.setupResizeHandler();
  }
  
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      // Debounce resize
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        const grid = document.querySelector('.gallery-grid');
        if (grid) {
          this.arrangeMasonry(grid);
        }
      }, 250);
    });
  }
  
  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }
    
    this.render();
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Render grid with masonry layout
    container.innerHTML = `<div class="gallery-grid"></div>`;
    const grid = container.querySelector('.gallery-grid');
    
    // Initialize AppliedPatternPreview instances first to get actual heights
    // Then arrange in masonry layout
    this.initializePreviews(() => {
      this.arrangeMasonry(grid);
    });
  }
  
  arrangeMasonry(grid) {
    const tiles = Array.from(grid.querySelectorAll('.pattern-tile'));
    if (tiles.length === 0) return;
    
    // No gap - tiles touch each other
    const gap = 0;
    
    // Calculate number of columns based on container width
    const containerWidth = grid.offsetWidth;
    const tileWidth = tiles[0].offsetWidth || 250;
    const numColumns = Math.max(1, Math.floor(containerWidth / tileWidth));
    
    // Initialize column heights
    const columnHeights = new Array(numColumns).fill(0);
    
    // Position each tile in the shortest column
    tiles.forEach((tile) => {
      // Reset position styles
      tile.style.position = 'absolute';
      
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate position
      const left = shortestColumnIndex * tileWidth;
      const top = columnHeights[shortestColumnIndex];
      
      // Position tile
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
      
      // Update column height (use actual rendered height)
      const tileHeight = tile.offsetHeight || tile.getBoundingClientRect().height;
      columnHeights[shortestColumnIndex] += tileHeight;
    });
    
    // Set container height to accommodate all tiles
    const maxHeight = Math.max(...columnHeights);
    grid.style.height = `${maxHeight}px`;
  }
  
  renderTile(pattern, index) {
    const containerId = `pattern-tile-${index}`;
    
    return `
      <div class="pattern-tile">
        <div class="tile-preview" id="${containerId}"></div>
      </div>
    `;
  }
  
  getPatternName(binaryPattern) {
    return binaryPattern.join(',');
  }
  
  initializePreviews(onComplete = null) {
    // Clear existing instances
    this.previewInstances = [];
    
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    
    // Render all tiles first
    const gridHTML = this.patterns.map((pattern, index) => {
      return this.renderTile(pattern, index);
    }).join('');
    
    grid.innerHTML = gridHTML;
    
    // Create AppliedPatternPreview instance for each pattern
    let initialized = 0;
    const total = this.patterns.length;
    
    this.patterns.forEach((pattern, index) => {
      const containerId = `pattern-tile-${index}`;
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        initialized++;
        if (initialized === total && onComplete) {
          onComplete();
        }
        return;
      }
      
      // Create AppliedPatternPreview instance without controls
      const preview = new AppliedPatternPreview(containerId, null, {
        showControls: false
      });
      
      // Configure pattern data after instance is created
      preview.setBinaryPattern(pattern.binaryPattern);
      preview.setColorScheme(pattern.colorScheme);
      preview.setGridConfig(pattern.gridConfig);
      
      // Configure animation if present
      if (pattern.animation) {
        preview.setAnimationDirection(pattern.animation.direction);
        preview.setAnimationSpeed(pattern.animation.speed);
      }
      
      this.previewInstances.push(preview);
      
      // Wait for canvas to render before measuring
      setTimeout(() => {
        initialized++;
        if (initialized === total && onComplete) {
          // Small delay to ensure all layouts are complete
          setTimeout(() => onComplete(), 50);
        }
      }, 100);
    });
  }
  
  destroy() {
    // Cleanup resize handler
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Cleanup all AppliedPatternPreview instances
    this.previewInstances.forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.previewInstances = [];
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gallery;
}

