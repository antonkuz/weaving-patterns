# Weaving Patterns v2 - Plain JS Implementation

This is a plain JavaScript implementation of the pattern designer, built as a prototype before migrating to React.

## Structure

```
v2/
├── index.html                 # Main HTML file
├── app.js                     # Main application logic (wires components together)
├── components/
│   ├── BinaryPatternDesigner.js    # Step 1: Binary pattern input
│   ├── ColorSchemeDesigner.js      # Step 2: Color palette selection
│   ├── GridConfigDesigner.js       # Step 3: Grid configuration
│   ├── AppliedPatternPreview.js    # Preview: p5.js rendering
│   ├── SaveExport.js               # Export: JSON serialization
│   └── *.css                      # Component styles
└── utils/                       # (Empty for now)
```

## How to Use

1. Open `index.html` in a web browser
2. All components are self-contained and work together
3. No build step or Node.js required

## Features Implemented

✅ **BinaryPatternDesigner**
- Clickable squares to toggle 0/1
- Add/Delete buttons (min 2, max 16 squares)

✅ **ColorSchemeDesigner**
- Palette selection with visual swatches
- Currently includes Black/White and White/Black palettes
- Easy to add more palettes

✅ **GridConfigDesigner**
- Width/Height controls (4-32)
- Cell size control (5-50px)
- +/- buttons and direct input

✅ **AppliedPatternPreview**
- p5.js instance mode rendering
- Real-time updates as configuration changes
- Grid visualization with pattern repetition

✅ **Animation**
- Step-by-step cell-by-cell animation
- Start/Stop controls
- 100ms per cell (10 cells/second)

✅ **SaveExport**
- JSON serialization
- Copyable markdown code block
- Toggle visibility

## State Management

The `appState` object in `app.js` holds all shared state:
- `binaryPattern`: Array of 0s and 1s
- `colorScheme`: Object mapping 0/1 to hex colors
- `gridConfig`: Object with width, height, cellSize
- `isAnimating`: Boolean
- `animationProgress`: Number

Components communicate via callbacks to update shared state.

## Migration to React

When Node.js is available, these components can be migrated to React:
1. Convert classes to functional components
2. Replace manual DOM manipulation with JSX
3. Use React hooks (useState, useEffect) for state
4. Keep the same component structure and props interface

The logic and structure will transfer directly to React components.

## Testing

Open `index.html` in a browser and test:
- Click squares to toggle pattern values
- Add/remove pattern squares
- Change color schemes
- Adjust grid dimensions
- Start/stop animation
- Export JSON pattern

