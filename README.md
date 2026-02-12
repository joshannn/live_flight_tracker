#  Plane Tracker

Real-time aircraft tracking application using your browser's geolocation and the OpenSky Network API.

## Features

- **Live Tracking**: Shows all aircraft within ~50km of your location
- **Real-time Updates**: Refreshes every 10 seconds automatically
- **Interactive Map**: Dark-themed map with flight trails and heading indicators
- **Aircraft Details**: Callsign, altitude, speed, heading, and distance
- **Responsive Design**: Clean sidebar interface with GitHub-inspired aesthetics

## Color Theme

- **Nada Grey**: `#2d2d2d` (Primary background)
- **Baby Blue**: `#89CFF0` (Accents, highlights, active states)
- **White**: `#ffffff` (Text, contrast)
- **Black**: `#000000` (Deep backgrounds, borders)

## Project Structure
plane-tracker/
├── index.html          # Main entry point
├── css/
│   ├── main.css        # Variables, global styles, utilities
│   ├── map.css         # Map-specific styles, markers, trails
│   ├── sidebar.css     # Sidebar layout, header, plane list
│   └── components.css  # Cards, buttons, badges, UI elements
├── js/
│   ├── utils.js        # Helper functions (distance, formatting)
│   ├── map.js          # Leaflet map management
│   ├── planes.js       # Aircraft data fetching and UI
│   ├── location.js     # Geolocation handling
│   └── main.js         # Application initialization
└── README.md


## Usage

1. Open `index.html` in a modern web browser
2. Allow location access when prompted
3. View nearby aircraft on the map and sidebar

## API

Uses [OpenSky Network](https://opensky-network.org/) REST API (no key required).

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Requires geolocation permission

## License


MIT
