# Interactive Weave Pattern Catalog

A web application for browsing and exploring weaving patterns, built with p5.js. Features include:

- Gallery and detail views for pattern exploration
- Minimal pattern representation using repeating units
- Customizable grid sizes (4-64)
- Multiple shift modes (left, right, none) for pattern variation
- Horizontal/vertical orientation controls
- Color scheme options (B/W and Orange-Red)
- Animation modes (left/right scrolling)
- Pattern shuffling and inversion controls

Patterns are defined as simple arrays representing repeating units, making it easy to add new patterns to the catalog.

## Getting Started

Simply open `index.html` in a web browser. The application loads p5.js from a CDN, so no build process or dependencies are required.

## Usage

- **Gallery View**: Browse all patterns as thumbnails. Click on any pattern to view it in detail.
- **Detail View**: Click on the pattern or use the slider/buttons to customize the display.
- **Controls**:
  - **Grid Size Slider**: Adjust the pattern grid resolution (4-64)
  - **Shift Mode Button**: Cycle through right, left, and none shift modes
  - **Orientation Button**: Toggle between horizontal and vertical orientations
  - **Invert Button**: Flip the color scheme
  - **Color Scheme Button**: Switch between B/W and Orange-Red color palettes
  - **Animation Button**: Enable animation in left or right direction
  - **Shuffle Button**: Randomize the order of patterns in the gallery
  - **Invert Even Rows Button**: Toggle inversion for even-numbered rows

## Pattern Format

Patterns are defined as arrays of 1s and 0s, representing the minimal repeating unit:

```javascript
{
  name: "Plain Weave",
  pattern: [1, 0]  // Repeats: 1, 0, 1, 0, 1, 0...
}
```

The rendering code automatically handles repetition across the grid based on the selected shift mode.

## Technologies

- [p5.js](https://p5js.org/) - Creative coding library for rendering and interaction
- Pure JavaScript - No frameworks or build tools required
- Minimal HTML/CSS - Clean, lightweight implementation

