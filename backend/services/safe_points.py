import requests

def get_safe_points(lat: float, lon: float, radius: int = 3000):
    """
    Fetch real-world emergency safe points (hospitals, schools, community centers)
    near the user's location using OpenStreetMap Overpass API.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Query for hospitals, clinics, schools, and community centres within radius (meters)
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lon});
      node["amenity"="clinic"](around:{radius},{lat},{lon});
      node["amenity"="school"](around:{radius},{lat},{lon});
      node["amenity"="community_centre"](around:{radius},{lat},{lon});
    );
    out center 5;
    """
    
    try:
        response = requests.post(overpass_url, data={'data': overpass_query}, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        safe_points = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "Designated Safe Zone")
            amenity = tags.get("amenity", "safe_zone").replace("_", " ").title()
            
            safe_points.append({
                "name": name,
                "type": amenity,
                "latitude": element.get("lat"),
                "longitude": element.get("lon")
            })
            
        return safe_points
    except Exception as e:
        return []
