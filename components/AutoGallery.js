/**
 * AutoGallery Component
 * 
 * Purpose: Auto-generate random pattern tiles with endless scroll
 * 
 * Features:
 * - Generates random patterns from options.js
 * - Endless scroll using Intersection Observer
 * - Reuses AppliedPatternPreview for rendering
 */

class AutoGallery {
  constructor(containerId, options, config = {}) {
    this.containerId = containerId;
    this.options = options;
    this.config = {
      initialBatchSize: config.initialBatchSize || 12,
      loadBatchSize: config.loadBatchSize || 8,
      scrollThreshold: config.scrollThreshold || 200,
      minColumns: config.minColumns || 3
    };
    
    // State
    this.generatedPatterns = [];
    this.previewInstances = [];
    this.isLoading = false;
    this.sentinel = null;
    this.observer = null;
    this.resizeTimeout = null;
    this.grid = null;
    this.animationsEnabled = true; // Global animation toggle state
    this.blackWhiteMode = false; // Black/white color scheme toggle state
    
    this.init();
    this.setupResizeHandler();
    this.setupKeyboardShortcuts();
  }
  
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      // Debounce resize
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if (this.grid) {
          this.arrangeMasonry(this.grid);
          this.updateSentinel(this.grid);
        }
      }, 250);
    });
  }
  
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Only handle if not typing in an input field
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      // Press 'A' key to toggle animations (case-insensitive)
      if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.toggleAnimations();
      }
      
      // Press 'B' key to toggle black/white color scheme (case-insensitive)
      if (e.key.toLowerCase() === 'b' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.toggleBlackWhite();
      }
    });
  }
  
  toggleAnimations() {
    this.animationsEnabled = !this.animationsEnabled;
    
    if (this.animationsEnabled) {
      // Re-enable animations: restore animation state from pattern data
      this.previewInstances.forEach((preview, index) => {
        const pattern = this.generatedPatterns[index];
        if (pattern && pattern.animation) {
          preview.setAnimationDirection(pattern.animation.direction);
          preview.setAnimationSpeed(pattern.animation.speed);
        }
      });
      console.log('Animations enabled (press A to disable)');
    } else {
      // Disable animations: stop all
      this.previewInstances.forEach(preview => {
        preview.stopAnimation();
      });
      console.log('Animations disabled (press A to enable)');
    }
  }
  
  toggleBlackWhite() {
    this.blackWhiteMode = !this.blackWhiteMode;
    
    const blackWhiteScheme = { 0: '#FFFFFF', 1: '#000000' };
    
    if (this.blackWhiteMode) {
      // Apply black/white color scheme to all tiles
      this.previewInstances.forEach(preview => {
        preview.setColorScheme(blackWhiteScheme);
      });
      console.log('Black/white mode enabled (press B to disable)');
    } else {
      // Restore original color schemes from pattern data
      this.previewInstances.forEach((preview, index) => {
        const pattern = this.generatedPatterns[index];
        if (pattern && pattern.colorScheme) {
          preview.setColorScheme(pattern.colorScheme);
        }
      });
      console.log('Black/white mode disabled (press B to enable)');
    }
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
    
    // Create grid container
    container.innerHTML = '<div class="gallery-grid"></div>';
    const grid = container.querySelector('.gallery-grid');
    this.grid = grid; // Store reference for resize handler
    
    // Calculate initial batch size (viewport-based or fallback)
    const initialBatchSize = this.calculateInitialBatchSize();
    
    // Generate initial batch
    const initialPatterns = this.generateBatch(initialBatchSize);
    this.generatedPatterns = [...initialPatterns];
    
    // Render initial tiles (starting at index 0)
    this.renderTiles(initialPatterns, grid, 0);
    
    // Set up scroll detection
    this.setupScrollDetection(grid);
  }
  
  calculateInitialBatchSize() {
    // Try to calculate viewport-based batch size
    try {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const estimatedTileHeight = 300; // Rough estimate
      const estimatedTileWidth = 300; // Rough estimate
      
      // Calculate how many columns we'll have
      const estimatedColumns = Math.max(this.config.minColumns, Math.floor(viewportWidth / estimatedTileWidth));
      
      // Calculate tiles needed: (viewport height * 2) / tile height * columns
      // This accounts for multiple columns needing tiles
      const tilesPerColumn = Math.ceil((viewportHeight * 2) / estimatedTileHeight);
      const tilesNeeded = tilesPerColumn * estimatedColumns;
      
      return Math.max(this.config.initialBatchSize, tilesNeeded);
    } catch (e) {
      // Fallback to fixed size
      return this.config.initialBatchSize;
    }
  }
  
  generateRandomPattern() {
    const binaryPattern = this.options.binaryPatterns[
      Math.floor(Math.random() * this.options.binaryPatterns.length)
    ];
    const colorScheme = this.options.colorSchemes[
      Math.floor(Math.random() * this.options.colorSchemes.length)
    ];
    const gridConfig = this.options.gridConfigs[
      Math.floor(Math.random() * this.options.gridConfigs.length)
    ];
    const animation = this.options.animations[
      Math.floor(Math.random() * this.options.animations.length)
    ];
    
    return {
      binaryPattern: [...binaryPattern],
      colorScheme: { ...colorScheme },
      gridConfig: { ...gridConfig },
      animation: { ...animation }
    };
  }
  
  generateBatch(count) {
    const patterns = [];
    for (let i = 0; i < count; i++) {
      patterns.push(this.generateRandomPattern());
    }
    return patterns;
  }
  
  renderTiles(patterns, grid, startIndex = null) {
    // Use provided startIndex or calculate from current pattern count
    const actualStartIndex = startIndex !== null ? startIndex : (this.generatedPatterns.length - patterns.length);
    
    // Check if we're on a small screen (would use minColumns)
    const containerWidth = grid.offsetWidth || window.innerWidth;
    const estimatedTileWidth = 300; // Rough estimate
    const wouldUseMinColumns = Math.floor(containerWidth / estimatedTileWidth) < this.config.minColumns;
    const reduceFactor = wouldUseMinColumns ? 0.5 : 1;
    
    patterns.forEach((pattern, patternIndex) => {
      const globalIndex = actualStartIndex + patternIndex;
      const containerId = `pattern-tile-${globalIndex}`;
      
      // Create tile HTML
      const tileHTML = `
        <div class="pattern-tile">
          <div class="tile-preview" id="${containerId}"></div>
        </div>
      `;
      
      grid.insertAdjacentHTML('beforeend', tileHTML);
      
      // Create AppliedPatternPreview instance
      const preview = new AppliedPatternPreview(containerId, null, {
        showControls: false,
        reduceFactor: reduceFactor
      });
      
      // Configure pattern data
      preview.setBinaryPattern(pattern.binaryPattern);
      // Apply black/white scheme if mode is enabled, otherwise use original
      const colorScheme = this.blackWhiteMode 
        ? { 0: '#FFFFFF', 1: '#000000' }
        : pattern.colorScheme;
      preview.setColorScheme(colorScheme);
      preview.setGridConfig(pattern.gridConfig);
      
      // Configure animation (only if animations are enabled)
      if (pattern.animation && this.animationsEnabled) {
        preview.setAnimationDirection(pattern.animation.direction);
        preview.setAnimationSpeed(pattern.animation.speed);
      } else if (pattern.animation && !this.animationsEnabled) {
        // Store animation config but don't start it
        preview.setAnimationDirection(pattern.animation.direction);
        preview.setAnimationSpeed(pattern.animation.speed);
        preview.stopAnimation();
      }
      
      this.previewInstances.push(preview);
    });
    
    // Arrange masonry layout after rendering (recalculate all tiles)
    setTimeout(() => {
      this.arrangeMasonry(grid);
      this.updateSentinel(grid);
    }, 150);
  }
  
  arrangeMasonry(grid) {
    const tiles = Array.from(grid.querySelectorAll('.pattern-tile'));
    if (tiles.length === 0) return;
    
    // Ensure grid has relative positioning for absolute children
    grid.style.position = 'relative';
    
    // Get container width
    const containerWidth = grid.offsetWidth || window.innerWidth;
    
    // Get base tile width from CSS (or first tile's natural width)
    const firstTile = tiles[0];
    const baseTileWidth = firstTile.offsetWidth || firstTile.getBoundingClientRect().width || 250;
    
    // Calculate number of columns that can fit
    const numColumns = Math.max(this.config.minColumns, Math.floor(containerWidth / baseTileWidth));
    
    // Calculate actual tile width to fill container exactly (no gaps)
    const actualTileWidth = containerWidth / numColumns;
    
    // Initialize column heights
    const columnHeights = new Array(numColumns).fill(0);
    
    // Position each tile in the shortest column
    tiles.forEach((tile) => {
      // Ensure absolute positioning
      tile.style.position = 'absolute';
      
      // Set tile width to fill column exactly
      tile.style.width = `${actualTileWidth}px`;
      
      // Find shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      // Calculate position
      const left = shortestColumnIndex * actualTileWidth;
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
  
  setupScrollDetection(grid) {
    // Create sentinel element
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    sentinel.style.height = '1px';
    sentinel.style.width = '1px';
    sentinel.style.position = 'absolute';
    this.sentinel = sentinel;
    
    // Add sentinel to grid
    grid.appendChild(sentinel);
    this.updateSentinel(grid);
    
    // Set up Intersection Observer
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.isLoading) {
          this.loadMore(grid);
        }
      }, {
        rootMargin: `${this.config.scrollThreshold}px`
      });
      
      this.observer.observe(sentinel);
    } else {
      // Fallback to scroll listener
      console.warn('IntersectionObserver not supported, using scroll listener');
      this.setupScrollListener(grid);
    }
  }
  
  setupScrollListener(grid) {
    let rafId = null;
    window.addEventListener('scroll', () => {
      // Throttle using requestAnimationFrame for smoother scrolling
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (this.isLoading) return;
        
        const sentinelRect = this.sentinel.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if sentinel is near viewport bottom
        if (sentinelRect.top < viewportHeight + this.config.scrollThreshold) {
          this.loadMore(grid);
        }
      });
    }, { passive: true });
  }
  
  loadMore(grid) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    // Generate new batch
    const newPatterns = this.generateBatch(this.config.loadBatchSize);
    const startIndex = this.generatedPatterns.length;
    this.generatedPatterns.push(...newPatterns);
    
    // Render new tiles
    this.renderTiles(newPatterns, grid, startIndex);
    
    this.isLoading = false;
  }
  
  updateSentinel(grid) {
    if (!this.sentinel) return;
    
    // Move sentinel to bottom of grid
    const gridHeight = grid.offsetHeight;
    this.sentinel.style.top = `${gridHeight}px`;
  }
  
  destroy() {
    // Cleanup observer
    if (this.observer && this.sentinel) {
      this.observer.unobserve(this.sentinel);
      this.observer = null;
    }
    
    // Cleanup resize handler
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Cleanup preview instances
    this.previewInstances.forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.previewInstances = [];
    
    // Remove scroll listener if used
    // (Would need to store reference to remove)
    
    this.grid = null;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoGallery;
}

