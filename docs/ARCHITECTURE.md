# Weaving Patterns v2 - Architecture Diagrams

This document explains how the integrated application works through visual diagrams.

## 1. Component Architecture

This diagram shows the overall structure of the application and how components are organized:

```mermaid
graph TB
    subgraph "index.html"
        HTML[HTML Container]
    end
    
    subgraph "app.js - Application State Manager"
        AppState[appState Object]
        AppState --> |binaryPattern| BP[Array: 0,1,0,1]
        AppState --> |colorScheme| CS[Object: 0/1 → hex]
        AppState --> |gridConfig| GC[Object: width/height/cellSize]
        AppState --> |isAnimating| ANIM[Boolean]
        AppState --> |animationProgress| PROG[Number]
    end
    
    subgraph "Component Layer"
        BPD[BinaryPatternDesigner<br/>Step 1: Pattern Input]
        CSD[ColorSchemeDesigner<br/>Step 2: Color Selection]
        GCD[GridConfigDesigner<br/>Step 3: Grid Config]
        APP[AppliedPatternPreview<br/>Preview: Canvas Renderer]
        SE[SaveExport<br/>Export: JSON Serialization]
    end
    
    HTML --> BPD
    HTML --> CSD
    HTML --> GCD
    HTML --> APP
    HTML --> SE
    
    AppState --> |read/write| BPD
    AppState --> |read/write| CSD
    AppState --> |read/write| GCD
    AppState --> |read| APP
    AppState --> |read| SE
    
    BPD -.-> |onPatternChange callback| AppState
    CSD -.-> |onColorSchemeChange callback| AppState
    GCD -.-> |onGridConfigChange callback| AppState
    AppState -.-> |updatePreview| APP
    
    style AppState fill:#e1f5ff
    style BPD fill:#fff4e1
    style CSD fill:#fff4e1
    style GCD fill:#fff4e1
    style APP fill:#e8f5e9
    style SE fill:#fce4ec
```

## 2. Data Flow Diagram

This diagram shows how data flows when a user interacts with the application:

```mermaid
sequenceDiagram
    participant User
    participant BPD as BinaryPatternDesigner
    participant CSD as ColorSchemeDesigner
    participant GCD as GridConfigDesigner
    participant AppState
    participant APP as AppliedPatternPreview
    participant Canvas as Canvas 2D API
    
    User->>BPD: Click square / Add / Delete
    BPD->>BPD: Update internal pattern array
    BPD->>AppState: onPatternChange([0,1,0,1])
    AppState->>AppState: Update binaryPattern
    AppState->>APP: updatePreview()
    APP->>APP: setBinaryPattern()
    APP->>Canvas: renderPattern()
    Canvas-->>User: Visual update
    
    User->>CSD: Select palette / Toggle inverse
    CSD->>CSD: Update selectedPaletteId / inverted
    CSD->>AppState: onColorSchemeChange({0:'#000',1:'#FFF'})
    AppState->>AppState: Update colorScheme
    AppState->>APP: updatePreview()
    APP->>APP: setColorScheme()
    APP->>Canvas: renderPattern()
    Canvas-->>User: Visual update
    
    User->>GCD: Change width/height/cellSize
    GCD->>GCD: Update config object
    GCD->>AppState: onGridConfigChange({width:8,height:8})
    AppState->>AppState: Update gridConfig
    AppState->>APP: updatePreview()
    APP->>APP: setGridConfig()
    APP->>APP: resizeCanvasToGrid()
    APP->>Canvas: renderPattern()
    Canvas-->>User: Visual update
```

## 3. State Management Flow

This diagram details how the centralized app state is managed:

```mermaid
graph LR
    subgraph "Initialization (app.js)"
        INIT[DOMContentLoaded]
        INIT --> INIT_COMP[initializeComponents]
        INIT_COMP --> WIRE[wireUpComponents]
    end
    
    subgraph "App State Object"
        STATE{binaryPattern<br/>colorScheme<br/>gridConfig<br/>isAnimating<br/>animationProgress}
    end
    
    subgraph "Component Callbacks"
        CB1[onPatternChange]
        CB2[onColorSchemeChange]
        CB3[onGridConfigChange]
    end
    
    subgraph "Update Function"
        UPDATE[updatePreview]
        UPDATE --> SET1[setBinaryPattern]
        UPDATE --> SET2[setColorScheme]
        UPDATE --> SET3[setGridConfig]
        UPDATE --> SET4[setIsAnimating]
        UPDATE --> SET5[setAnimationProgress]
    end
    
    INIT_COMP --> STATE
    CB1 --> |Updates| STATE
    CB2 --> |Updates| STATE
    CB3 --> |Updates| STATE
    STATE --> UPDATE
    UPDATE --> APP[AppliedPatternPreview]
    
    style STATE fill:#e1f5ff
    style UPDATE fill:#fff9c4
    style APP fill:#e8f5e9
```

## 4. Animation System Flow

This diagram explains how the animation system works:

```mermaid
stateDiagram-v2
    [*] --> Idle: App Loaded
    
    Idle --> Animating: User clicks<br/>"Start Animation"
    Animating --> Idle: Animation complete<br/>or "Stop" clicked
    
    state Animating {
        [*] --> Reset
        Reset --> Progress: setInterval(100ms)
        Progress --> Check: animationProgress++
        Check --> Update: Update preview
        Check --> Reset: If progress < maxCells
        Check --> Complete: If progress >= maxCells
        Complete --> [*]
    }
    
    state Update {
        SetProgress: setAnimationProgress(n)
        SetAnimating: setIsAnimating(true)
        Render: renderPattern()
        Render --> LimitCells: cellsToRender = progress + 1
        LimitCells --> DrawCells: Loop through cells
    }
```

## 5. Component Initialization Sequence

This diagram shows the order of component initialization and setup:

```mermaid
graph TD
    START[Browser loads index.html] --> DOM[DOMContentLoaded event]
    
    DOM --> LOAD_SCRIPTS[Load component scripts]
    LOAD_SCRIPTS --> BPD_JS[BinaryPatternDesigner.js]
    LOAD_SCRIPTS --> CSD_JS[ColorSchemeDesigner.js]
    LOAD_SCRIPTS --> GCD_JS[GridConfigDesigner.js]
    LOAD_SCRIPTS --> APP_JS[AppliedPatternPreview.js]
    LOAD_SCRIPTS --> SE_JS[SaveExport.js]
    LOAD_SCRIPTS --> APP_MAIN[app.js]
    
    APP_MAIN --> INIT_COMPONENTS[initializeComponents]
    
    INIT_COMPONENTS --> INIT_BPD[new BinaryPatternDesigner]
    INIT_COMPONENTS --> INIT_CSD[new ColorSchemeDesigner]
    INIT_COMPONENTS --> INIT_GCD[new GridConfigDesigner]
    INIT_COMPONENTS --> INIT_APP[new AppliedPatternPreview]
    INIT_COMPONENTS --> INIT_SE[new SaveExport]
    
    INIT_BPD --> BPD_READY[Component ready]
    INIT_CSD --> CSD_READY[Component ready]
    INIT_GCD --> GCD_READY[Component ready]
    INIT_APP --> APP_READY[Component ready<br/>onReady callback]
    INIT_SE --> SE_READY[Component ready]
    
    APP_READY --> WIRE_UP[wireUpComponents]
    WIRE_UP --> ATTACH_BTN[Attach animation button]
    WIRE_UP --> INIT_UPDATE[Initial updatePreview]
    
    INIT_UPDATE --> RENDER[Render initial pattern]
    RENDER --> READY[App Ready]
    
    style START fill:#e8f5e9
    style READY fill:#e8f5e9
    style INIT_COMPONENTS fill:#fff4e1
```

## 6. Rendering Pipeline

This diagram shows how the AppliedPatternPreview renders the pattern to canvas:

```mermaid
flowchart TD
    TRIGGER[Update Triggered] --> UPDATE[update method called]
    
    UPDATE --> RENDER[renderPattern method]
    
    RENDER --> CLEAR[Clear canvas]
    CLEAR --> BG[Fill white background]
    
    BG --> CALC[Calculate rendering parameters]
    CALC --> |If animating| ANIM_CALC[Calculate cellsToRender<br/>from animationProgress]
    CALC --> |If not animating| FULL_CALC[cellsToRender = maxCells]
    
    ANIM_CALC --> LOOP[Loop through cells 0 to cellsToRender]
    FULL_CALC --> LOOP
    
    LOOP --> POS[Calculate row/col position]
    POS --> PATTERN[Get pattern index:<br/>i % binaryPattern.length]
    PATTERN --> VALUE[Get pattern value:<br/>binaryPattern[index]]
    VALUE --> COLOR[Get color:<br/>colorScheme[value]]
    
    COLOR --> DRAW[Draw cell rectangle]
    DRAW --> LOOP
    
    LOOP --> |Loop complete| GRID[Draw grid lines]
    GRID --> DONE[Rendering complete]
    
    style TRIGGER fill:#fff9c4
    style RENDER fill:#e1f5ff
    style DRAW fill:#e8f5e9
    style DONE fill:#e8f5e9
```

## 7. User Interaction Map

This diagram maps all user interactions to their outcomes:

```mermaid
graph TB
    USER[User Actions]
    
    USER --> PATTERN_ACTIONS[Pattern Designer Actions]
    USER --> COLOR_ACTIONS[Color Designer Actions]
    USER --> GRID_ACTIONS[Grid Config Actions]
    USER --> ANIM_ACTIONS[Animation Actions]
    USER --> EXPORT_ACTIONS[Export Actions]
    
    PATTERN_ACTIONS --> |Click square| TOGGLE[Toggle 0/1]
    PATTERN_ACTIONS --> |Click Add| ADD[Add square]
    PATTERN_ACTIONS --> |Click Delete| DELETE[Remove last square]
    
    COLOR_ACTIONS --> |Click palette| SELECT[Select palette]
    COLOR_ACTIONS --> |Check inverse| INVERT[Invert colors]
    
    GRID_ACTIONS --> |Change width| WIDTH[Update width 4-32]
    GRID_ACTIONS --> |Change height| HEIGHT[Update height 4-32]
    GRID_ACTIONS --> |Change cell size| SIZE[Update cellSize 1-50px]
    
    ANIM_ACTIONS --> |Click Start| START[Start animation]
    ANIM_ACTIONS --> |Click Stop| STOP[Stop animation]
    
    EXPORT_ACTIONS --> |Click Save| TOGGLE_EXPORT[Show/hide JSON]
    
    TOGGLE --> UPDATE_STATE[Update appState]
    ADD --> UPDATE_STATE
    DELETE --> UPDATE_STATE
    SELECT --> UPDATE_STATE
    INVERT --> UPDATE_STATE
    WIDTH --> UPDATE_STATE
    HEIGHT --> UPDATE_STATE
    SIZE --> UPDATE_STATE
    START --> ANIMATE[Start interval timer]
    STOP --> CLEAR_TIMER[Clear interval]
    
    UPDATE_STATE --> PREVIEW[Update preview]
    ANIMATE --> PROGRESS[Increment progress]
    PROGRESS --> PREVIEW
    CLEAR_TIMER --> PREVIEW
    
    PREVIEW --> CANVAS[Canvas re-renders]
    
    TOGGLE_EXPORT --> JSON[Display JSON output]
    
    style USER fill:#fff9c4
    style UPDATE_STATE fill:#e1f5ff
    style PREVIEW fill:#e8f5e9
    style CANVAS fill:#e8f5e9
```

## 8. Component Communication Pattern

This diagram shows the communication pattern between components:

```mermaid
graph TB
    subgraph "Designer Components (Producers)"
        BPD[BinaryPatternDesigner]
        CSD[ColorSchemeDesigner]
        GCD[GridConfigDesigner]
    end
    
    subgraph "Central State (Hub)"
        STATE[appState Object]
        UPDATE[updatePreview Function]
    end
    
    subgraph "Display Components (Consumers)"
        APP[AppliedPatternPreview]
        SE[SaveExport]
    end
    
    subgraph "Animation Controller"
        BTN[Animation Button]
        TIMER[setInterval Timer]
    end
    
    BPD -.-> |onPatternChange<br/>callback| STATE
    CSD -.-> |onColorSchemeChange<br/>callback| STATE
    GCD -.-> |onGridConfigChange<br/>callback| STATE
    
    STATE --> UPDATE
    
    UPDATE --> |setBinaryPattern| APP
    UPDATE --> |setColorScheme| APP
    UPDATE --> |setGridConfig| APP
    UPDATE --> |setIsAnimating| APP
    UPDATE --> |setAnimationProgress| APP
    
    UPDATE --> |getPatternData| SE
    
    BTN --> |click| TIMER
    TIMER -.-> |increment| STATE
    STATE -.-> |updateProgress| UPDATE
    
    style STATE fill:#e1f5ff
    style UPDATE fill:#fff9c4
    style APP fill:#e8f5e9
```

## Key Architecture Patterns

### 1. **Centralized State Management**
- All state lives in `appState` object in `app.js`
- Components are "dumb" - they receive callbacks to update state
- Single source of truth prevents inconsistencies

### 2. **Callback Pattern**
- Each designer component receives an `onChange` callback
- When internal state changes, component calls callback with new value
- App.js receives callback and updates central state

### 3. **Observer-like Pattern**
- When state changes, `updatePreview()` is called
- This propagates changes to all consumer components
- AppliedPatternPreview receives all updates and re-renders

### 4. **Component Isolation**
- Each component manages its own DOM rendering
- Components don't directly communicate with each other
- All communication goes through app.js

### 5. **Animation as State**
- Animation is controlled by state (`isAnimating`, `animationProgress`)
- Timer updates state, which triggers preview update
- Preview component reads state to determine what to render

