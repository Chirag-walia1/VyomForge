from datetime import datetime


# ============================================
# Real Water-Level Data Status
# ============================================

def get_water_level(location: str = "Dharamshala"):
    """
    Return water-level information for a location.

    IMPORTANT:
    No simulated or random water-level values are used.

    Until a verified real-time CWC/NWIC observation
    is connected for the location, the API explicitly
    reports the water-level data as unavailable.
    """

    return {
        "location": location,

        "water_level": None,

        "unit": "m",

        "status": "UNAVAILABLE",

        "sensor": "CWC/NWIC",

        "data_available": False,

        "timestamp": datetime.now().isoformat(),
    }


# ============================================
# Get All Water Levels
# ============================================

def get_all_water_levels():
    """
    Return water-level status for all monitored
    Himachal locations.

    No fake values are generated.
    """

    locations = [
        "Dharamshala",
        "Kangra",
        "Mandi",
    ]

    return {
        location: get_water_level(location)
        for location in locations
    }