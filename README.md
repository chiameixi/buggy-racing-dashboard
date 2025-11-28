buggy-dashboard/
├── public/
│   └── sample.gpx                 # Put one of your GPX files here
├── src/
│   ├── components/
│   │   ├── MapView.tsx           # Map component with GPX tracks
│   │   ├── MapView.css           # Map styling
│   │   ├── ControlPanel.tsx      # Playback controls & lap selector
│   │   └── ControlPanel.css      # Control panel styling
│   ├── utils/
│   │   └── gpxParser.ts          # GPX file parsing logic
│   ├── types.ts                   # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── App.css                    # Main app styling
│   ├── index.css                  # Global styles/resets
│   └── main.tsx                   # Entry point 
└── package.json                   # Dependencies 

__.gpx file
    ↓ (fetch)
App.tsx loads it
    ↓ (parseGpxFile)
gpxParser.ts converts to GpxPoint[]
    ↓ (points prop)
MapView.tsx receives it
    ↓ (maps to positions)
Polyline renders it


## 4. **Component Hierarchy**
```
App
 ├─ useLaps() hook (manages state)
 │
 ├─ ControlPanel (receives laps + callbacks)
 │   └─ DriverSection (one per driver)
 │       └─ LapItem (one per lap)
 │
 └─ MapView (receives only visibleLaps)
```
```
useLaps hook
    ↓ (provides state + functions)
App
    ↓ (passes via props)
ControlPanel
    ↓ (passes to child)
DriverSection
    ↓ (passes to child)
LapItem
    ↓ (user clicks checkbox)
Calls toggleLapVisibility(lapId)
    ↓
Hook updates state
    ↓
React re-renders with new visibleLaps