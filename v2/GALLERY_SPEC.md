# Gallery System Specification

## Overview
Add a gallery page to display saved weaving patterns in a grid layout.

## Goals
- Display saved patterns in a grid layout
- Reuse `AppliedPatternPreview` component for consistent rendering
- Animated previews for patterns with animation data

## Data Structure

### Gallery Data File
**Location**: `v2/data/gallery-patterns.js`

**Format**: Array of pattern objects matching SaveExport output format:
```javascript
const GALLERY_PATTERNS = [
  {
    binaryPattern: [1, 1, 0, 1, 1, 1, 0],
    colorScheme: { 0: '#F27821', 1: '#8C3363' },
    gridConfig: { width: 7, height: 1, cellSize: 50 },
    animation: {  // Optional
      direction: "right",
      speed: 5
    }
  },
  // ... more patterns
];
```

**Notes**:
- **File Format**: `.js` file with `const GALLERY_PATTERNS = [...]` (easier to edit manually)
- **No IDs**: Patterns are identified by array index
- **Pattern Name**: Generated from `binaryPattern` array as one-liner string (e.g., "1,1,0,1,1,1,0")
- **No Metadata**: Keep it simple, just pattern data

## Component Architecture

### Gallery Component
**File**: `v2/components/Gallery.js`

**Responsibilities**:
- Load pattern data from gallery-patterns file
- Render grid of pattern tiles
- Handle tile clicks (load into designer)
- Navigation back to designer

**Structure**:
```javascript
class Gallery {
  constructor(containerId, patterns, onPatternSelect = null)
  // patterns: Array of pattern objects
  // onPatternSelect: Callback when pattern is clicked
}
```

### Pattern Tile Component
**File**: Integrated into `Gallery` component

**Responsibilities**:
- Display single pattern preview using `AppliedPatternPreview`
- Show pattern name (generated from binaryPattern)
- Render tiles directly in Gallery component (no separate component class)

## UI/UX Design

### Gallery Layout
- **Grid layout**: Responsive grid of pattern tiles
- **Tile size**: Based on pattern `gridConfig` (may vary per pattern)
- **Spacing**: Consistent gaps between tiles
- **Responsive**: Adapts to screen size
  - Desktop: 3-4 columns
  - Tablet: 2 columns
  - Mobile: 1 column

### Pattern Tile Design
Each tile displays:
- Pattern preview (using `AppliedPatternPreview`)
- Pattern name (generated from `binaryPattern` as one-liner string)

**Layout**:
```
┌─────────────────┐
│  [Preview]      │
│  (canvas)       │
│                 │
├─────────────────┤
│ Pattern Name    │
│ (e.g., "1,1,0") │
└─────────────────┘
```

**Notes**:
- **No Click Interaction**: Tiles are display-only
- **Animation**: Animated previews if pattern has animation data (Option B)

### Navigation

**Page Structure**: Separate HTML pages
- `index.html` - Designer page
- `gallery.html` - Gallery page

**Navigation**: Simple link between pages (can be added later if needed)

## Implementation Plan

### Phase 1: Data & Structure
1. Create `data/gallery-patterns.js` file
2. Define data structure (no IDs, no metadata)
3. Add sample patterns

### Phase 2: Gallery Component
1. Create `gallery.html` page
2. Create `Gallery` component class
3. Load patterns from `gallery-patterns.js`
4. Implement grid layout with CSS

### Phase 3: Pattern Tile Rendering
1. Integrate `AppliedPatternPreview` into tiles
2. Use pattern's `gridConfig` for tile sizing
3. Generate pattern name from `binaryPattern` array
4. Display pattern name below preview

### Phase 4: Animation Support
1. Check if pattern has animation data
2. Initialize animation in `AppliedPatternPreview` instances
3. Start animations for patterns with animation data
4. Test animated previews

### Phase 5: Polish
1. Empty state (no patterns)
2. Error handling
3. Responsive grid refinement
4. Performance check (many patterns)

## Technical Considerations

### AppliedPatternPreview Reuse
- **Gallery component manages all instances**: Gallery component creates, initializes, and cleans up all `AppliedPatternPreview` instances
- Create multiple instances of `AppliedPatternPreview` (one per tile)
- Each instance needs its own unique container ID (use index: `pattern-tile-${index}`)
- Store instances in array: `this.previewInstances = []` for cleanup
- Use pattern's `gridConfig` directly (tile size varies per pattern)
- Consider performance: many instances might be heavy (optimize later if needed)

**Instance Management**:
```javascript
class Gallery {
  constructor(containerId, patterns) {
    this.previewInstances = []; // Store all AppliedPatternPreview instances
    // ...
  }
  
  renderTile(pattern, index) {
    // Create container
    const containerId = `pattern-tile-${index}`;
    // Create AppliedPatternPreview instance
    const preview = new AppliedPatternPreview(containerId, ...);
    this.previewInstances.push(preview);
    // Configure pattern data and animation
  }
  
  destroy() {
    // Cleanup all instances
    this.previewInstances.forEach(instance => instance.destroy());
    this.previewInstances = [];
  }
}
```

### Pattern Name Generation
Generate pattern name from `binaryPattern` array:
```javascript
function getPatternName(binaryPattern) {
  return binaryPattern.join(',');
}
// Example: [1, 1, 0, 1] → "1,1,0,1"
```

### Animation in Gallery
- Check if pattern has `animation` property
- If present, call `setAnimationDirection()` and `setAnimationSpeed()` on `AppliedPatternPreview` instance
- Start animation automatically when tile is rendered
- Each tile manages its own animation independently

## File Structure
```
v2/
├── index.html              # Designer page
├── gallery.html            # Gallery page
├── app.js                  # Designer logic (initializes components)
├── gallery.js              # Gallery page logic (initializes Gallery component)
├── data/
│   └── gallery-patterns.js # Pattern data (const GALLERY_PATTERNS = [...])
├── components/
│   ├── Gallery.js          # Gallery component class
│   └── ... (existing)
└── ...
```

**File Locations**:
- **`components/Gallery.js`**: Gallery component class (follows same pattern as other components)
- **`gallery.js`**: Page-level script that loads data and initializes Gallery component (similar to `app.js` for designer)

## Finalized Decisions

1. **File Format**: `.js` file (`const GALLERY_PATTERNS = [...]`)
2. **ID Generation**: None - index-based rendering
3. **Metadata**: None - keep it simple
4. **Tile Size**: Based on pattern `gridConfig` (varies per pattern)
5. **Grid Density**: 3-4 columns desktop, 2 tablet, 1 mobile
6. **Tile Interaction**: None - display only
7. **Animation**: Animated previews if pattern has animation data
8. **Page Structure**: Separate HTML pages (`gallery.html`)
9. **Pattern Name**: Generated from `binaryPattern` as one-liner string
10. **Tile Rendering**: Direct rendering in Gallery component (no separate PatternTile class)

## Component API

### Gallery Component
```javascript
class Gallery {
  constructor(containerId, patterns)
  // patterns: Array of pattern objects from GALLERY_PATTERNS
  // Each pattern: { binaryPattern, colorScheme, gridConfig, animation? }
  
  // State
  this.previewInstances = []; // Array of AppliedPatternPreview instances
  
  // Methods
  render() // Render grid of tiles
  renderTile(pattern, index) // Render single tile, create AppliedPatternPreview instance
  getPatternName(binaryPattern) // Generate name from array
  destroy() // Cleanup all AppliedPatternPreview instances
}
```

**Responsibility**: Gallery component is responsible for:
- Creating all `AppliedPatternPreview` instances
- Initializing each instance with pattern data
- Configuring animation if pattern has animation data
- Managing instance lifecycle (cleanup on destroy)

### Pattern Tile Structure
```html
<div class="pattern-tile" id="pattern-tile-${index}">
  <div class="tile-preview">
    <!-- AppliedPatternPreview canvas rendered here -->
  </div>
  <div class="tile-name">${patternName}</div>
</div>
```

## Next Steps
1. ✅ Specification finalized
2. ⏭️ Create `data/gallery-patterns.js` file
3. ⏭️ Create `gallery.html` page
4. ⏭️ Implement Gallery component
5. ⏭️ Add CSS styling
6. ⏭️ Test with sample patterns

