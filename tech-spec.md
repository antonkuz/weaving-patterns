# Weaving Patterns v2 - Technical Specification

## Overview

v2 is a complete rebuild of the weaving pattern catalog with a focus on a step-by-step design workflow. Users are guided through pattern creation with real-time preview, replacing the gallery-based approach of v1.

## Architecture

### Technology Stack
- **React** - UI framework for component-based architecture
- **p5.js** - Canvas-based rendering (instance mode)
- **Vite** - Build tool and dev server
- **HTML/CSS** - Standard web technologies

### Core Design Principles
1. **React for UI, p5.js for Rendering** - Clear separation of concerns
2. **Step-by-step Workflow** - Vertical sections on single page
3. **Real-time Preview** - Updates as user configures
4. **State-driven** - React state is source of truth, p5 reacts to state

## Component Architecture

### Application Structure
```
v2/
├── src/
│   ├── components/
│   │   ├── BinaryPatternDesigner.jsx    # Step 1: Pattern input
│   │   ├── ColorSchemeDesigner.jsx      # Step 2: Color selection
│   │   ├── GridConfigDesigner.jsx       # Step 3: Grid configuration
│   │   ├── AppliedPatternPreview.jsx    # Preview: p5.js rendering
│   │   └── SaveExport.jsx               # Export: JSON serialization
│   ├── hooks/
│   │   └── useP5.js                     # p5.js instance management
│   ├── utils/
│   │   └── patternRenderer.js           # p5.js drawing logic
│   ├── App.jsx                          # Main orchestrator
│   └── main.jsx                         # Entry point
├── package.json
└── index.html
```

### State Management

React `useState` hooks in `App.jsx`:

```javascript
const [binaryPattern, setBinaryPattern] = useState([0, 1, 0, 1]);
const [colorScheme, setColorScheme] = useState({ 0: '#000000', 1: '#FFFFFF' });
const [gridConfig, setGridConfig] = useState({ 
  width: 8, 
  height: 8, 
  cellSize: 50  // pixels
});
const [animationProgress, setAnimationProgress] = useState(0);
const [isAnimating, setIsAnimating] = useState(false);
```

State flows down to components as props. Components update state via callbacks.

## Component Specifications

### 1. BinaryPatternDesigner

**Purpose**: Design the binary pattern (minimal repeating unit)

**UI**:
- 1x4 row of clickable squares (default: 4 squares. min 2, max 16)
- Squares toggle between 0 (off) and 1 (on) on click
- Visual indication: filled = 1, empty = 0
- "Add" button: appends a new square (defaults to 0)
- "Delete Last" button: removes the last square
- Minimum: 2 square (disable delete button when at minimum)

**State**: Array of 0s and 1s (e.g., `[1, 0, 1, 0]`)

**Props**:
- `pattern: Array<number>` - Current pattern array
- `onPatternChange: (pattern: Array<number>) => void` - Update callback

---

### 2. ColorSchemeDesigner

**Purpose**: Select color palette for pattern rendering

**UI**:
- Grid/list of predefined color palette options
- Each palette shows 2 swatches (color 0 and color 1)
- Selected palette highlighted/checked
- Default: Black/White palette

**State**: Object mapping pattern values to colors
```javascript
{
  0: '#000000',  // Color for pattern value 0
  1: '#FFFFFF'   // Color for pattern value 1
}
```

**Props**:
- `colorScheme: { 0: string, 1: string }` - Current color mapping
- `onColorSchemeChange: (scheme: { 0: string, 1: string }) => void`

**Palette Format** (TBD - will be provided later):
- Predefined list of 2-color palettes
- Each palette has hex codes for value 0 and value 1

---

### 3. GridConfigDesigner

**Purpose**: Configure grid dimensions and cell size

**UI**:
- Three numeric controls:
  - **Width**: Number input with +/- buttons (min: 4, max: 32)
  - **Height**: Number input with +/- buttons (min: 4, max: 32)
  - **Cell Size**: Number input with +/- buttons (min: 5, max: 50, unit: pixels)
- Each control: numeric text field centered between + and - buttons
- Buttons increment/decrement by 1 (or configurable step)
- Enforce min/max limits

**State**: Object with width, height, cellSize
```javascript
{
  width: 8,      // Number of columns
  height: 8,     // Number of rows
  cellSize: 50   // Size of each cell in pixels
}
```

**Props**:
- `gridConfig: { width: number, height: number, cellSize: number }`
- `onGridConfigChange: (config: { width: number, height: number, cellSize: number }) => void`

---

### 4. AppliedPatternPreview

**Purpose**: Render the final pattern using p5.js

**Implementation**: p5.js instance mode via React refs

**Integration Pattern**:
```javascript
function AppliedPatternPreview({ binaryPattern, colorScheme, gridConfig, animationProgress, isAnimating }) {
  const sketchRef = useRef();
  
  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        // Calculate canvas size from gridConfig
        const width = gridConfig.width * gridConfig.cellSize;
        const height = gridConfig.height * gridConfig.cellSize;
        p.createCanvas(width, height);
      };
      
      p.draw = () => {
        // Render pattern grid
        // Use binaryPattern, colorScheme, gridConfig
        // Handle animationProgress if isAnimating is true
      };
    };
    
    const p5Instance = new p5(sketch, sketchRef.current);
    return () => p5Instance.remove();
  }, [binaryPattern, colorScheme, gridConfig, animationProgress, isAnimating]);
  
  return <div ref={sketchRef}></div>;
}
```

**Rendering Logic**:
- For each cell (row, col):
  - Calculate pattern index: `(row * gridConfig.width + col) % binaryPattern.length`
  - Get pattern value: `binaryPattern[index]`
  - Map to color: `colorScheme[patternValue]`
  - Draw square at position with calculated size
- Animation: Only render cells up to `animationProgress` index when `isAnimating` is true
- Grid repeats the binary pattern across the entire grid

**Props**:
- `binaryPattern: Array<number>`
- `colorScheme: { 0: string, 1: string }`
- `gridConfig: { width: number, height: number, cellSize: number }`
- `animationProgress: number` - Current cell index in animation
- `isAnimating: boolean` - Whether animation is active

---

### 5. Animation Controls (within AppliedPatternPreview section)

**Purpose**: Control step-by-step animation

**UI**:
- "Animate" button (toggle)
- When active: Progresses through grid one cell at a time

Implementation to be refined when we get to this.

---

### 6. SaveExport

**Purpose**: Export pattern configuration as JSON

**UI**:
- "Save Pattern" button
- Markdown code block below button (initially hidden)
- Click button: Displays formatted JSON in markdown code block
- JSON is copyable (select text in code block)

**Serialization Format**:
```json
{
  "binaryPattern": [1, 0, 1, 0],
  "colorScheme": {
    "0": "#000000",
    "1": "#FFFFFF"
  },
  "gridConfig": {
    "width": 8,
    "height": 8,
    "cellSize": 50
  }
}
```

**Props**:
- `binaryPattern: Array<number>`
- `colorScheme: { 0: string, 1: string }`
- `gridConfig: { width: number, height: number, cellSize: number }`

**Behavior**:
- Button toggles visibility of export section
- JSON formatted with 2-space indentation
- Wrapped in markdown code fence: ` ```json ... ``` `

---

## p5.js Integration Pattern
using useEffect directly inside the component rather than a generic useP5 hook.


## Page Layout

**Structure**: Vertical sections on single page

```
┌─────────────────────────────────────┐
│  Step 1: Binary Pattern Designer   │
│  [0] [1] [0] [1]  [+ Add] [- Delete]│
├─────────────────────────────────────┤
│  Step 2: Color Scheme Designer     │
│  [Palette options grid]             │
├─────────────────────────────────────┤
│  Step 3: Grid Configuration        │
│  Width:  [-] 8 [+]                  │
│  Height: [-] 8 [+]                  │
│  Cell Size: [-] 50 [+]              │
├─────────────────────────────────────┤
│  Preview: Applied Pattern           │
│  [p5.js canvas]                     │
│  [Animate Button]                   │
├─────────────────────────────────────┤
│  Export                             │
│  [Save Pattern Button]              │
│  ```json                            │
│  { ... }                            │
│  ```                                │
└─────────────────────────────────────┘
```

## Pattern Rendering Algorithm

For a grid cell at position (row, col):

1. Calculate linear index: `index = row * gridConfig.width + col`
2. Calculate pattern index: `patternIndex = index % binaryPattern.length`
3. Get pattern value: `value = binaryPattern[patternIndex]`
4. Get color: `color = colorScheme[value]`
5. Draw rectangle:
   - Position: `(col * gridConfig.cellSize, row * gridConfig.cellSize)`
   - Size: `gridConfig.cellSize × gridConfig.cellSize`
   - Fill: `color` based on value

**Animation**: Only draw cells where `linearIndex <= animationProgress` when `isAnimating` is true.

---

## Dependencies

### npm packages (to be installed):
- `react`
- `react-dom`
- `p5` - p5.js library

### Vite plugins:
- Standard Vite React template includes necessary plugins

---

## Out of Scope (v2)

- Mobile/responsive design
- Pattern persistence (localStorage)
- Pattern library/loading saved patterns
- Pattern reshaping/rearranging in BinaryPatternDesigner
- Custom color palette creation
- Animation speed controls
- Undo/redo functionality
- Pattern validation beyond min/max limits
- Shift modes (left/right/none) from v1
- Orientation controls
- Pattern inversion

---

## Future Considerations

- Load/import saved patterns from JSON
- Pattern library with thumbnails
- Additional rendering modes (shift modes, orientation)
- Pattern sharing/export as image
- More sophisticated animation controls
- Custom color palette designer
