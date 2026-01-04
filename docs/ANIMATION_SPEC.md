# Animation System Specification

## Overview
Add scrolling animation functionality to the weaving pattern preview, allowing users to animate patterns with configurable direction and speed.

## Goals
- Clean, vanilla JavaScript implementation (no p5.js dependency)
- **Discrete step animation** (shifts one row/col at a time, not smooth)
- Intuitive controls for direction and speed
- Seamless integration with existing pattern rendering system
- **Simplest code implementation** (MVP priority)

## Animation Concept

### Scrolling Behavior
The pattern scrolls in discrete steps (one row or column at a time) in the selected direction, creating a visual effect where the pattern appears to move across the grid.

### Visual Effect
- **Seamless wrap**: Pattern appears continuous, like a tiled texture scrolling
- Pattern wraps seamlessly at boundaries

### Pattern Application Method
- **Offset to pattern index calculation** (simplest approach)
- Apply offset to row/col coordinates before pattern calculation
- Similar to v1 approach, but extended for both X and Y axes

### Grid Interaction
- Works with **all grid configurations** (any width/height)
- Respects binary pattern length for wrapping

## Direction System

### Four Directions
- **Right** (+X): Pattern scrolls left-to-right (pattern moves right, view moves left)
- **Left** (-X): Pattern scrolls right-to-left (pattern moves left, view moves right)
- **Down** (+Y): Pattern scrolls top-to-bottom (pattern moves down, view moves up)
- **Up** (-Y): Pattern scrolls bottom-to-top (pattern moves up, view moves down)

### Direction Control UI
- **Radio-style buttons**: Only one direction can be active at a time
- Four arrow buttons arranged in a cross/arrow-key layout (↑ ↓ ← →)
- Clicking an active direction button turns animation off
- Visual highlight for active direction

### Multiple Directions
- **No diagonal scrolling**: Only one direction active at a time
- Direction is stored as a single value: `'up' | 'down' | 'left' | 'right' | null`

## Speed Control

### Speed Units
- **Cells per second**: Speed measured in cells/second (e.g., "5 cells/sec")
- Display format: "X cells/sec" or "X c/s"

### Speed Range
- **Minimum**: 0 cells/sec (stopped)
- **Maximum**: 20 cells/sec
- Default: 5 cells/sec

### Speed Control UI
- **Slider control**: Range 0-20
- Display current speed value next to slider
- Slider updates animation speed in real-time

## Implementation Details

### State Management
Animation state stored in `AppliedPatternPreview` instance:
```javascript
// Inside AppliedPatternPreview class
this.animation = {
  isActive: boolean,           // Whether animation is running
  direction: string | null,    // 'up' | 'down' | 'left' | 'right' | null
  speed: number,               // Cells per second (0-20)
  offsetX: number,             // Current X offset (discrete steps)
  offsetY: number,             // Current Y offset (discrete steps)
  lastUpdateTime: number,      // Timestamp of last update
  animationInterval: null      // setInterval reference for cleanup
}
```

This keeps animation logic encapsulated within the preview component.

### Animation Logic
- **Discrete step updates**: Shift by one cell at a time
- Use `setInterval` or time-based calculation to determine when to step
- Calculate step interval: `1000 / speed` milliseconds per step
- Example: 5 cells/sec = 200ms per step
- Track elapsed time since last step
- When interval elapsed, increment/decrement offset and redraw

### Offset Calculation
For each cell at position (row, col):
```javascript
// Apply offset based on direction
let adjustedCol = col + offsetX;  // For left/right
let adjustedRow = row + offsetY;   // For up/down

// Calculate pattern index with wrapping
let patternIndex = (adjustedRow * gridConfig.width + adjustedCol) % binaryPattern.length;
// Handle negative modulo
if (patternIndex < 0) {
  patternIndex += binaryPattern.length;
}
```

### Wrapping
- Wrap at pattern length boundaries (seamless)
- Offsets can be negative or positive
- Use modulo arithmetic to wrap correctly

## UI/UX

### Controls Location
- **In preview section**: Controls placed below the pattern preview
- Integrated into the preview component area

### Control Layout
```
[Pattern Preview Canvas]

Direction Controls:
    [↑]
[←] [ ] [→]
    [↓]

Speed: [====|====] 5 cells/sec
```

- Direction buttons arranged in cross/arrow-key layout
- Center space (or "Stop" button) to turn off animation
- Speed slider below direction buttons
- Speed value displayed next to slider

### Visual Feedback
- **Active direction**: Highlighted button (different background color)
- **Inactive state**: All buttons normal, no direction selected
- **Speed display**: Show current value (e.g., "5 cells/sec")
- **Animation state**: Clear from button states (active = animating)

## Technical Considerations

### Pattern Calculation Updates
Current `AppliedPatternPreview` calculates pattern values using:
```javascript
const patternIndex = i % this.binaryPattern.length;
const patternValue = this.binaryPattern[patternIndex];
```

Updated calculation with animation offsets:
```javascript
// Calculate row and col from cell index
const row = Math.floor(i / gridConfig.width);
const col = i % gridConfig.width;

// Apply animation offsets
const adjustedRow = row + offsetY;
const adjustedCol = col + offsetX;

// Calculate pattern index with wrapping
let patternIndex = (adjustedRow * gridConfig.width + adjustedCol) % binaryPattern.length;
if (patternIndex < 0) {
  patternIndex += binaryPattern.length;
}
const patternValue = binaryPattern[patternIndex];
```

### Component Structure
- Add animation state to `AppliedPatternPreview` instance
- `AppliedPatternPreview` manages its own animation loop
- Animation controls (direction buttons, speed slider) integrated directly into `AppliedPatternPreview`
- Follows existing pattern: components render their own HTML and controls (like `BinaryPatternDesigner`, `ColorSchemeDesigner`, etc.)

## Implementation Plan

### Phase 1: State & Core Logic
1. Add animation state to `AppliedPatternPreview` instance
2. Create animation update function (time-based step calculation) in `AppliedPatternPreview`
3. Update `AppliedPatternPreview.renderPattern()` to use offsets from instance state
4. Add methods to start/stop animation and update direction/speed
5. Test offset calculation with manual values

### Phase 2: UI Controls Integration
1. Update `AppliedPatternPreview.init()` to render controls HTML (direction buttons + speed slider)
2. Build direction buttons (radio-style, arrow layout) in the component's HTML
3. Build speed slider with value display
4. Wire up button clicks and slider changes with event listeners
5. Add CSS styling for controls (in `applied-pattern-preview.css`)

### Phase 3: Integration
1. `AppliedPatternPreview` is self-contained (no changes needed in `app.js`)
2. Controls update animation state directly within the component
3. Component manages its own animation loop internally

### Phase 4: Testing & Refinement
1. Test all four directions
2. Test speed range (0-20 cells/sec)
3. Test with different grid sizes
4. Test with different pattern lengths
5. Verify seamless wrapping
6. Performance check

## Component API

### AppliedPatternPreview Updates
```javascript
// Constructor (no changes)
constructor(containerId, onReady = null)

// Animation state management methods (internal)
setAnimationDirection(direction)  // 'up' | 'down' | 'left' | 'right' | null
setAnimationSpeed(speed)           // 0-20 cells per second
startAnimation()                   // Start animation loop
stopAnimation()                    // Stop animation loop
updateAnimation()                  // Internal: step animation forward

// Internal state (private)
this.animation = {
  isActive: boolean,
  direction: string | null,
  speed: number,
  offsetX: number,
  offsetY: number,
  lastUpdateTime: number,
  animationInterval: null
}

// Updated init() method renders:
// - Canvas (existing)
// - Direction buttons container
// - Speed slider container
```

## Next Steps
1. ✅ Specification finalized
2. ⏭️ Design component structure
3. ⏭️ Implement animation system
4. ⏭️ Add UI controls
5. ⏭️ Test and refine

