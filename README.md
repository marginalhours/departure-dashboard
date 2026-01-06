# Train Board

A minimalist, monochrome live departure board for UK rail stations, designed in the style of teenage engineering. Built for static deployment and optimized for tablet/e-ink displays.

## Features

- Live departure information from National Rail
- Monochrome, minimal UI design
- Client-side only (no backend required)
- API key stored in session storage
- Auto-refresh every 30 seconds
- Responsive design for tablets and e-ink devices
- GitHub Pages ready

## Setup

### Prerequisites

- Node.js 20+
- National Rail API key from [National Rail OpenLDBWS](https://realtime.nationalrail.co.uk/OpenLDBWSRegistration)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173 and enter your API key.

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

The project is configured to automatically deploy to GitHub Pages when you push to the main branch.

You can also deploy manually:

```bash
npm run deploy
```

## Configuration

### Change Station

Edit `src/components/DepartureBoard.tsx` and update the `STATION_CODE` constant:

```typescript
const STATION_CODE = 'HGM'; // High Brooms station code
```

Find station codes at [National Rail station codes](https://www.nationalrail.co.uk/stations_destinations/48541.aspx).

### Change Refresh Interval

Edit `src/components/DepartureBoard.tsx` and update the `REFRESH_INTERVAL` constant (in milliseconds):

```typescript
const REFRESH_INTERVAL = 30000; // 30 seconds
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Huxley2 API (REST wrapper for National Rail OpenLDBWS)

## API

This project uses the [Huxley2 API](https://github.com/jpsingleton/Huxley2), a JSON REST proxy for the GB railways Live Departure Boards SOAP API.

## License

MIT
