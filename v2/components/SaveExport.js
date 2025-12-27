/**
 * SaveExport Component (Plain JS)
 * 
 * Purpose: Export pattern configuration as JSON
 * 
 * Features:
 * - "Save Pattern" button
 * - Toggles visibility of JSON export section
 * - Displays formatted JSON in markdown code block
 * - JSON is copyable
 */

class SaveExport {
  constructor(containerId, getPatternData = null) {
    this.containerId = containerId;
    this.getPatternData = getPatternData; // Function that returns current pattern data
    this.isVisible = false;
    
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
    const exportSection = this.isVisible ? this.renderExportSection() : '';
    
    return `
      <div class="save-export">
        <h3>Export</h3>
        <button class="btn-save-pattern">Save Pattern</button>
        ${exportSection}
      </div>
    `;
  }
  
  renderExportSection() {
    const patternData = this.getPatternData ? this.getPatternData() : this.getDefaultPatternData();
    const jsonString = JSON.stringify(patternData, null, 2);
    
    return `
      <div class="export-section">
        <div class="export-label">Pattern Configuration (JSON):</div>
        <pre class="json-output"><code class="language-json">${this.escapeHtml(jsonString)}</code></pre>
        <div class="export-hint">Click and drag to select, then copy (Cmd+C / Ctrl+C)</div>
      </div>
    `;
  }
  
  attachEventListeners() {
    const container = document.getElementById(this.containerId);
    const saveButton = container.querySelector('.btn-save-pattern');
    
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.toggleExport();
      });
    }
  }
  
  toggleExport() {
    this.isVisible = !this.isVisible;
    this.update();
  }
  
  update() {
    const container = document.getElementById(this.containerId);
    container.innerHTML = this.render();
    this.attachEventListeners();
  }
  
  getDefaultPatternData() {
    return {
      binaryPattern: [0, 1, 0, 1],
      colorScheme: {
        "0": "#FFFFFF",
        "1": "#000000"
      },
      gridConfig: {
        width: 8,
        height: 8,
        cellSize: 50
      }
    };
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Method to update the getPatternData function
  setGetPatternData(fn) {
    this.getPatternData = fn;
    if (this.isVisible) {
      this.update();
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SaveExport;
}

