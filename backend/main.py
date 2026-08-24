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
def get_risk():

    location_name = "Dharamshala"

    location = LOCATIONS[location_name]

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

    water_level = get_water_level(
        location_name
    )

    # --------------------------------------------------------
    # Government rainfall
    # --------------------------------------------------------

    government_rainfall = get_government_rainfall(
        location_name
    )

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
def weather():

    location = LOCATIONS["Dharamshala"]

    return get_weather(
        latitude=location["latitude"],
        longitude=location["longitude"],
    )


# ============================================================
# GOVERNMENT RAINFALL
# ============================================================

@app.get("/api/rainfall")
def rainfall():

    return get_all_government_rainfall()


# ============================================================
# WATER LEVEL
# ============================================================

@app.get("/api/water-level")
def water_level():

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