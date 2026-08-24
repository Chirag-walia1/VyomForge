import requests


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather(latitude: float, longitude: float):
    """
    Fetch current + hourly weather data from Open-Meteo.
    No API key required.
    """

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "showers,"
            "wind_speed_10m"
        ),

        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "showers,"
            "precipitation_probability,"
            "soil_moisture_0_to_7cm"
        ),

        "forecast_days": 2,

        "timezone": "Asia/Kolkata",
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    current = data.get("current", {})
    hourly = data.get("hourly", {})

    # --------------------------------
    # Hourly data
    # --------------------------------

    times = hourly.get("time", [])
    precipitation = hourly.get("precipitation", [])
    rain = hourly.get("rain", [])
    showers = hourly.get("showers", [])
    probability = hourly.get("precipitation_probability", [])
    soil_moisture = hourly.get("soil_moisture_0_to_7cm", [])

    # --------------------------------
    # First 24 hours
    # --------------------------------

    next_24_hours = []

    for i in range(min(24, len(times))):

        next_24_hours.append({
            "time": times[i],
            "precipitation": precipitation[i],
            "rain": rain[i],
            "showers": showers[i],
            "precipitation_probability": probability[i],
            "soil_moisture": soil_moisture[i],
        })

    # --------------------------------
    # 24-hour rainfall
    # --------------------------------

    rainfall_24h = sum(
        value or 0
        for value in precipitation[:24]
    )

    max_hourly_rain = max(
        [value or 0 for value in precipitation[:24]],
        default=0
    )

    max_rain_probability = max(
        [value or 0 for value in probability[:24]],
        default=0
    )

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },

        "current": {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "precipitation": current.get("precipitation"),
            "rain": current.get("rain"),
            "showers": current.get("showers"),
            "wind_speed": current.get("wind_speed_10m"),
        },

        "forecast": {
            "rainfall_next_24h": round(rainfall_24h, 2),
            "max_hourly_rain": round(max_hourly_rain, 2),
            "max_rain_probability": max_rain_probability,
            "hours": next_24_hours,
        },

        "source": "Open-Meteo",
    }