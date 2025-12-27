/**
 * BinaryPatternDesigner Component (Plain JS)
 * 
 * Purpose: Design the binary pattern (minimal repeating unit)
 * 
 * Features:
 * - 1x4 row of clickable squares (default: 4 squares, min 2, max 16)
 * - Squares toggle between 0 (off) and 1 (on) on click
 * - "Add" button: appends a new square (defaults to 0)
 * - "Delete Last" button: removes the last square
 */

class BinaryPatternDesigner {
  constructor(containerId, initialPattern = [0, 1, 0, 1], onPatternChange = null) {
    this.containerId = containerId;
    this.pattern = [...initialPattern]; // Clone to avoid mutation
    this.onPatternChange = onPatternChange;
    this.minLength = 2;
    this.maxLength = 16;
    
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
    const squares = this.pattern.map((value, index) => 
      `<button class="pattern-square" data-index="${index}" data-value="${value}">
        ${value === 1 ? '1' : '0'}
      </button>`
    ).join('');
    
    const canAdd = this.pattern.length < this.maxLength;
    const canDelete = this.pattern.length > this.minLength;
    
    return `
      <div class="binary-pattern-designer">
        <h3>Step 1: Binary Pattern Designer</h3>
        <div class="pattern-squares-container">
          ${squares}
        </div>
        <div class="pattern-controls">
          <button class="btn-add" ${!canAdd ? 'disabled' : ''}>+ Add</button>
          <button class="btn-delete" ${!canDelete ? 'disabled' : ''}>- Delete Last</button>
        </div>
        <div class="pattern-info">
          Pattern: [${this.pattern.join(', ')}] (${this.pattern.length} squares)
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    
    // Handle square clicks (toggle value)
    container.querySelectorAll('.pattern-square').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.toggleSquare(index);
      });
    });
    
    // Handle Add button
    container.querySelector('.btn-add').addEventListener('click', () => {
      this.addSquare();
    });
    
    // Handle Delete button
    const deleteBtn = container.querySelector('.btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.deleteLastSquare();
      });
    }
  }
  
  toggleSquare(index) {
    if (index >= 0 && index < this.pattern.length) {
      this.pattern[index] = this.pattern[index] === 1 ? 0 : 1;
      this.update();
    }
  }
  
  addSquare() {
    if (this.pattern.length < this.maxLength) {
      this.pattern.push(0); // Add new square with value 0
      this.update();
    }
  }
  
  deleteLastSquare() {
    if (this.pattern.length > this.minLength) {
      this.pattern.pop();
      this.update();
    }
  }
  
  update() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = this.render();
    this.attachEventListeners();
    
    // Notify parent of pattern change
    if (this.onPatternChange) {
      this.onPatternChange([...this.pattern]);
    }
  }
  
  getPattern() {
    return [...this.pattern]; // Return a copy
  }
  
  setPattern(newPattern) {
    if (Array.isArray(newPattern) && 
        newPattern.length >= this.minLength && 
        newPattern.length <= this.maxLength &&
        newPattern.every(v => v === 0 || v === 1)) {
      this.pattern = [...newPattern];
      this.update();
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BinaryPatternDesigner;
}

