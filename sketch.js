// p5.js sketch for weave pattern viewer

// Pattern class
class Pattern {
  constructor(name, patternArray) {
    this.name = name;
    this.pattern = patternArray;
    this.lastLogTime = 0; // For rate limiting console logs
  }
  
  getCellValue(row, col, numCols, shiftMode = 'right', offset = 0) {
    // Based on twill weave algorithm: shift each row by one position
    // shiftMode='right': (col - row) creates shift right behavior
    // shiftMode='left': (col + row) creates shift left behavior
    // shiftMode='none': (row*numCols + col + offset) creates no shift, pattern repeats as-is (with animation offset)
    let patternIndex;
    if (shiftMode === 'right') {
      patternIndex = (col - row) % this.pattern.length;
      // Handle negative modulo results
      if (patternIndex < 0) {
        patternIndex += this.pattern.length;
      }
    } else if (shiftMode === 'left') {
      patternIndex = (col + row) % this.pattern.length;
    } else if (shiftMode === 'none') {
      let finalOffset = offset;
      // if (millis() % 50 == 0) {
      //   finalOffset = Math.floor(Math.random() * 5); // Random between 0 and 4
      // }
      patternIndex = (row * numCols + col + finalOffset) % this.pattern.length;
      // Handle negative modulo results
      if (patternIndex < 0) {
        patternIndex += this.pattern.length;
      }
    } else {
      // Default to right
      patternIndex = (col - row) % this.pattern.length;
      if (patternIndex < 0) {
        patternIndex += this.pattern.length;
      }
    }
    return this.pattern[patternIndex];
  }
  
  draw(x, y, size, numRows, numCols, shiftMode = 'right', orientation = 'horizontal', inverted = false, colorScheme = 'bw', offset = 0, invertEvenRows = false) {
    // Calculate cell size based on dimensions (using numCols for width calculation)
    let cellSize = size / numCols;
    
    // Build 2D array to store grid values
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      grid[i] = [];
    }
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        // Swap row and col for vertical orientation
        let patternRow = orientation === 'vertical' ? col : row;
        let patternCol = orientation === 'vertical' ? row : col;
        
        let cellValue = this.getCellValue(patternRow, patternCol, numCols, shiftMode, offset || 0);
        
        // Invert even rows if enabled (1 becomes 0, 0 becomes 1)
        if (invertEvenRows && row % 2 === 0) {
          cellValue = cellValue === 1 ? 0 : 1;
        }
        
        // Store cell value in grid array
        grid[row][col] = cellValue;
        
        // Set fill color based on cell value, color scheme, and optional inversion
        if (colorScheme === 'orange-red') {
          // Orange-Red/Dark Red-Purple color scheme
          if (cellValue === 1) {
            // Dark Red/Purple for inner pattern: #8C3363 (140, 51, 99)
            fill(inverted ? 242 : 140, inverted ? 120 : 51, inverted ? 33 : 99);
          } else {
            // Orange-Red for outer/border: #F27821 (242, 120, 33)
            fill(inverted ? 140 : 242, inverted ? 51 : 120, inverted ? 99 : 33);
          }
        } else {
          // Default black/white color scheme
          let fillColor;
          if (cellValue === 1) {
            fillColor = inverted ? 255 : 0; // Black for warp up (or white if inverted)
          } else {
            fillColor = inverted ? 0 : 255; // White for weft up (or black if inverted)
          }
          fill(fillColor);
        }
        
        // // Set faded gray borders
        // stroke(200, 200, 200);
        // strokeWeight(1);
        
        // Calculate position (always use original row/col for drawing position)
        let cellX = x + col * cellSize;
        let cellY = y + row * cellSize;
        
        // Draw the cell
        rect(cellX, cellY, cellSize, cellSize);
      }
    }
    
    // // Log grid as 2D array (rate limited to once per 5000ms)
    // let currentTime = millis();
    // if (currentTime - this.lastLogTime >= 5000) {
    //   console.log('Grid for pattern:', this.name);
    //   // Convert grid to string format
    //   let gridString = grid.map(row => row.join('')).join('\n');
    //   console.log(gridString);
    //   this.lastLogTime = currentTime;
    // }
  }
}

// Gallery class
class Gallery {
  constructor(patterns) {
    this.patterns = patterns;
    this.viewMode = 'gallery'; // 'gallery' or 'detail'
    this.selectedPatternIndex = 0;
    this.thumbnailSize = 400;
    this.gridSize = 8; // Initial value, will be updated from slider
    this.sizeSlider = null;
    this.sizeLabel = null;
    this.shiftMode = 'none'; // 'right', 'left', 'none', or future modes
    this.shiftModes = ['right', 'left', 'none']; // Array of shift modes to cycle through
    this.shiftButton = null;
    this.orientation = 'horizontal'; // 'horizontal' or future orientations
    this.orientationButton = null;
    this.inverted = false; // Color inversion toggle
    this.invertButton = null;
    this.colorScheme = 'orange-red'; // 'bw' or 'orange-red'
    this.colorSchemeButton = null;
    this.animationMode = null; // null, 'right', or 'left'
    this.animationButton = null;
    this.animationOffset = 0; // Offset counter for animation
    this.lastAnimationTime = 0; // Track last animation update time
  }
  
  setup() {
    // Create slider for grid size (min: 4, max: 16, default: 16)
    this.sizeSlider = createSlider(4, 64, 16);
    this.sizeSlider.position(10, 10);
    this.sizeSlider.style('width', '200px');
    
    // Create label to show slider value (will be updated in draw)
    this.sizeLabel = createP('Grid Size: 16');
    this.sizeLabel.position(220, -5);
    this.sizeLabel.style('color', '#000');
    this.sizeLabel.style('font-family', 'monospace');
    this.sizeLabel.style('font-size', '14px');
    
    // Create button for shift mode that cycles through options
    this.shiftButton = createButton('Shift Mode: None');
    this.shiftButton.position(340, 10);
    this.shiftButton.mousePressed(() => {
      // Cycle to next shift mode
      let currentIndex = this.shiftModes.indexOf(this.shiftMode);
      let nextIndex = (currentIndex + 1) % this.shiftModes.length;
      this.shiftMode = this.shiftModes[nextIndex];
      // Update button label
      this.shiftButton.html('Shift Mode: ' + this.shiftMode.charAt(0).toUpperCase() + this.shiftMode.slice(1));
    });
    
    // Create button for orientation that cycles between horizontal and vertical
    this.orientationButton = createButton('Orientation: Horizontal');
    this.orientationButton.position(470, 10);
    this.orientationButton.mousePressed(() => {
      // Toggle between horizontal and vertical
      this.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      // Update button label
      this.orientationButton.html('Orientation: ' + this.orientation.charAt(0).toUpperCase() + this.orientation.slice(1));
    });
    
    // Create button for color inversion toggle
    this.invertButton = createButton('Invert: Off');
    this.invertButton.position(630, 10);
    this.invertButton.mousePressed(() => {
      // Toggle inversion
      this.inverted = !this.inverted;
      // Update button label
      this.invertButton.html('Invert: ' + (this.inverted ? 'On' : 'Off'));
    });
    
    // Create button for color scheme toggle
    this.colorSchemeButton = createButton('Colors: Orange-Red');
    this.colorSchemeButton.position(730, 10);
    this.colorSchemeButton.mousePressed(() => {
      // Toggle between black/white and orange-red color schemes
      this.colorScheme = this.colorScheme === 'bw' ? 'orange-red' : 'bw';
      // Update button label
      let label = this.colorScheme === 'bw' ? 'B/W' : 'Orange-Red';
      this.colorSchemeButton.html('Colors: ' + label);
    });
    
    // Create button for invert even rows toggle
    this.invertEvenRowsButton = createButton('Invert Even Rows: Off');
    this.invertEvenRowsButton.position(850, 10);
    this.invertEvenRowsButton.mousePressed(() => {
      // Toggle invert even rows
      this.invertEvenRows = !this.invertEvenRows;
      // Update button label
      this.invertEvenRowsButton.html('Invert Even Rows: ' + (this.invertEvenRows ? 'On' : 'Off'));
    });
    
    // Create button for animation mode (cycles: Off -> Right -> Left -> Off)
    this.animationButton = createButton('Animation: Off');
    this.animationButton.position(1000, 10);
    this.animationButton.mousePressed(() => {
      // Cycle through animation modes: null -> 'right' -> 'left' -> null
      if (this.animationMode === null) {
        this.animationMode = 'right';
      } else if (this.animationMode === 'right') {
        this.animationMode = 'left';
      } else {
        this.animationMode = null;
      }
      // Update button label
      let label = this.animationMode ? this.animationMode.charAt(0).toUpperCase() + this.animationMode.slice(1) : 'Off';
      this.animationButton.html('Animation: ' + label);
      // Reset offset when changing mode
      this.animationOffset = 0;
    });
    
    // Create button for shuffling patterns
    this.shuffleButton = createButton('Shuffle');
    this.shuffleButton.position(1120, 10);
    this.shuffleButton.mousePressed(() => {
      this.shufflePatterns();
    });
  }
  
  shufflePatterns() {
    // Fisher-Yates shuffle algorithm
    for (let i = this.patterns.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.patterns[i], this.patterns[j]] = [this.patterns[j], this.patterns[i]];
    }
    // Reset selected pattern index to 0 after shuffle
    this.selectedPatternIndex = 0;
  }
  
  draw() {
    // Get current grid size from slider
    this.gridSize = this.sizeSlider.value();
    
    // Update slider value label
    this.sizeLabel.html('Grid Size: ' + this.gridSize);
    
    // Update animation offset based on mode (every 200ms)
    if (this.animationMode === 'right') {
      let currentTime = millis();
      if (currentTime - this.lastAnimationTime >= 200) {
        this.animationOffset++;
        this.lastAnimationTime = currentTime;
      }
    } else if (this.animationMode === 'left') {
      let currentTime = millis();
      if (currentTime - this.lastAnimationTime >= 200) {
        this.animationOffset--;
        this.lastAnimationTime = currentTime;
      }
    } else {
      this.animationOffset = 0;
    }
    
    // Set sepia background
    background(238, 203, 173);
    
    if (this.viewMode === 'gallery') {
      this.drawGallery();
    } else {
      this.drawDetail();
    }
  }
  
  getThumbnailsPerRow() {
    let thumbnailSpacing = 20;
    let startX = 20;
    let availableWidth = width - (startX * 2);
    let thumbnailsPerRow = floor(availableWidth / (this.thumbnailSize + thumbnailSpacing));
    return max(1, thumbnailsPerRow); // At least 1 column
  }
  
  drawGallery() {
    // Draw thumbnails in a grid
    let thumbnailsPerRow = this.getThumbnailsPerRow();
    let thumbnailSpacing = 20;
    let startX = 20;
    let startY = 50;
    
    for (let i = 0; i < this.patterns.length; i++) {
      let col = i % thumbnailsPerRow;
      let row = floor(i / thumbnailsPerRow);
      
      let x = startX + col * (this.thumbnailSize + thumbnailSpacing);
      let y = startY + row * (this.thumbnailSize + thumbnailSpacing);
      
      // Draw thumbnail (use gridSize from slider)
      // Pass animation offset only if animation mode is set and shiftMode is 'none'
      let offset = (this.animationMode !== null && this.shiftMode === 'none') ? this.animationOffset : 0;
      // this.patterns[i].draw(x, y, this.thumbnailSize, this.gridSize-15, this.gridSize, this.shiftMode, this.orientation, this.inverted, this.colorScheme, offset, this.invertEvenRows);
      this.patterns[i].draw(x, y, this.thumbnailSize, this.gridSize, this.gridSize, this.shiftMode, this.orientation, this.inverted, this.colorScheme, offset, this.invertEvenRows);

      // Draw pattern name below thumbnail
      fill(0); // Black text
      noStroke();
      textAlign(CENTER, TOP);
      textSize(14);
      text(this.patterns[i].name, x + this.thumbnailSize / 2, y + this.thumbnailSize + 5);
    }
  }
  
  drawDetail() {
    let selectedPattern = this.patterns[this.selectedPatternIndex];
    let patternSize = 1000; // Fixed size for detail view
    // Pass animation offset only if animation mode is set and shiftMode is 'none'
    let offset = (this.animationMode !== null && this.shiftMode === 'none') ? this.animationOffset : 0;
    selectedPattern.draw(0, 0, patternSize, this.gridSize, this.gridSize, this.shiftMode, this.orientation, this.inverted, this.colorScheme, offset, this.invertEvenRows);
    
    // Draw pattern name below the grid
    fill(0); // Black text
    noStroke();
    textAlign(CENTER, TOP);
    textSize(16);
    text(selectedPattern.name, patternSize / 2, patternSize + 10);
  }
  
  handleClick() {
    if (this.viewMode === 'gallery') {
      // Check if click is on a thumbnail
      let thumbnailsPerRow = this.getThumbnailsPerRow();
      let thumbnailSpacing = 20;
      let startX = 20;
      let startY = 50;
      
      for (let i = 0; i < this.patterns.length; i++) {
        let col = i % thumbnailsPerRow;
        let row = floor(i / thumbnailsPerRow);
        
        let thumbX = startX + col * (this.thumbnailSize + thumbnailSpacing);
        let thumbY = startY + row * (this.thumbnailSize + thumbnailSpacing);
        
        // Check if mouse is within thumbnail bounds
        if (mouseX >= thumbX && mouseX <= thumbX + this.thumbnailSize &&
            mouseY >= thumbY && mouseY <= thumbY + this.thumbnailSize) {
          this.selectedPatternIndex = i;
          this.viewMode = 'detail';
          return;
        }
      }
    } else {
      // In detail view, only switch to gallery if clicking on the pattern area
      // (not on UI elements like slider or checkbox)
      let patternSize = 500; // Same as drawDetail
      if (mouseX >= 0 && mouseX <= patternSize && mouseY >= 0 && mouseY <= patternSize) {
        this.viewMode = 'gallery';
      }
    }
  }
}

// Global variables
let gallery;

function setup() {
  // Reduce frame rate globally as a hack
  // frameRate(10); // Default is 60fps, reducing to 10fps
  
  // Create canvas: width 500, height calculated to fit gallery patterns
  // For gallery: thumbnails (200px) + spacing (20px) + text (~20px) = ~240px per row
  // With 2 thumbnails per row, estimate: 50px start + (ceil(patterns/2) * 240px)
  // Increase to 800px height to accommodate more patterns
  createCanvas(2600, 1800);
  
  // Convert pattern data to Pattern objects
  let patternObjects = PATTERNS.map(p => new Pattern(p.name, p.pattern));
  
  // Create gallery instance
  gallery = new Gallery(patternObjects);
  gallery.setup();
  
  // Set sepia background color (warm brown/beige)
  background(238, 203, 173);
}

function draw() {
  gallery.draw();
}

function mousePressed() {
  gallery.handleClick();
}
