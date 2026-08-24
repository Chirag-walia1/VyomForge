"use client";

import { useEffect, useState } from "react";

import { MapContainer, TileLayer, ZoomControl, GeoJSON, CircleMarker, Circle, useMap, Marker, Popup } from "react-leaflet";

import "leaflet/dist/leaflet.css";

/* ============================================================
   TYPES
============================================================ */

type LocationRisk = {
  name: string;

  latitude: number;
  longitude: number;

  flash_flood: number;
  landslide: number;
  extreme_rainfall: number;

  overall: string;

  government_rainfall?: number | null;
  rainfall_station?: string | null;
  rainfall_status?: string | null;
  rainfall_updated?: string | null;
  rainfall_source?: string | null;
  rainfall_age_hours?: number | null;

  water_level?: number | null;
  water_status?: string | null;

  inputs: {
    current_rain: number;
    government_rainfall?: number | null;
    rainfall_next_24h: number;
    rain_probability: number;
    humidity: number;
    wind_speed: number;
    soil_moisture: number;

    water_level?: number | null;
    water_status?: string;
  };
};

type MapStyle =
  | "street"
  | "terrain"
  | "satellite";

/* ============================================================
   MAP RESET CONTROL
============================================================ */

function ResetViewButton() {
  const map = useMap();

  const resetMap = () => {
    map.setView(
      [31.8, 77.2],
      8,
      {
        animate: true,
        duration: 0.8,
      }
    );
  };

  return (
    <button
      onClick={resetMap}
      className="
        rounded-xl
        border border-slate-200
        bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
        px-3 py-2
        text-xs font-semibold
        text-white
        shadow-xl
        backdrop-blur-xl
        transition
        hover:bg-black/40 backdrop-blur-md border border-white/10 text-white
      "
    >
       Reset View
    </button>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function RiskMap() {
  const [himachalData, setHimachalData] =
    useState<any>(null);

  const [locations, setLocations] =
    useState<LocationRisk[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedLocation, setSelectedLocation] =
    useState<LocationRisk | null>(null);

  const [mapStyle, setMapStyle] =
    useState<MapStyle>("satellite");

  const [showRiskZones, setShowRiskZones] =
    useState(true);

  const [showBoundary, setShowBoundary] =
    useState(true);

  /* ==========================================================
     LOAD HIMACHAL GEOJSON
  ========================================================== */

  useEffect(() => {
    fetch("/himachal_pradesh.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Himachal GeoJSON not found"
          );
        }

        return response.json();
      })
      .then((data) => {
        setHimachalData(data);
      })
      .catch((error) => {
        console.error(
          "GeoJSON loading error:",
          error
        );
      });
  }, []);

  /* ==========================================================
     LIVE LOCATION RISK
  ========================================================== */

  useEffect(() => {
    const fetchLocationRisk = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/locations-risk",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Location Risk API failed"
          );
        }

        const data =
          await response.json();

        const nextLocations =
          data.locations || [];

        setLocations(nextLocations);

        setSelectedLocation(
          (previous) => {
            if (!previous) {
              return null;
            }

            return (
              nextLocations.find(
                (item: LocationRisk) =>
                  item.name === previous.name
              ) || null
            );
          }
        );
      } catch (error) {
        console.error(
          "Location Risk Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLocationRisk();

    const interval = setInterval(
      fetchLocationRisk,
      5 * 60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* ==========================================================
     RISK HELPERS
  ========================================================== */

  const getHighestRisk = (
    location: LocationRisk
  ) => {
    return Math.max(
      location.flash_flood,
      location.landslide,
      location.extreme_rainfall
    );
  };

  const getRiskColor = (
    risk: number
  ) => {
    if (risk >= 75) {
      return "#ef4444";
    }

    if (risk >= 60) {
      return "#f97316";
    }

    if (risk >= 40) {
      return "#eab308";
    }

    return "#22c55e";
  };

  const getRiskLabel = (
    risk: number
  ) => {
    if (risk >= 75) {
      return "CRITICAL";
    }

    if (risk >= 60) {
      return "HIGH";
    }

    if (risk >= 40) {
      return "MODERATE";
    }

    return "LOW";
  };

  const getRiskBackground = (
    risk: number
  ) => {
    if (risk >= 75) {
      return "bg-red-500/10 border-red-500/30";
    }

    if (risk >= 60) {
      return "bg-orange-500/10 border-orange-500/30";
    }

    if (risk >= 40) {
      return "bg-yellow-500/10 border-yellow-500/30";
    }

    return "bg-emerald-500/10 border-emerald-500/30";
  };

  /* ==========================================================
     TILE MAP
  ========================================================== */

  const tileUrl =
    mapStyle === "satellite"
      ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      : mapStyle === "terrain"
      ? "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution =
    mapStyle === "satellite"
      ? "Tiles  Esri"
      : mapStyle === "terrain"
      ? " OpenTopoMap contributors"
      : " OpenStreetMap contributors";

  /* ==========================================================
     SELECT LOCATION
  ========================================================== */

  const selectLocation = (
    location: LocationRisk
  ) => {
    setSelectedLocation(location);
  };

  const closePanel = () => {
    setSelectedLocation(null);
  };

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <div
      className="
        relative
        h-[440px]
        sm:h-[500px]
        lg:h-[560px]
        w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        bg-black/40 backdrop-blur-md border border-white/10 text-white
      "
    >

      {/* ======================================================
          MAP
      ====================================================== */}

      <MapContainer
        center={[31.8, 77.2]}
        zoom={8}
        minZoom={7}
        maxZoom={18}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >

        {/* ====================================================
            BASE MAP
        ==================================================== */}

        <TileLayer
          key={mapStyle}
          url={tileUrl}
          attribution={tileAttribution}
        />

        {/* ====================================================
            SATELLITE LABEL OVERLAY
        ==================================================== */}

        {mapStyle === "satellite" && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri"
            opacity={0.9}
          />
        )}

        {/* ====================================================
            HIMACHAL BOUNDARY
        ==================================================== */}

        {showBoundary &&
          himachalData && (
            <GeoJSON
              data={himachalData}
              style={{
                color: "#22d3ee",
                weight: 3,
                opacity: 0.95,
                fillColor: "#06b6d4",
                fillOpacity:
                  mapStyle === "satellite"
                    ? 0.07
                    : 0.10,
              }}
            />
          )}

        {/* ====================================================
            RISK ZONES
        ==================================================== */}

        {showRiskZones &&
          locations.map(
            (location) => {
              const risk =
                getHighestRisk(
                  location
                );

              const color =
                getRiskColor(risk);

              const radius =
                1100 + risk * 28;

              return (
                <div
                  key={location.name}
                >

                  {/* Outer zone */}

                  <Circle
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={radius}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.13,
                      weight: 2,
                      opacity: 0.55,
                    }}
                  />

                  {/* Inner zone */}

                  <Circle
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={
                      radius * 0.45
                    }
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.08,
                      weight: 1,
                      opacity: 0.4,
                    }}
                  />

                  {/* Marker */}

                  <CircleMarker
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={10}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: color,
                      fillOpacity: 1,
                      weight: 3,
                    }}
                    eventHandlers={{
                      click: () =>
                        selectLocation(
                          location
                        ),
                    }}
                  />

                </div>
              );
            }
          )}

        {/* ====================================================
            ZOOM
        ==================================================== */}

        <ZoomControl
          position="bottomright"
        />

        {/* ====================================================
            RESET
        ==================================================== */}

        <div
          className="
            absolute
            bottom-4
            right-14
            z-[1000]
          "
        >
          <ResetViewButton />
        </div>

      </MapContainer>

      {/* ======================================================
          TOP LEFT BRAND
      ====================================================== */}

      <div
        className="
          absolute
          left-4
          top-4
          z-[1000]
          rounded-2xl
          border border-slate-200
          bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
          px-4 py-3
          text-white
          shadow-2xl
          backdrop-blur-xl
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10 w-10
              items-center
              justify-center
              rounded-xl
              bg-cyan-500/15
              text-lg
            "
          >
            
          </div>

          <div>
            <p
              className="
                text-sm
                font-bold
              "
            >
              Himachal Risk Map
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                text-white/70
              "
            >
              Live multi-hazard intelligence
            </p>
          </div>

        </div>

      </div>

      {/* ======================================================
          LIVE STATUS
      ====================================================== */}

      <div
        className="
          absolute
          left-4
          top-[92px]
          z-[1000]
          flex
          items-center
          gap-2
          rounded-full
          border border-emerald-400/20
          bg-black/40 backdrop-blur-md border border-white/10 text-white/85 shadow-sm
          px-3 py-2
          text-[10px]
          font-semibold
          text-emerald-400
          shadow-xl
          backdrop-blur-xl
        "
      >

        <span
          className="
            h-2
            w-2
            animate-pulse
            rounded-full
            bg-emerald-400
          "
        />

        LIVE RISK DATA

      </div>

      {/* ======================================================
          MAP STYLE
      ====================================================== */}

      <div
        className="
          absolute
          right-4
          top-4
          z-[1000]
          rounded-2xl
          border border-slate-200
          bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
          p-2
          shadow-2xl
          backdrop-blur-xl
        "
      >

        <p
          className="
            px-2
            pb-2
            pt-1
            text-[9px]
            font-semibold
            uppercase
            tracking-widest
            text-white/70
          "
        >
          Map Style
        </p>

        <div className="flex gap-1">

          <button
            onClick={() =>
              setMapStyle("street")
            }
            className={`
              rounded-lg
              px-3 py-2
              text-[10px]
              font-semibold
              transition
              ${
                mapStyle === "street"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-black/40 backdrop-blur-md border border-white/10 text-white text-slate-700 hover:bg-slate-100"
              }
            `}
          >
            Street
          </button>

          <button
            onClick={() =>
              setMapStyle("terrain")
            }
            className={`
              rounded-lg
              px-3 py-2
              text-[10px]
              font-semibold
              transition
              ${
                mapStyle === "terrain"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-black/40 backdrop-blur-md border border-white/10 text-white text-slate-700 hover:bg-slate-100"
              }
            `}
          >
            Terrain
          </button>

          <button
            onClick={() =>
              setMapStyle("satellite")
            }
            className={`
              rounded-lg
              px-3 py-2
              text-[10px]
              font-semibold
              transition
              ${
                mapStyle === "satellite"
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-black/40 backdrop-blur-md border border-white/10 text-white text-slate-700 hover:bg-slate-100"
              }
            `}
          >
            Satellite
          </button>

        </div>

      </div>

      {/* ======================================================
          LAYER CONTROLS
      ====================================================== */}

      <div
        className="
          absolute
          bottom-4
          left-4
          z-[1000]
          rounded-2xl
          border border-slate-200
          bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
          p-3
          text-white
          shadow-2xl
          backdrop-blur-xl
        "
      >

        <p
          className="
            mb-2
            text-[9px]
            font-semibold
            uppercase
            tracking-widest
            text-white/70
          "
        >
          Layers
        </p>

        <div className="space-y-2">

          <button
            onClick={() =>
              setShowRiskZones(
                (value) => !value
              )
            }
            className="
              flex
              items-center
              gap-2
              text-xs
              text-slate-700
            "
          >

            <span
              className={`
                h-3 w-3
                rounded-full
                border
                ${
                  showRiskZones
                    ? "border-red-300 bg-red-500"
                    : "border-slate-300 bg-black/40 backdrop-blur-md border border-white/10 text-white"
                }
              `}
            />

            Risk Zones

          </button>

          <button
            onClick={() =>
              setShowBoundary(
                (value) => !value
              )
            }
            className="
              flex
              items-center
              gap-2
              text-xs
              text-slate-700
            "
          >

            <span
              className={`
                h-3 w-3
                rounded-full
                border
                ${
                  showBoundary
                    ? "border-cyan-200 bg-cyan-400"
                    : "border-slate-300 bg-black/40 backdrop-blur-md border border-white/10 text-white"
                }
              `}
            />

            Himachal Boundary

          </button>

        </div>

      </div>

      {/* ======================================================
          RISK LEGEND
      ====================================================== */}

      <div
        className="
          absolute
          bottom-4
          left-[170px]
          z-[1000]
          hidden
          rounded-2xl
          border border-slate-200
          bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
          px-4 py-3
          text-xs
          text-white
          shadow-2xl
          backdrop-blur-xl
          md:block
        "
      >

        <p
          className="
            mb-2
            text-[9px]
            font-semibold
            uppercase
            tracking-widest
            text-white/70
          "
        >
          Risk Level
        </p>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Low
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            Moderate
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            High
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Critical
          </div>

        </div>

      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-[1100]
            -translate-x-1/2
            -translate-y-1/2
            rounded-2xl
            border border-slate-200
            bg-black/40 backdrop-blur-md border border-white/10 text-white/90 shadow-sm
            px-5 py-4
            text-sm
            text-white
            shadow-2xl
            backdrop-blur-xl
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                h-3 w-3
                animate-pulse
                rounded-full
                bg-cyan-400
              "
            />

            Loading live risk data...

          </div>

        </div>
      )}

      {/* ======================================================
          SELECTED LOCATION PANEL
      ====================================================== */}

      {selectedLocation && (
        <div
          className="
            absolute
            right-4
            top-[88px]
            z-[1200]
            max-h-[calc(100%-120px)]
            w-[min(370px,calc(100%-32px))]
            overflow-y-auto
            rounded-2xl
            border border-slate-200
            bg-black/40 backdrop-blur-md border border-white/10 text-white/95 shadow-sm
            p-4
            text-white
            shadow-2xl
            backdrop-blur-2xl
          "
        >

          {/* Header */}

          <div
            className="
              flex
              items-start
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-cyan-400
                "
              >
                Location Intelligence
              </p>

              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                "
              >
                {selectedLocation.name}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-white/70
                "
              >
                Live multi-hazard assessment
              </p>

            </div>

            <button
              onClick={closePanel}
              className="
                flex
                h-9 w-9
                items-center
                justify-center
                rounded-xl
                bg-black/40 backdrop-blur-md border border-white/10 text-white
                text-xl
                text-slate-700
                transition
                hover:bg-slate-100
                hover:text-white
              "
            >
              
            </button>

          </div>

          {/* Overall */}

          {(() => {
            const risk =
              getHighestRisk(
                selectedLocation
              );

            const color =
              getRiskColor(risk);

            const label =
              getRiskLabel(risk);

            return (
              <div
                className={`
                  mt-5
                  rounded-2xl
                  border
                  p-4
                  ${getRiskBackground(risk)}
                `}
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <div>

                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-widest
                        text-white/70
                      "
                    >
                      Overall Threat
                    </p>

                    <p
                      className="
                        mt-1
                        text-4xl
                        font-black
                      "
                      style={{
                        color,
                      }}
                    >
                      {risk}%
                    </p>

                  </div>

                  <div className="text-right">

                    <p
                      className="
                        text-sm
                        font-bold
                      "
                      style={{
                        color,
                      }}
                    >
                      {label}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-white/70
                      "
                    >
                      Current assessment
                    </p>

                  </div>

                </div>

              </div>
            );
          })()}

          {/* Hazard Scores */}

          <div
            className="
              mt-4
              grid
              grid-cols-3
              gap-2
            "
          >

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] uppercase text-white/70">
                 Flood
              </p>

              <p className="mt-1 text-lg font-bold text-orange-400">
                {selectedLocation.flash_flood}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] uppercase text-white/70">
                 Landslide
              </p>

              <p className="mt-1 text-lg font-bold text-yellow-400">
                {selectedLocation.landslide}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] uppercase text-white/70">
                 Rain
              </p>

              <p className="mt-1 text-lg font-bold text-red-400">
                {selectedLocation.extreme_rainfall}%
              </p>
            </div>

          </div>

          {/* Weather */}

          <div className="mt-5">

            <div className="mb-3 flex items-center justify-between">

              <h3 className="text-sm font-bold">
                Live Weather
              </h3>

              <span
                className="
                  rounded-full
                  bg-cyan-500/10
                  px-2 py-1
                  text-[9px]
                  text-cyan-400
                "
              >
                LIVE
              </span>

            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-2
              "
            >

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Current Rain
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.current_rain ?? 0} mm
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Next 24h
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.rainfall_next_24h ?? 0} mm
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Probability
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.rain_probability ?? 0}%
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Humidity
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.humidity ?? 0}%
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Wind
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.wind_speed ?? 0} km/h
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-white/70">
                   Soil
                </p>

                <p className="mt-1 text-sm font-bold">
                  {selectedLocation.inputs?.soil_moisture ?? 0}
                </p>
              </div>

            </div>

          </div>

          {/* Government Rainfall */}

          <div
            className="
              mt-5
              rounded-2xl
              border border-slate-200
              bg-slate-50
              p-4
            "
          >

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-bold">
                 Government Rainfall
              </h3>

              <span
                className={`
                  rounded-full
                  px-2 py-1
                  text-[9px]
                  font-semibold
                  ${
                    selectedLocation.rainfall_status ===
                    "AVAILABLE"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }
                `}
              >
                {selectedLocation.rainfall_status ??
                  "UNKNOWN"}
              </span>

            </div>

            <div
              className="
                mt-4
                flex
                items-end
                justify-between
              "
            >

              <p className="text-3xl font-black">

                {selectedLocation.government_rainfall ??
                  "N/A"}

                <span className="ml-1 text-sm font-normal text-white/70">
                  mm
                </span>

              </p>

              {selectedLocation.rainfall_age_hours !==
                null &&
                selectedLocation.rainfall_age_hours !==
                  undefined && (
                  <p className="text-right text-[10px] text-white/70">
                    Data age
                    <br />
                    <span className="text-slate-700">
                      {selectedLocation.rainfall_age_hours.toFixed(
                        1
                      )}{" "}
                      hours
                    </span>
                  </p>
                )}

            </div>

            {/* Stale warning */}

            {selectedLocation.rainfall_status ===
              "STALE" && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border border-yellow-500/20
                  bg-yellow-500/5
                  p-3
                  text-xs
                  text-yellow-400
                "
              >
                 Government rainfall data is stale.

                {selectedLocation.rainfall_age_hours !==
                  null &&
                  selectedLocation.rainfall_age_hours !==
                    undefined && (
                    <span className="ml-1 font-semibold">
                      (
                      {selectedLocation.rainfall_age_hours.toFixed(
                        1
                      )}{" "}
                      hours old)
                    </span>
                  )}
              </div>
            )}

            <div className="mt-4 space-y-2 text-xs">

              <div className="flex justify-between gap-4">
                <span className="text-white/70">
                  Station
                </span>

                <span className="text-right text-slate-700">
                  {selectedLocation.rainfall_station ??
                    "N/A"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/70">
                  Updated
                </span>

                <span className="text-right text-slate-700">
                  {selectedLocation.rainfall_updated ??
                    "N/A"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-white/70">
                  Source
                </span>

                <span className="max-w-[190px] text-right text-slate-700">
                  {selectedLocation.rainfall_source ??
                    "NWIC / Himachal Pradesh Government"}
                </span>
              </div>

            </div>

          </div>

          {/* Water */}

          <div
            className="
              mt-4
              rounded-2xl
              border border-slate-200
              bg-slate-50
              p-4
            "
          >

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-bold">
                 Water Level
              </h3>

              <span
                className="
                  rounded-full
                  bg-black/40 backdrop-blur-md border border-white/10 text-white
                  px-2 py-1
                  text-[9px]
                  text-white/70
                "
              >
                {selectedLocation.water_status ??
                  "UNAVAILABLE"}
              </span>

            </div>

            <p className="mt-3 text-xl font-bold">

              {selectedLocation.water_level ??
                "Data unavailable"}

              {selectedLocation.water_level !==
                null &&
              selectedLocation.water_level !==
                undefined
                ? " m"
                : ""}

            </p>

            <p className="mt-1 text-[10px] text-white/70">
              Only verified water-level telemetry
              is displayed.
            </p>

          </div>

          {/* Coordinates */}

          <div
            className="
              mt-4
              rounded-xl
              bg-slate-50
              p-3
              text-[10px]
              text-white/70
            "
          >

            <div className="flex justify-between">
              <span>
                Latitude
              </span>

              <span className="text-slate-700">
                {selectedLocation.latitude.toFixed(
                  4
                )}
              </span>
            </div>

            <div className="mt-1 flex justify-between">
              <span>
                Longitude
              </span>

              <span className="text-slate-700">
                {selectedLocation.longitude.toFixed(
                  4
                )}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

