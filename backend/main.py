from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.weather import get_weather
from services.risk_history import (
    save_risk_history,
    get_risk_history,
)
from services.risk_engine import calculate_risk
from services.alerts import generate_alerts
from services.water_level import (
    get_water_level,
    get_all_water_levels,
)
from services.rainfall import (
from services.safe_points import get_safe_points
    get_government_rainfall,
    get_all_government_rainfall,
)


app = FastAPI(title="HimAlert API")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOCATIONS
# ============================================================

LOCATIONS = {
    "Dharamshala": {
        "latitude": 32.2190,
        "longitude": 76.3234,
    },
    "Kangra": {
        "latitude": 32.0998,
        "longitude": 76.2691,
    },
    "Mandi": {
        "latitude": 31.7080,
        "longitude": 76.9320,
    },
}


import requests

# ============================================================
# SEARCH LOCATIONS
# ============================================================
@app.get("/api/locations/search")
def search_locations(query: str):
    try:
        res = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5&language=en&format=json")
        data = res.json()
        results = data.get("results", [])
        # Filter for India/Himachal Pradesh if possible, or just return top results
        # To be safe and broad, we return the top 5 matches
        return {"results": [{"name": r.get("name"), "admin1": r.get("admin1"), "country": r.get("country"), "latitude": r.get("latitude"), "longitude": r.get("longitude")} for r in results]}
    except Exception as e:
        return {"results": []}

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "HimAlert API is running"
    }


# ============================================================
# SINGLE LOCATION RISK
# ============================================================

@app.get("/api/risk")
def get_risk(lat: float = None, lon: float = None):

    location_name = "Dharamshala" if not lat else "My Location"
    location = LOCATIONS[location_name] if not lat else {"latitude": lat, "longitude": lon}

    # --------------------------------------------------------
    # Weather
    # --------------------------------------------------------

    weather = get_weather(
        latitude=location["latitude"],
        longitude=location["longitude"],
    )

    # --------------------------------------------------------
    # Water level
    # --------------------------------------------------------

    water_level = get_water_level(location_name, lat=lat, lon=lon)

    # --------------------------------------------------------
    # Government rainfall
    # --------------------------------------------------------

    government_rainfall = get_government_rainfall(location_name, latitude=lat, longitude=lon)

    # --------------------------------------------------------
    # Risk calculation
    # --------------------------------------------------------

    risk = calculate_risk(
        weather,
        water_level,
        government_rainfall,
    )

    # Keep complete government rainfall information
    risk["government_rainfall"] = government_rainfall

    # --------------------------------------------------------
    # Save history
    # --------------------------------------------------------

    save_risk_history(
        location=location_name,
        risk_data=risk,
    )

    return risk


# ============================================================
# WEATHER
# ============================================================

@app.get("/api/weather")
def weather(lat: float = None, lon: float = None):
    return get_weather(latitude=lat if lat else LOCATIONS["Dharamshala"]["latitude"], longitude=lon if lon else LOCATIONS["Dharamshala"]["longitude"])


# ============================================================
# GOVERNMENT RAINFALL
# ============================================================

@app.get("/api/rainfall")
def rainfall(lat: float = None, lon: float = None):

    return get_all_government_rainfall()


# ============================================================
# WATER LEVEL
# ============================================================

@app.get("/api/water-level")
def water_level(lat: float = None, lon: float = None):

    return get_water_level(
        "Dharamshala"
    )


# ============================================================
# ALL WATER LEVELS
# ============================================================

@app.get("/api/water-levels")
def water_levels():

    return {
        "locations": get_all_water_levels()
    }


# ============================================================
# LOCATION-WISE RISK
# ============================================================

@app.get("/api/locations-risk")
def get_locations_risk():

    results = []

    for name, location in LOCATIONS.items():

        try:

            # ------------------------------------------------
            # Weather
            # ------------------------------------------------

            weather = get_weather(
                latitude=location["latitude"],
                longitude=location["longitude"],
            )

            # ------------------------------------------------
            # Water level
            # ------------------------------------------------

            water_level = get_water_level(
                name
            )

            # ------------------------------------------------
            # Government rainfall
            # ------------------------------------------------

            government_rainfall = (
                get_government_rainfall(
                    name
                )
            )

            # ------------------------------------------------
            # Risk calculation
            # ------------------------------------------------

            risk = calculate_risk(
                weather,
                water_level,
                government_rainfall,
            )

            # ------------------------------------------------
            # Result
            # ------------------------------------------------

            results.append({

                "name": name,

                "latitude": location[
                    "latitude"
                ],

                "longitude": location[
                    "longitude"
                ],

                # Risk scores
                "flash_flood": risk[
                    "flash_flood"
                ],

                "landslide": risk[
                    "landslide"
                ],

                "extreme_rainfall": risk[
                    "extreme_rainfall"
                ],

                "overall": risk[
                    "overall"
                ],

                # ------------------------------------------------
                # Water information
                # ------------------------------------------------

                "water_level": (
                    water_level.get(
                        "water_level"
                    )
                    if water_level
                    else None
                ),

                "water_status": (
                    water_level.get(
                        "status"
                    )
                    if water_level
                    else "UNAVAILABLE"
                ),

                # ------------------------------------------------
                # Government rainfall information
                # ------------------------------------------------

                "government_rainfall": (
                    government_rainfall.get(
                        "rainfall"
                    )
                ),

                "rainfall_station": (
                    government_rainfall.get(
                        "station"
                    )
                ),

                "rainfall_status": (
                    government_rainfall.get(
                        "status"
                    )
                ),

                                "rainfall_updated": (
                    government_rainfall.get(
                        "data_acquisition_time"
                    )
                ),

                "rainfall_age_hours": (
                    government_rainfall.get(
                        "data_age_hours"
                    )
                ),

                "rainfall_source": (
                    government_rainfall.get(
                        "source"
                    )
                ),

                # ------------------------------------------------
                # Risk engine inputs
                # ------------------------------------------------

                "inputs": risk[
                    "inputs"
                ],

            })

            # ------------------------------------------------
            # Save history
            # ------------------------------------------------

            save_risk_history(
                location=name,
                risk_data=risk,
            )

        except Exception as error:

            results.append({

                "name": name,

                "latitude": location[
                    "latitude"
                ],

                "longitude": location[
                    "longitude"
                ],

                "error": str(error),

            })

    return {
        "locations": results
    }


# ============================================================
# RISK HISTORY
# ============================================================

@app.get("/api/risk-history")
def risk_history(
    location: str = "all"
):

    history = get_risk_history(
        location=location
    )

    return {

        "location": location,

        "count": len(history),

        "history": history,

    }


# ============================================================
# ALERTS
# ============================================================

@app.get("/api/alerts")
def get_alerts():

    results = []

    for name, location in LOCATIONS.items():

        try:

            # ------------------------------------------------
            # Weather
            # ------------------------------------------------

            weather = get_weather(
                latitude=location["latitude"],
                longitude=location["longitude"],
            )

            # ------------------------------------------------
            # Water level
            # ------------------------------------------------

            water_level = get_water_level(
                name
            )

            # ------------------------------------------------
            # Government rainfall
            # ------------------------------------------------

            government_rainfall = (
                get_government_rainfall(
                    name
                )
            )

            # ------------------------------------------------
            # Risk calculation
            # ------------------------------------------------

            risk = calculate_risk(
                weather,
                water_level,
                government_rainfall,
            )

            # ------------------------------------------------
            # Alert input
            # ------------------------------------------------

            results.append({

                "name": name,

                "latitude": location[
                    "latitude"
                ],

                "longitude": location[
                    "longitude"
                ],

                "flash_flood": risk[
                    "flash_flood"
                ],

                "landslide": risk[
                    "landslide"
                ],

                "extreme_rainfall": risk[
                    "extreme_rainfall"
                ],

                "overall": risk[
                    "overall"
                ],

                "inputs": risk[
                    "inputs"
                ],

                "government_rainfall": (
                    government_rainfall
                ),

            })

        except Exception as error:

            print(
                f"Alert calculation failed "
                f"for {name}: {error}"
            )

    # --------------------------------------------------------
    # Generate alerts
    # --------------------------------------------------------

    alerts = generate_alerts(
        results
    )

    return {

        "count": len(alerts),

        "alerts": alerts,

    }
# ============================================================
# SAFE POINTS
# ============================================================
@app.get("/api/safe-points")
def safe_points(lat: float, lon: float):
    return {"safe_points": get_safe_points(lat, lon)}





