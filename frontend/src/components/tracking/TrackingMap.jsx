import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrackingMap({
  delivery,
  height = '480px',
  zoom = 13,
  interactive = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ drone: null, routeLine: null, origin: null, dest: null });

  // Waypoints from delivery
  const waypoints = delivery?.waypoints || [];
  const currentLat = delivery?.current_lat || 15.5057;
  const currentLng = delivery?.current_lng || 80.0499;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false
      });

      // CartoDB Positron / OSM Light Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers
    if (markersRef.current.routeLine) {
      map.removeLayer(markersRef.current.routeLine);
      markersRef.current.routeLine = null;
    }
    if (markersRef.current.drone) {
      map.removeLayer(markersRef.current.drone);
      markersRef.current.drone = null;
    }
    if (markersRef.current.origin) {
      map.removeLayer(markersRef.current.origin);
      markersRef.current.origin = null;
    }
    if (markersRef.current.dest) {
      map.removeLayer(markersRef.current.dest);
      markersRef.current.dest = null;
    }

    // Origin Icon (Blood Bank)
    const bloodBankIcon = L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="background: #124676; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(18, 70, 118, 0.4); border: 2px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="9"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Destination Icon (Hospital)
    const hospitalIcon = L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="background: #DC2626; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4); border: 2px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Animated Drone Icon
    const droneIcon = L.divIcon({
      className: 'custom-drone-icon',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(210, 37, 47, 0.25); animation: pulse-ring 1.8s infinite;"></div>
          <div style="background: #D2252F; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(210, 37, 47, 0.5); border: 2px solid white; z-index: 2;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/><circle cx="12" cy="12" r="3" fill="#ffffff"/></svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    // Add Waypoints & Route Polyline
    if (waypoints.length >= 2) {
      const latlngs = waypoints.map((w) => [w.lat, w.lng]);
      const routeLine = L.polyline(latlngs, {
        color: '#124676',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      markersRef.current.routeLine = routeLine;

      // Origin Marker
      const originNode = waypoints[0];
      markersRef.current.origin = L.marker([originNode.lat, originNode.lng], { icon: bloodBankIcon })
        .addTo(map)
        .bindPopup(`<strong>Origin:</strong> ${originNode.name || 'Blood Bank Vertiport'}`);

      // Destination Marker
      const destNode = waypoints[waypoints.length - 1];
      markersRef.current.dest = L.marker([destNode.lat, destNode.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`<strong>Destination:</strong> ${destNode.name || 'Hospital Vertipad'}`);

      // Fit bounds
      const bounds = L.latLngBounds(latlngs);
      bounds.extend([currentLat, currentLng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([currentLat, currentLng], zoom);
    }

    // Drone Marker
    const droneMarker = L.marker([currentLat, currentLng], { icon: droneIcon }).addTo(map);
    droneMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 13px;">
        <strong style="color: #D2252F;">${delivery?.drone_identifier || 'LD-HEXA-01'}</strong><br/>
        <strong>Status:</strong> ${delivery?.delivery_status || 'IN_TRANSIT'}<br/>
        <strong>ETA:</strong> ${delivery?.eta_minutes ?? 0} mins remaining<br/>
        <strong>Distance:</strong> ${delivery?.distance_km ?? 0} km<br/>
        <small style="color: #64748B;">Simulated Telemetry</small>
      </div>
    `);

    markersRef.current.drone = droneMarker;

    // Trigger leaflet resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map reference intact across minor props changes
    };
  }, [delivery?.id, delivery?.current_lat, delivery?.current_lng, waypoints.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Demonstration Banner Floating Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.04em',
          color: '#0D375E',
          border: '1px solid #B8D3E9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span className="pulse-indicator pulse-blue" />
        <span>SIMULATED DRONE TRACKING &bull; DEMO MODE</span>
      </div>

      {/* Telemetry quick strip */}
      {delivery && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#152238',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>ETA</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#124676' }}>{delivery.eta_minutes ?? 0} min</div>
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>Speed</div>
            <div style={{ fontWeight: '700', fontSize: '14px' }}>{delivery.speed_kmh || 65} km/h</div>
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>Battery</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#16A34A' }}>{delivery.battery_pct || 94}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
