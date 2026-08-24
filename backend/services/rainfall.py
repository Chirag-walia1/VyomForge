import csv
import io
import requests
from datetime import datetime, timedelta


# ============================================================
# Official Himachal Pradesh Government Rainfall Telemetry
# ============================================================

NWIC_RAINFALL_URL = (
    "https://nwdp.nwic.gov.in/"
    "dataset/30da9f29-3aab-408b-8b03-01d66a9a449e/"
    "resource/d377b4ab-cd9f-4462-b331-959f465cb88d/"
    "download/rainfall_tel_hr_himachal_pradesh_hp_2026_2030.csv"
)

SOURCE_NAME = "NWIC / Himachal Pradesh Government"

# Data older than this is considered stale.
STALE_AFTER_HOURS = 24


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
# Distance
# ============================================================

def _distance(lat1, lon1, lat2, lon2):
    return (
        (lat1 - lat2) ** 2
        + (lon1 - lon2) ** 2
    )


# ============================================================
# Parse Government Timestamp
# ============================================================

def _parse_acquisition_time(value):
    """
    Parse NWIC timestamp.

    Expected format:
        DD-MM-YYYY HH:MM
    """

    if not value:
        return None

    try:
        return datetime.strptime(
            value.strip(),
            "%d-%m-%Y %H:%M",
        )

    except (TypeError, ValueError):
        return None


# ============================================================
# Determine Freshness
# ============================================================

def _get_status(acquisition_time):
    """
    Determine whether government rainfall
    telemetry is fresh or stale.
    """

    if acquisition_time is None:
        return "NO_TIMESTAMP"

    now = datetime.now()

    age = now - acquisition_time

    if age < timedelta(hours=0):
        return "AVAILABLE"

    if age <= timedelta(
        hours=STALE_AFTER_HOURS
    ):
        return "AVAILABLE"

    return "STALE"


# ============================================================
# Get Government Rainfall
# ============================================================

def get_government_rainfall(location: str):

    if location not in LOCATIONS:
        raise ValueError(
            f"Unknown location: {location}"
        )

    target = LOCATIONS[location]

    try:

        response = requests.get(
            NWIC_RAINFALL_URL,
            timeout=60,
        )

        response.raise_for_status()

        reader = csv.DictReader(
            io.StringIO(response.text)
        )

        nearest_station = None
        nearest_distance = float("inf")

        station_rows = {}

        # ====================================================
        # Find nearest station
        # ====================================================

        for row in reader:

            station = row.get("Station")

            if not station:
                continue

            try:

                latitude = float(
                    row.get("Latitude")
                )

                longitude = float(
                    row.get("Longitude")
                )

            except (
                TypeError,
                ValueError,
            ):
                continue

            distance = _distance(
                target["latitude"],
                target["longitude"],
                latitude,
                longitude,
            )

            if station not in station_rows:

                station_rows[station] = {
                    "distance": distance,
                    "rows": [],
                }

            station_rows[station]["rows"].append(
                row
            )

            if distance < nearest_distance:

                nearest_distance = distance
                nearest_station = station

        # ====================================================
        # No Station Found
        # ====================================================

        if nearest_station is None:

            return {
                "location": location,
                "station": None,
                "rainfall": None,
                "unit": "mm",
                "data_available": False,
                "status": "UNAVAILABLE",
                "source": SOURCE_NAME,
                "timestamp": datetime.now().isoformat(),
            }

        # ====================================================
        # Get Station Rows
        # ====================================================

        rows = station_rows[
            nearest_station
        ]["rows"]

        # ====================================================
        # Find ACTUAL Latest Observation
        #
        # Do NOT use rows[-1].
        # CSV ordering cannot be blindly trusted.
        # ====================================================

        valid_rows = []

        for row in rows:

            acquisition_raw = row.get(
                "Data Acquisition Time"
            )

            acquisition_time = (
                _parse_acquisition_time(
                    acquisition_raw
                )
            )

            if acquisition_time is None:
                continue

            valid_rows.append(
                (
                    acquisition_time,
                    row,
                )
            )

        # ====================================================
        # No Valid Timestamp
        # ====================================================

        if not valid_rows:

            return {
                "location": location,
                "station": nearest_station,
                "rainfall": None,
                "unit": "mm",
                "data_available": False,
                "status": "NO_TIMESTAMP",
                "source": SOURCE_NAME,
                "timestamp": datetime.now().isoformat(),
            }

        # ====================================================
        # Sort By Actual Acquisition Time
        # ====================================================

        valid_rows.sort(
            key=lambda item: item[0]
        )

        latest_time, latest = valid_rows[-1]

        acquisition_raw = latest.get(
            "Data Acquisition Time"
        )

        # ====================================================
        # Rainfall Value
        # ====================================================

        rainfall_raw = latest.get(
            "Telemetry Hourly Rainfall (mm)"
        )

        try:

            rainfall = float(
                rainfall_raw
            )

        except (
            TypeError,
            ValueError,
        ):

            rainfall = None

        # ====================================================
        # Freshness Status
        # ====================================================

        freshness_status = _get_status(
            latest_time
        )

        # A numerical reading exists even when stale.
        # Therefore data_available means reading exists,
        # while status tells whether it is fresh.
        data_available = (
            rainfall is not None
        )

        if rainfall is None:

            status = "NO_READING"

        else:

            status = freshness_status

        # ====================================================
        # Age In Hours
        # ====================================================

        age_hours = round(
            max(
                0,
                (
                    datetime.now()
                    - latest_time
                ).total_seconds()
                / 3600,
            ),
            1,
        )

        # ====================================================
        # Return
        # ====================================================

        return {

            "location": location,

            "station": latest.get(
                "Station"
            ),

            "district": latest.get(
                "District"
            ),

            "latitude": latest.get(
                "Latitude"
            ),

            "longitude": latest.get(
                "Longitude"
            ),

            "rainfall": rainfall,

            "unit": "mm",

            "data_available": (
                data_available
            ),

            "status": status,

            "source": SOURCE_NAME,

            "data_acquisition_time": (
                acquisition_raw
            ),

            "data_age_hours": age_hours,

            "freshness_limit_hours": (
                STALE_AFTER_HOURS
            ),

            "timestamp": (
                datetime.now().isoformat()
            ),
        }

    # ========================================================
    # Network Error
    # ========================================================

    except requests.RequestException as error:

        return {

            "location": location,

            "station": None,

            "rainfall": None,

            "unit": "mm",

            "data_available": False,

            "status": "ERROR",

            "source": SOURCE_NAME,

            "error": str(error),

            "timestamp": (
                datetime.now().isoformat()
            ),
        }

    # ========================================================
    # Unexpected Error
    # ========================================================

    except Exception as error:

        return {

            "location": location,

            "station": None,

            "rainfall": None,

            "unit": "mm",

            "data_available": False,

            "status": "ERROR",

            "source": SOURCE_NAME,

            "error": str(error),

            "timestamp": (
                datetime.now().isoformat()
            ),
        }


# ============================================================
# Get All Government Rainfall
# ============================================================

def get_all_government_rainfall():

    results = {}

    for location in LOCATIONS:

        try:

            results[location] = (
                get_government_rainfall(
                    location
                )
            )

        except Exception as error:

            results[location] = {

                "location": location,

                "station": None,

                "rainfall": None,

                "unit": "mm",

                "data_available": False,

                "status": "ERROR",

                "source": SOURCE_NAME,

                "error": str(error),

                "timestamp": (
                    datetime.now().isoformat()
                ),
            }

    return results