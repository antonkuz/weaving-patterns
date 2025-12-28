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
  constructor(containerId, initialConfig = null, onGridConfigChange = null, getBinaryPatternLength = null) {
    this.containerId = containerId;
    this.onGridConfigChange = onGridConfigChange;
    this.getBinaryPatternLength = getBinaryPatternLength;
    
    // Default configuration
    this.config = initialConfig || {
      width: 7,
      height: 1,
      cellSize: 50
    };
    
    this.limits = {
      width: { min: 4, max: 32 },
      height: { min: 1, max: 32 },
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
        <div class="preset-buttons">
          <button class="btn-preset" data-preset="minimal">Minimal View</button>
          <button class="btn-preset" data-preset="25x25">25×25</button>
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
          <div class="slider-container">
            <input 
              type="range" 
              class="numeric-slider" 
              data-key="${key}"
              value="${value}" 
              min="${limit.min}" 
              max="${limit.max}"
            />
            <span class="slider-value" data-key="${key}">${value}</span>
          </div>
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
    
    // Handle slider changes
    container.querySelectorAll('.numeric-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
          // Update value and trigger callback without full re-render
          const limit = this.limits[key];
          const clampedValue = Math.max(limit.min, Math.min(limit.max, value));
          
          if (this.config[key] !== clampedValue) {
            this.config[key] = clampedValue;
            // Update the displayed value
            const valueDisplay = container.querySelector(`.slider-value[data-key="${key}"]`);
            if (valueDisplay) {
              valueDisplay.textContent = clampedValue;
            }
            // Trigger callback to update preview
            if (this.onGridConfigChange) {
              this.onGridConfigChange({ ...this.config });
            }
          }
        }
      });
      
      slider.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const value = parseInt(e.target.value);
        this.setValue(key, value);
      });
    });
    
    // Handle preset buttons
    container.querySelectorAll('.btn-preset').forEach(button => {
      button.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }
  
  applyPreset(preset) {
    if (preset === 'minimal') {
      const patternLength = this.getBinaryPatternLength ? this.getBinaryPatternLength() : 7;
      this.setConfig({
        width: patternLength,
        height: 1,
        cellSize: 50
      });
    } else if (preset === '25x25') {
      this.setConfig({
        width: 25,
        height: 25,
        cellSize: 15
      });
    }
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
        // Just update the slider and value display without full re-render
        const container = document.getElementById(this.containerId);
        const slider = container.querySelector(`.numeric-slider[data-key="${key}"]`);
        const valueDisplay = container.querySelector(`.slider-value[data-key="${key}"]`);
        if (slider) {
          slider.value = clampedValue;
        }
        if (valueDisplay) {
          valueDisplay.textContent = clampedValue;
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

