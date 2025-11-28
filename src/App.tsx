/*
  Main application component for the Buggy Racing Dashboard.
  It integrates the MapView and ControlPanel components,
  manages lap data loading, visibility toggling, and error handling.  
*/




/* Imports */
import { MapView } from './components/MapView';
import { ControlPanel } from './components/ControlPanel';
import { useLaps } from './hooks/useLaps';
import './App.css';


function App() {
  const {
    laps,
    visibleLaps,
    visibleLapIds,
    loading,
    error,
    toggleLapVisibility,
    toggleDriverVisibility
  } = useLaps();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Buggy Racing Dashboard</h1>
      </header>
      
      <div className="app-main">
        <aside className="sidebar">
          <ControlPanel 
            laps={laps}
            visibleLapIds={visibleLapIds}
            onToggleLap={toggleLapVisibility}
            onToggleDriver={toggleDriverVisibility}
          />
        </aside>
        
        <main className="map-section">
          {loading && <div className="status">Loading GPX data...</div>}
          {error && <div className="status error">Error: {error}</div>}
          {!loading && !error && <MapView laps={visibleLaps} />}
        </main>
      </div>
    </div>
  );
}

export default App;
// import { useState, useEffect } from 'react';
// import { MapView } from './components/MapView';
// import { ControlPanel } from './components/ControlPanel';
// import { parseGpxFile } from './utils/gpxParser';
// import type { Lap } from './types';
// import './App.css';

// function App() {
//   const [laps, setLaps] = useState<Lap[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Define GPX files to load
//     const gpxFiles = [
//       {
//         name: '2025_09_21_Meixi_Inviscid_roll_3',
//         file: '2025_09_21_Meixi_Inviscid_roll_3.gpx',
//         color: '#3b82f6',
//         driver: 'Mei Xi',
//         date: '2025 09 21'
//       },
//       {
//         name: '2025_09_21_Meixi_Inviscid_roll_4',
//         file: '2025_09_21_Meixi_Inviscid_roll_4.gpx',
//         color: '#60a5fa',
//         driver: 'Mei Xi',
//         date: '2025 09 21'  
//       }
//     ];




//     // Load all GPX files
//     const loadPromises = gpxFiles.map(({ name, file, color, driver, date }) => {
//       return fetch(`/${file}`)
//         .then(res => {
//           if (!res.ok) {
//             throw new Error(`Failed to load ${file}`);
//           }
//           return res.text();
//         })
//         .then(data => {
//           const parsed = parseGpxFile(data);
//           console.log(`Parsed ${name}:`, parsed);
//           console.log(`First point:`, parsed[0]);
//           console.log(`Total points:`, parsed.length);
          
//           return {
//             id: file,
//             name,
//             driver,
//             date,
//             points: parsed,
//             color
//           };
//         });
//     });

//     // Wait for all files to load
//     Promise.all(loadPromises)
//       .then(loadedLaps => {
//         setLaps(loadedLaps);
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>Buggy Racing Dashboard</h1>
//       </header>
      
//       <div className="app-main">
//         <aside className="sidebar">
//           <ControlPanel laps={laps} />
//         </aside>
        
//         <main className="map-section">
//           {loading && <div className="status">Loading GPX data...</div>}
//           {error && <div className="status error">Error: {error}</div>}
//           {!loading && !error && <MapView laps={laps} />}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default App;
// // import { useState, useEffect } from 'react';
// // import { MapView } from './components/MapView';
// // import { ControlPanel } from './components/ControlPanel';
// // import { parseGpxFile } from './utils/gpxParser';
// // import type { GpxPoint } from './types';
// // import './App.css';

// // function App() {
// //   const [points, setPoints] = useState<GpxPoint[]>([]);
// //   const [laps, setLaps] = useState<Lap[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);


// //   useEffect(() => {

// //     const gpxFiles = [
// //       {
// //         name: '2025_09_21_Meixi_Inviscid_roll_3',
// //         file: '2025_09_21_Meixi_Inviscid_roll_3.gpx',
// //         color: '#3b82f6',
// //         driver: 'Mei Xi',
// //         date: '2025 09 21'
// //       },
// //       {
// //         name: '2025_09_21_Meixi_Inviscid_roll_4',
// //         file: '2025_09_21_Meixi_Inviscid_roll_4.gpx',
// //         color: '#60a5fa',
// //         driver: 'Mei Xi',
// //         date: '2025 09 21'  
// //       }
// //     ];

// //     Promise.all(
// //       gpxFiles.map(({name, file, color, driver, date}) => 
// //         fetch(`./public/${file}`)
// //         .then(res => res.text())
// //         .then(data => (
// //           {
// //             id: file, 
// //             name, 
// //             driver, 
// //             date, 
// //             points:parseGpxFile(data), 
// //             color
// //           }
// //         ))
// //       )
// //     ).then(loadedLaps => {
// //       setLaps(loadedLaps);
// //       setLoading(false);
// //     })
// //     .catch(error => {
// //       setError(error.message);
// //       setLoading(false);
// //     });
// //   }, []);
// //   //   // Load GPX file from public folder
// //   //   fetch('/2025_09_21_Meixi_Inviscid_roll_3.gpx')
// //   //     .then(res => {
// //   //       if (!res.ok) {
// //   //         throw new Error('Failed to load GPX file');
// //   //       }
// //   //       return res.text();
// //   //     })
// //   //     .then(data => {
// //   //       const parsed = parseGpxFile(data);
// //   //       console.log('Parsed points:', parsed);
// //   //       console.log('First point:', parsed[0]);
// //   //       console.log('Total points:', parsed.length);
// //   //       setPoints(parsed);
// //   //       setLoading(false);
// //   //     })
// //   //     .catch(err => {
// //   //       setError(err.message);
// //   //       setLoading(false);
// //   //     });
// //   // }, []);

// //   return (
// //     <div className="app-container">
// //       <header className="app-header">
// //         <h1>Buggy Racing Dashboard</h1>
// //         <header className="app-header">
// //     {/* <button onClick={() => console.log(points)}>Log Points</button> */}
// // </header>
// //       </header>
      
// //       <div className="app-main">
// //         <aside className="sidebar">
// //           <ControlPanel laps = {laps}/>
// //         </aside>
        
// //         <main className="map-section">
// //           {loading && <div className="status">Loading GPX data...</div>}
// //           {error && <div className="status error">Error: {error}</div>}
// //           {!loading && !error && <MapView points={points} />}
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// // export default App;
// // // TODO: Replace with API call
// // // Example future implementation:
// // // fetch('/api/laps')
// // //   .then(res => res.json())
// // //   .then(data => {
// // //     // data = [{ driver, date, gpxUrl, name, color }, ...]
// // //     return Promise.all(
// // //       data.map(lap => 
// // //         fetch(lap.gpxUrl)
// // //           .then(res => res.text())
// // //           .then(gpxData => ({
// // //             id: lap.id,
// // //             name: lap.name,
// // //             driver: lap.driver,
// // //             date: lap.date,
// // //             points: parseGpxFile(gpxData),
// // //             color: lap.color
// // //           }))
// // //       )
// // //     );
// // //   })
// // //   .then(setLaps);

// // // import { useState } from 'react'
// // // import reactLogo from './assets/react.svg'
// // // import viteLogo from '/vite.svg'
// // // import './App.css'

// // // function App() {
// // //   const [count, setCount] = useState(0)

// // //   return (
// // //     <>
// // //       <div>
// // //         <a href="https://vite.dev" target="_blank">
// // //           <img src={viteLogo} className="logo" alt="Vite logo" />
// // //         </a>
// // //         <a href="https://react.dev" target="_blank">
// // //           <img src={reactLogo} className="logo react" alt="React logo" />
// // //         </a>
// // //       </div>
// // //       <h1>Vite + React</h1>
// // //       <div className="card">
// // //         <button onClick={() => setCount((count) => count + 1)}>
// // //           count is {count}
// // //         </button>
// // //         <p>
// // //           Edit <code>src/App.tsx</code> and save to test HMR
// // //         </p>
// // //       </div>
// // //       <p className="read-the-docs">
// // //         Click on the Vite and React logos to learn more
// // //       </p>
// // //     </>
// // //   )
// // // }

// // // export default App
