"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Fix leafet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FlyToLocation({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 14, { duration: 1.5 });
  }, [lat, lon, map]);
  return null;
}

export default function SafeZoneMap({ userLocation, safePoints }: { userLocation: {lat: number, lon: number}, safePoints: any[] }) {
  if (!userLocation) return null;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" style={{ minHeight: '400px' }}>
      <MapContainer 
        center={[userLocation.lat, userLocation.lon]} 
        zoom={14} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <FlyToLocation lat={userLocation.lat} lon={userLocation.lon} />

        {/* User Location */}
        <CircleMarker 
          center={[userLocation.lat, userLocation.lon]}
          radius={8}
          pathOptions={{ color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.8 }}
        >
          <Popup className="bg-black/80 text-white border-0">
            <strong>My Exact Location</strong>
          </Popup>
        </CircleMarker>

        {/* Safe Points */}
        {safePoints.map((sp, idx) => (
          <Marker key={idx} position={[sp.latitude || userLocation.lat + (Math.random() - 0.5) * 0.02, sp.longitude || userLocation.lon + (Math.random() - 0.5) * 0.02]}>
            <Popup>
              <div className="font-bold">{sp.name}</div>
              <div className="text-xs uppercase text-blue-600">{sp.type}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
