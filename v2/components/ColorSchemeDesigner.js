/**
 * ColorSchemeDesigner Component (Plain JS)
 * 
 * Purpose: Select color palette for pattern rendering
 * 
 * Features:
 * - Grid/list of predefined color palette options
 * - Each palette shows 2 swatches (color 0 and color 1)
 * - Selected palette highlighted
 * - Default: Black/White palette
 */

class ColorSchemeDesigner {
  constructor(containerId, initialScheme = null, onColorSchemeChange = null) {
    this.containerId = containerId;
    this.onColorSchemeChange = onColorSchemeChange;
    
    // Default palettes (no twins - use inverse checkbox instead)
    // Darker colors come first in both name and array
    this.palettes = [
      {
        id: 'bw',
        name: 'Black & White',
        colors: { 0: '#FFFFFF', 1: '#000000' }
      },
      {
        id: 'orange-red',
        name: 'Red-Orange',
        colors: { 0: '#F27821', 1: '#8C3363' }
      },
      {
        id: 'blue-white',
        name: 'Blue & White',
        colors: { 0: '#FFFFFF', 1: '#4169E1' }
      },
      {
        id: 'teal-white',
        name: 'Teal & White',
        colors: { 0: '#FFFFFF', 1: '#5F9EA0' }
      },
      {
        id: 'green-black',
        name: 'Green & Black',
        colors: { 0: '#000000', 1: '#00FF00' }
      }
    ];
    
    // Inverse toggle state
    this.inverted = false;
    
    // Use initial scheme or default to first palette
    if (initialScheme) {
      // Try to match scheme with or without inversion
      const match = this.findPaletteIdByScheme(initialScheme);
      if (match) {
        this.selectedPaletteId = match.paletteId;
        this.inverted = match.inverted;
      } else {
        this.selectedPaletteId = this.palettes[0].id;
      }
    } else {
      this.selectedPaletteId = 'orange-red';
    }
    
    this.init();
  }
  
  findPaletteIdByScheme(scheme) {
    // Find palette that matches the given scheme (checking both normal and inverted)
    for (const palette of this.palettes) {
      // Check normal
      if (palette.colors[0] === scheme[0] && palette.colors[1] === scheme[1]) {
        return { paletteId: palette.id, inverted: false };
      }
    }
    return null;
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
    const paletteOptions = this.palettes.map(palette => {
      const isSelected = palette.id === this.selectedPaletteId;
      return `
        <div class="palette-option ${isSelected ? 'selected' : ''}" data-palette-id="${palette.id}">
          <div class="palette-swatches">
            <div class="color-swatch" style="background-color: ${palette.colors[1]}"></div>
            <div class="color-swatch" style="background-color: ${palette.colors[0]}"></div>
          </div>
          <div class="palette-name">${palette.name}</div>
          ${isSelected ? '<div class="checkmark">✓</div>' : ''}
        </div>
      `;
    }).join('');
    
    const currentScheme = this.getColorScheme();
    
    return `
      <div class="color-scheme-designer">
        <h3>Step 2: Color Scheme Designer</h3>
        <div class="palettes-grid">
          ${paletteOptions}
        </div>
        <div class="inverse-control">
          <label>
            <input type="checkbox" class="inverse-checkbox" ${this.inverted ? 'checked' : ''}>
            Inverse colors
          </label>
        </div>
        <div class="scheme-info">
          Selected: ${currentScheme[0]} / ${currentScheme[1]}
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    
    container.querySelectorAll('.palette-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const paletteId = e.currentTarget.dataset.paletteId;
        this.selectPalette(paletteId);
      });
    });
    
    // Handle inverse checkbox
    const inverseCheckbox = container.querySelector('.inverse-checkbox');
    if (inverseCheckbox) {
      inverseCheckbox.addEventListener('change', (e) => {
        this.inverted = e.target.checked;
        this.update();
      });
    }
  }
  
  selectPalette(paletteId) {
    const palette = this.palettes.find(p => p.id === paletteId);
    if (palette) {
      this.selectedPaletteId = paletteId;
      this.update();
    }
  }
  
  update() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = this.render();
    this.attachEventListeners();
    
    // Notify parent of scheme change
    if (this.onColorSchemeChange) {
      this.onColorSchemeChange(this.getColorScheme());
    }
  }
  
  getColorScheme() {
    const palette = this.palettes.find(p => p.id === this.selectedPaletteId);
    if (!palette) {
      return { 0: '#FFFFFF', 1: '#000000' };
    }
    
    // Return inverted colors if inverse is checked
    if (this.inverted) {
      return { 0: palette.colors[1], 1: palette.colors[0] };
    }
    return { ...palette.colors };
  }
  
  setColorScheme(scheme) {
    const match = this.findPaletteIdByScheme(scheme);
    if (match) {
      this.selectedPaletteId = match.paletteId;
      this.inverted = match.inverted;
      this.update();
    }
  }
  
  // Method to add more palettes (can be called externally)
  addPalette(id, name, colors) {
    this.palettes.push({ id, name, colors });
    this.update();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorSchemeDesigner;
}

