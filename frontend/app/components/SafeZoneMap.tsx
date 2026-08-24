/* eslint-disable */
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
    <>
    </div>
  );
}


