/**
 * GridConfigDesigner Component (Plain JS)
 * 
 * Purpose: Configure grid dimensions and cell size
 * 
 * Features:
 * - Width control (min: 4, max: 32)
 * - Height control (min: 4, max: 32)
 * - Cell Size control (min: 5, max: 50, unit: pixels)
 * - Each control has numeric input with +/- buttons
 */

class GridConfigDesigner {
  constructor(containerId, initialConfig = null, onGridConfigChange = null) {
    this.containerId = containerId;
    this.onGridConfigChange = onGridConfigChange;
    
    // Default configuration
    this.config = initialConfig || {
      width: 8,
      height: 8,
      cellSize: 5
    };
    
    this.limits = {
      width: { min: 4, max: 32 },
      height: { min: 4, max: 32 },
      cellSize: { min: 1, max: 50 }
    };
    
    this.init();
  }
  
  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }
    
    container.innerHTML = this.render();
    this.attachEventListeners();
  }
  
  render() {
    const widthControl = this.renderControl('width', 'Width');
    const heightControl = this.renderControl('height', 'Height');
    const cellSizeControl = this.renderControl('cellSize', 'Cell Size (px)');
    
    return `
      <div class="grid-config-designer">
        <h3>Step 3: Grid Configuration</h3>
        <div class="config-controls">
          ${widthControl}
          ${heightControl}
          ${cellSizeControl}
        </div>
        <div class="config-info">
          Grid: ${this.config.width} × ${this.config.height} cells, 
          ${this.config.cellSize}px each
        </div>
      </div>
    `;
  }
  
  renderControl(key, label) {
    const value = this.config[key];
    const limit = this.limits[key];
    const canDecrement = value > limit.min;
    const canIncrement = value < limit.max;
    
    return `
      <div class="config-control">
        <label>${label}:</label>
        <div class="numeric-control">
          <button class="btn-decrement" data-key="${key}" ${!canDecrement ? 'disabled' : ''}>-</button>
          <input 
            type="number" 
            class="numeric-input" 
            data-key="${key}"
            value="${value}" 
            min="${limit.min}" 
            max="${limit.max}"
          />
          <button class="btn-increment" data-key="${key}" ${!canIncrement ? 'disabled' : ''}>+</button>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    
    // Handle decrement buttons
    container.querySelectorAll('.btn-decrement').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        this.decrement(key);
      });
    });
    
    // Handle increment buttons
    container.querySelectorAll('.btn-increment').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        this.increment(key);
      });
    });
    
    // Handle direct input changes
    container.querySelectorAll('.numeric-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const value = parseInt(e.target.value);
        this.setValue(key, value);
      });
      
      // Also handle input event for real-time updates (optional)
      input.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          this.setValue(key, value, false); // Don't update UI yet, just validate
        }
      });
    });
  }
  
  increment(key) {
    if (this.config[key] < this.limits[key].max) {
      this.config[key]++;
      this.update();
    }
  }
  
  decrement(key) {
    if (this.config[key] > this.limits[key].min) {
      this.config[key]--;
      this.update();
    }
  }
  
  setValue(key, value, updateUI = true) {
    const limit = this.limits[key];
    // Clamp value to limits
    const clampedValue = Math.max(limit.min, Math.min(limit.max, value));
    
    if (this.config[key] !== clampedValue) {
      this.config[key] = clampedValue;
      if (updateUI) {
        this.update();
      } else {
        // Just update the input value without full re-render
        const input = document.querySelector(`.numeric-input[data-key="${key}"]`);
        if (input) {
          input.value = clampedValue;
        }
      }
    }
  }
  
  update() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = this.render();
    this.attachEventListeners();
    
    // Notify parent of config change
    if (this.onGridConfigChange) {
      this.onGridConfigChange({ ...this.config });
    }
  }
  
  getConfig() {
    return { ...this.config }; // Return a copy
  }
  
  setConfig(newConfig) {
    if (newConfig && typeof newConfig === 'object') {
      // Validate and set each property
      if (newConfig.width !== undefined) {
        this.setValue('width', newConfig.width, false);
      }
      if (newConfig.height !== undefined) {
        this.setValue('height', newConfig.height, false);
      }
      if (newConfig.cellSize !== undefined) {
        this.setValue('cellSize', newConfig.cellSize, false);
      }
      this.update();
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GridConfigDesigner;
}

