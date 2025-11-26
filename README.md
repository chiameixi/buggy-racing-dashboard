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
│   └── main.tsx                   # Entry point (already exists)
└── package.json                   # Dependencies (already exists)