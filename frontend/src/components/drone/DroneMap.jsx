import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDroneStore } from '../../store/useDroneStore';
import { BLOOD_BANK_DEPOT, HOSPITALS } from '../../data/hospitals';

export default function DroneMap({ selectedDrone }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const hospitalMarkersRef = useRef([]);

  // Create custom marker icons
  const createDroneIcon = (heading = 45, isCritical = false) => {
    return L.divIcon({
      className: 'drone-custom-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div class="radar-halo" style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(2, 132, 199, 0.25);"></div>
          <div style="position: relative; width: 34px; height: 34px; background: #0f172a; border: 2px solid #0284c7; border-radius: 9999px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.3s ease;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 17"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -16px; background: #0284c7; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
            ${selectedDrone?.code || 'DRONE'}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  const createDepotIcon = () => {
    return L.divIcon({
      className: 'depot-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; background: #9333ea; border: 2px solid #ffffff; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const createHospitalIcon = (name, isDestination = false) => {
    const bg = isDestination ? '#ef4444' : '#0284c7';
    return L.divIcon({
      className: 'hospital-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; background: ${bg}; border: 2px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12m-6-6h12"/>
          </svg>
          <div style="position: absolute; top: -18px; background: #0f172a; color: white; font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 4px; white-space: nowrap;">
            ${name}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = selectedDrone
      ? [selectedDrone.lat, selectedDrone.lng]
      : [BLOOD_BANK_DEPOT.lat, BLOOD_BANK_DEPOT.lng];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap CartoDB Positron / Standard Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Add Central Depot Marker
    const depotMarker = L.marker([BLOOD_BANK_DEPOT.lat, BLOOD_BANK_DEPOT.lng], {
      icon: createDepotIcon(),
    }).addTo(map);
    depotMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px;">
        <strong style="color: #9333ea;">${BLOOD_BANK_DEPOT.name}</strong>
        <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">${BLOOD_BANK_DEPOT.helipad}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #0284c7;">Launch Facility Alpha</p>
      </div>
    `);

    // Add Hospital Markers
    HOSPITALS.forEach((hosp) => {
      const isTarget = selectedDrone?.destination?.id === hosp.id;
      const marker = L.marker([hosp.lat, hosp.lng], {
        icon: createHospitalIcon(hosp.shortName, isTarget),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #0f172a;">${hosp.name}</strong>
          <p style="margin: 4px 0 0; font-size: 11px; color: #64748b;">${hosp.helipad}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #ef4444; font-weight: 600;">${hosp.traumaLevel}</p>
        </div>
      `);
      hospitalMarkersRef.current.push(marker);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Drone Marker & Route Polyline on Telemetry Ticks
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedDrone) return;

    const map = mapInstanceRef.current;
    const currentLatLng = [selectedDrone.lat, selectedDrone.lng];

    // Update or create Drone Marker
    if (!droneMarkerRef.current) {
      droneMarkerRef.current = L.marker(currentLatLng, {
        icon: createDroneIcon(selectedDrone.heading),
        zIndexOffset: 1000,
      }).addTo(map);

      droneMarkerRef.current.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #0284c7;">Drone ${selectedDrone.code}</strong>
          <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">Model: ${selectedDrone.model}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #16a34a; font-weight: 600;">Status: ${selectedDrone.status}</p>
        </div>
      `);
    } else {
      droneMarkerRef.current.setLatLng(currentLatLng);
      droneMarkerRef.current.setIcon(createDroneIcon(selectedDrone.heading));
    }

    // Update Flight Polyline
    if (selectedDrone.destination) {
      const routePoints = [
        [selectedDrone.origin.lat, selectedDrone.origin.lng],
        [selectedDrone.lat, selectedDrone.lng],
        [selectedDrone.destination.lat, selectedDrone.destination.lng],
      ];

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(routePoints, {
          color: '#0284c7',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(routePoints);
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  }, [selectedDrone?.lat, selectedDrone?.lng, selectedDrone?.heading, selectedDrone?.destination]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm dark:border-slate-800">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-2.5 shadow-md backdrop-blur-md border border-slate-200/80 text-xs dark:bg-navy-900/90 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="h-3 w-3 rounded-full bg-purple-600 ring-2 ring-purple-200" />
          <span>Central Depot</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-200" />
          <span>Active Drone</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-200" />
          <span>Hospital Destination</span>
        </div>
      </div>
    </div>
  );
}
