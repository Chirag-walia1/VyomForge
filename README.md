# HimAlert by VyomForge

**HimAlert** is a real-time, AI-driven disaster intelligence and early warning system designed specifically for the Himalayan region (Himachal Pradesh, India). It provides predictive insights for flash floods, landslides, and extreme rainfall events.

## Features

- **Real-Time Hydrological Intelligence:** Dynamically tracks major river systems (Beas, Ravi, Sutlej) using telemetry data from the CWC/NWIC and Open-Meteo.
- **Predictive Risk Engine:** A multi-factor Python risk engine that calculates flash flood and landslide probabilities based on hourly precipitation, soil moisture, humidity, and terrain gradient.
- **24-Hour Threat Outlook:** Real-time predictive forecasting that identifies critical danger zones up to 24 hours in advance.
- **Interactive Geospatial Intelligence:** 
  - **Global Map:** Color-coded risk map for all major districts.
  - **Safe Zone Map (Local):** High-precision locator guiding users to the nearest government-designated safe shelters.
- **Edge Proxy Architecture:** Seamlessly bypasses public API rate limits using Next.js Edge Functions and TTLCache for 100% reliable uptime.

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Recharts, React Leaflet (Mapbox/OSM), Lucide Icons.
- **Backend:** Python, FastAPI, Uvicorn, Cachetools, Open-Meteo API.
- **Deployment:** Vercel (Frontend), Render (Backend).

## Quick Start

### 1. Run the Backend (FastAPI)
\\\ash
cd backend
python -m venv env
source env/bin/activate  # On Windows use \env\Scripts\activate\
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\\\

### 2. Run the Frontend (Next.js)
\\\ash
cd frontend
npm install
npm run dev
\\\
The application will be available at \http://localhost:3000\.

## License
MIT License. Built by Team VyomForge.
