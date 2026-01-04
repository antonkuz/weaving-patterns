# Auto-Generated Gallery with Endless Scroll Specification

## Overview
Create an auto-generated gallery page that randomly generates pattern tiles using options from `options.js` and implements endless scroll functionality, loading new patterns as the user scrolls down.

## Goals
- Generate random pattern tiles on-demand
- Implement endless/infinite scroll
- Use options from `options.js` for randomization
- Maintain performance with many tiles
- Seamless user experience

## Data Source

### Options File
**Location**: `v2/data/options.js`

**Structure**:
```javascript
const OPTIONS = {
  binaryPatterns: [...],    // Array of binary pattern arrays
  colorSchemes: [...],       // Array of color scheme objects
  gridConfigs: [...],         // Array of grid config objects
  animations: [...]           // Array of animation objects
}
```

**Usage**: Randomly select one item from each array to create a new pattern tile.

## Pattern Generation

### Random Pattern Creation
For each new tile:
1. Randomly select one `binaryPattern` from `OPTIONS.binaryPatterns`
2. Randomly select one `colorScheme` from `OPTIONS.colorSchemes`
3. Randomly select one `gridConfig` from `OPTIONS.gridConfigs`
4. Randomly select one `animation` from `OPTIONS.animations`
5. Combine into pattern object:
   ```javascript
   {
     binaryPattern: selectedPattern,
     colorScheme: selectedScheme,
     gridConfig: selectedConfig,
     animation: selectedAnimation
   }
   ```

### Generation Strategy
**Decisions:**
1. **Initial Load**: Fill viewport + buffer (2x viewport height) if not hard, otherwise fixed 12 tiles
   - Try to calculate viewport height and generate enough tiles to fill 2x viewport
   - Fallback to 12 tiles if viewport calculation is complex

2. **Batch Size**: Fixed batch of 8 tiles per scroll event
   - Consistent loading behavior
   - Simple to implement

## Endless Scroll Implementation

### Scroll Detection
**Approach**: Detect when user approaches bottom of page/container

**Options:**
1. **Scroll Event Listener**: Listen to `scroll` events, check distance to bottom
2. **Intersection Observer**: Use Intersection Observer API to detect when sentinel element is visible
3. **RequestAnimationFrame**: Continuously check scroll position

**Decision**: Intersection Observer (most performant, modern approach)
- Use if reliable and straightforward
- Fallback to scroll event listener if Intersection Observer is problematic

### Sentinel Element
- Place invisible element at bottom of gallery
- When sentinel becomes visible → trigger new tile generation
- Move sentinel down as new tiles are added

### Loading States
**Decisions:**
3. **Loading Indicator**: No indicator (instant generation)
   - Can revisit if generation becomes slow
   - Keep it simple for MVP

4. **Generation Speed**: Instant
   - Generate and render immediately
   - No delays or batching delays

## Component Architecture

### AutoGallery Component
**File**: `v2/components/AutoGallery.js`

**Responsibilities**:
- Generate random patterns using `OPTIONS`
- Manage endless scroll logic
- Render tiles using `AppliedPatternPreview`
- Handle scroll detection and loading

**Structure**:
```javascript
class AutoGallery {
  constructor(containerId, options)
  // options: OPTIONS object from options.js
  
  // State
  this.generatedPatterns = [];  // Array of generated pattern objects
  this.isLoading = false;        // Loading state
  this.sentinel = null;          // Sentinel element reference
  
  // Methods
  generateRandomPattern()        // Create random pattern from options
  generateBatch(count)            // Generate multiple patterns
  loadMore()                      // Load more tiles (endless scroll)
  setupScrollDetection()          // Set up scroll/intersection observer
  render()                        // Render gallery with tiles
}
```

### Pattern Generation Logic
```javascript
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
    binaryPattern: [...binaryPattern],  // Copy array
    colorScheme: { ...colorScheme },     // Copy object
    gridConfig: { ...gridConfig },       // Copy object
    animation: { ...animation }          // Copy object
  };
}
```

## UI/UX Design

### Initial Load
- Generate initial batch of tiles (e.g., 20-30 tiles)
- Render immediately
- Set up scroll detection

### Scroll Behavior
- Smooth scrolling
- Use simpler approach for MVP (may allow slight jump when new tiles load)
- Can optimize later if needed

### Loading Indicator
- No loading indicator for MVP
- Can revisit if generation becomes slow

### Empty State
- Not applicable (always generating content)

## Whitespace Handling

### Layout Philosophy
**Goal**: Zero gaps between tiles - tiles should touch each other seamlessly, creating a continuous visual grid similar to Pinterest-style masonry layouts.

### Implementation Approach

#### No Margins or Padding
- **Tiles**: No margin, padding, or border on `.pattern-tile` elements
- **Grid Container**: No padding or margin on `.gallery-grid`
- **Canvas Elements**: No spacing between canvas elements

#### Masonry Layout Algorithm
The masonry layout positions tiles using absolute positioning to eliminate vertical gaps:

1. **Column Calculation**: 
   - Calculate number of columns based on container width and tile width
   - `numColumns = Math.floor(containerWidth / tileWidth)`

2. **Column Height Tracking**:
   - Maintain array of column heights: `columnHeights = [0, 0, 0, ...]`
   - Each index represents a column's current height

3. **Tile Placement**:
   - For each tile, find the shortest column: `shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))`
   - Position tile at: `left = shortestColumnIndex * tileWidth`, `top = columnHeights[shortestColumnIndex]`
   - Update column height: `columnHeights[shortestColumnIndex] += tileHeight`

4. **Container Height**:
   - Set grid container height to tallest column: `grid.style.height = Math.max(...columnHeights)`

#### Tile Positioning
- **Absolute Positioning**: Each tile uses `position: absolute`
- **Grid Container**: Uses `position: relative` to contain absolutely positioned tiles
- **No Gaps**: Tiles are positioned directly adjacent to each other (no gap variable)

#### Responsive Considerations
- On window resize, recalculate column count and reposition all tiles
- Maintain zero gaps across all screen sizes
- Responsive breakpoints may change tile width, but gaps remain zero

### CSS Requirements
```css
.gallery-grid {
  position: relative;
  width: 100%;
  padding: 0;
  margin: 0;
}

.pattern-tile {
  position: absolute;
  margin: 0;
  padding: 0;
  border: none;
}
```

### Edge Cases
- **Single Column**: On very narrow screens, tiles stack vertically with no gaps
- **Equal Height Tiles**: If all tiles have same height, creates perfect grid
- **Variable Heights**: Masonry algorithm handles variable heights seamlessly

## Performance Considerations

### Tile Management
**Decisions:**
6. **Tile Cleanup**: Keep all tiles (unlimited growth)
   - Simplest approach for MVP
   - No cleanup logic needed
   - Can optimize later if performance issues

7. **Instance Cleanup**: Keep all instances
   - Keep all `AppliedPatternPreview` instances
   - No cleanup needed for MVP
   - Can optimize later if memory becomes issue

### Rendering Optimization
- Use `requestAnimationFrame` for smooth rendering
- Batch DOM updates
- Defer non-critical work

### Memory Management
- Monitor memory usage with many tiles
- Consider cleanup if performance degrades

## Implementation Plan

### Phase 1: Basic Generation
1. Create `AutoGallery` component class
2. Implement `generateRandomPattern()` method
3. Implement `generateBatch()` method
4. Calculate viewport height and generate initial batch (2x viewport or 12 tiles)
5. Render initial batch of tiles
6. Test pattern generation

### Phase 2: Endless Scroll
1. Add sentinel element to DOM
2. Implement Intersection Observer for scroll detection (with fallback to scroll listener)
3. Trigger `loadMore()` when sentinel visible
4. Generate batch of 8 tiles
5. Render new tiles instantly
6. Move sentinel to new bottom position

### Phase 3: Integration
1. Create `autogallery.html` page
2. Create `autogallery.js` initialization script
3. Load `options.js` data
4. Initialize `AutoGallery` component
5. Test endless scroll with many tiles

### Phase 4: Testing & Edge Cases
1. Handle edge cases (no options, empty arrays, etc.)
2. Add error handling
3. Test with many tiles (100+)
4. Monitor performance
5. Revisit loading indicator if generation becomes slow

## Technical Details

### Intersection Observer Setup
```javascript
setupScrollDetection() {
  const sentinel = document.createElement('div');
  sentinel.className = 'scroll-sentinel';
  sentinel.style.height = '1px';
  this.sentinel = sentinel;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !this.isLoading) {
      this.loadMore();
    }
  }, {
    rootMargin: '200px'  // Trigger 200px before bottom
  });
  
  observer.observe(sentinel);
  // Add sentinel to DOM at bottom
}
```

### Load More Implementation
```javascript
loadMore() {
  if (this.isLoading) return;
  
  this.isLoading = true;
  const batchSize = 8;  // Fixed batch size
  const newPatterns = this.generateBatch(batchSize);
  
  // Render new tiles
  this.renderTiles(newPatterns);
  
  // Update sentinel position
  this.updateSentinel();
  
  this.isLoading = false;
}
```

### Reusing Gallery Component
**Decision**: Create separate `AutoGallery` component
- Clean separation of concerns
- `AutoGallery` handles generation and scroll logic
- Reuses `AppliedPatternPreview` for rendering (like `Gallery` does)
- Can share CSS and layout logic - yeah

## File Structure
```
v2/
├── autogallery.html          # Auto-generated gallery page
├── autogallery.js            # Page initialization script
├── data/
│   ├── options.js            # Options for random generation
│   └── gallery-patterns.js   # (existing, not used in auto gallery)
├── components/
│   ├── AutoGallery.js        # Auto-generated gallery component
│   └── Gallery.js            # (existing, manual gallery)
└── ...
```

## API Design

### AutoGallery Component
```javascript
class AutoGallery {
  constructor(containerId, options, config = {})
  // containerId: DOM element ID
  // options: OPTIONS object from options.js
  // config: {
  //   initialBatchSize: 20,
  //   loadBatchSize: 10,
  //   scrollThreshold: 200  // pixels before bottom
  // }
  
  // Methods
  generateRandomPattern()           // Generate single random pattern
  generateBatch(count)              // Generate batch of patterns
  loadMore()                        // Load more tiles (endless scroll)
  setupScrollDetection()            // Initialize scroll detection
  render()                          // Render gallery
  renderTiles(patterns)             // Render specific tiles
  updateSentinel()                  // Move sentinel to bottom
  destroy()                         // Cleanup
}
```

## Finalized Decisions

1. **Initial Load**: Fill viewport + buffer (2x viewport height), fallback to 12 tiles
2. **Batch Size**: Fixed 8 tiles per load
3. **Loading Indicator**: No indicator (can revisit if slow)
4. **Generation Speed**: Instant (no delays)
5. **Scroll Position**: Simpler approach for MVP (may allow slight jump)
6. **Tile Cleanup**: Keep all tiles (unlimited growth)
7. **Instance Cleanup**: Keep all instances
8. **Component**: Separate `AutoGallery` component
9. **Scroll Detection**: Intersection Observer (if reliable), fallback to scroll listener

## Next Steps

1. ✅ Specification created
2. ⏭️ Create `AutoGallery` component
3. ⏭️ Implement random pattern generation
4. ⏭️ Implement endless scroll with Intersection Observer
5. ⏭️ Create `autogallery.html` page
6. ⏭️ Test with many tiles
7. ⏭️ Optimize performance if needed

