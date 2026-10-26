import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, ExternalLink, MapPin, Globe, Zap, Clock, Navigation, Activity } from 'lucide-react';

const TILE_PROVIDERS = {
  standard: {
    id: 'standard',
    name: 'OSM Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: ''
  },
  light: {
    id: 'light',
    name: 'OSM Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: ''
  },
  topo: {
    id: 'topo',
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: ''
  }
};

export default function TrackingMap({
  delivery,
  height = '480px',
  zoom = 13,
  interactive = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({ drone: null, routeLine: null, origin: null, dest: null });

  const [activeLayer, setActiveLayer] = useState('standard');
  const [osmAddress, setOsmAddress] = useState('Ongole, Prakasam District, AP');
  const [isFetchingOsm, setIsFetchingOsm] = useState(false);

  // Waypoints from delivery
  const waypoints = delivery?.waypoints || [];
  const currentLat = delivery?.current_lat || 15.5057;
  const currentLng = delivery?.current_lng || 80.0499;

  // OpenStreetMap Reverse Geocoding API integration
  useEffect(() => {
    let isMounted = true;
    const fetchOsmAddress = async () => {
      setIsFetchingOsm(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=14&addressdetails=1`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            const parts = [
              data.address?.suburb || data.address?.neighbourhood,
              data.address?.city || data.address?.town || data.address?.county,
              data.address?.state_district,
              data.address?.state
            ].filter(Boolean);
            const formatted = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(',') || 'Prakasam Corridor');
            setOsmAddress(formatted);
          }
        }
      } catch (err) {
        // Fallback gracefully if rate-limited or offline
      } finally {
        if (isMounted) setIsFetchingOsm(false);
      }
    };

    if (currentLat && currentLng) {
      fetchOsmAddress();
    }

    return () => { isMounted = false; };
  }, [currentLat, currentLng]);

  // Handle Layer switching (OSM Standard vs Light vs Topo)
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const provider = TILE_PROVIDERS[activeLayer] || TILE_PROVIDERS.standard;
      const newLayer = L.tileLayer(provider.url, {
        maxZoom: 19,
        attribution: provider.attribution,
        subdomains: 'abcd'
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  }, [activeLayer]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map with OpenStreetMap
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        attributionControl: false
      });

      // Default OpenStreetMap Standard Layer
      const defaultProvider = TILE_PROVIDERS[activeLayer] || TILE_PROVIDERS.standard;
      const initialLayer = L.tileLayer(defaultProvider.url, {
        attribution: defaultProvider.attribution,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = initialLayer;
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

      routeLine.bindPopup(`
        <div style="font-size: 12px; font-family: inherit; min-width: 200px;">
          <div style="font-weight: 800; color: #124676; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            <span>⚡ A* Shortest Flight Path Corridor</span>
          </div>
          <div><strong>Corridor:</strong> ${delivery?.route_name || 'Red Cross Ongole ➔ RIMS Ongole A* Corridor'}</div>
          <div><strong>Total A* Distance:</strong> ${delivery?.total_distance_km || delivery?.distance_km || 1.25} km</div>
          <div><strong>Drone Cruising Speed:</strong> ${delivery?.speed_kmh || 65} km/h</div>
          <div><strong>Heuristic:</strong> Admissible Haversine (h(n) &le; d*(n))</div>
        </div>
      `);

      markersRef.current.routeLine = routeLine;

      // Origin Marker
      const originNode = waypoints[0];
      markersRef.current.origin = L.marker([originNode.lat, originNode.lng], { icon: bloodBankIcon })
        .addTo(map)
        .bindPopup(`<strong>Origin Vertiport (Blood Bank):</strong><br/>${originNode.name || 'Blood Bank Vertiport'}`);

      // Destination Marker
      const destNode = waypoints[waypoints.length - 1];
      markersRef.current.dest = L.marker([destNode.lat, destNode.lng], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`<strong>Destination Vertipad (Hospital):</strong><br/>${destNode.name || 'Hospital Vertipad'}`);

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
      <div style="font-family: inherit; font-size: 13px; min-width: 200px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <strong style="color: #D2252F; font-size: 14px;">${delivery?.drone_identifier || 'LD-HEXA-01'}</strong>
          <span style="font-size: 10px; background: #EEF5FA; color: #124676; padding: 2px 6px; border-radius: 4px; font-weight: 700;">OSM LIVE</span>
        </div>
        <div><strong>Status:</strong> ${delivery?.delivery_status || 'IN_TRANSIT'}</div>
        <div><strong>ETA:</strong> ${delivery?.eta_minutes ?? 0} mins remaining</div>
        <div><strong>Distance:</strong> ${delivery?.distance_km ?? 0} km</div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #E2E8F0; font-size: 11px; color: #475569;">
          <strong>OSM Coords:</strong> ${currentLat.toFixed(4)}&deg;N, ${currentLng.toFixed(4)}&deg;E
        </div>
        <div style="font-size: 11px; color: #124676; font-weight: 600; margin-top: 2px;">
          ${osmAddress}
        </div>
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
  }, [
    delivery?.id, 
    delivery?.current_lat, 
    delivery?.current_lng, 
    delivery?.distance_km, 
    delivery?.eta_minutes, 
    delivery?.origin_name, 
    delivery?.destination_name, 
    JSON.stringify(waypoints), 
    osmAddress
  ]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-md)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Left: A* Shortest Flight Path Corridor Badge */}
      <div
        className="tracking-map-a-star-badge"
        style={{
          position: 'absolute',
          top: '12px',
          left: '52px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11.5px',
          fontWeight: '700',
          color: '#124676',
          border: '1.5px solid #B8D3E9',
          boxShadow: '0 2px 8px rgba(18, 70, 118, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        title="Path calculated using the A* Search Algorithm across Prakasam District airspace graph"
      >
        <Zap size={14} color="#F59E0B" />
        <span>A* Algorithm Shortest Flight Path</span>
        <span
          style={{
            fontSize: '10px',
            color: '#047857',
            backgroundColor: '#ECFDF5',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #A7F3D0',
            fontWeight: '800'
          }}
        >
          A* OPTIMIZED
        </span>
      </div>

      {/* Top Right: OpenStreetMap External OSM Link */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px'
        }}
      >

        {/* OpenStreetMap Direct Coordinates View Link */}
        <a
          href={`https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}#map=15/${currentLat}/${currentLng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#124676',
            border: '1px solid #B8D3E9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            textDecoration: 'none'
          }}
          title="Open exact drone coordinates on openstreetmap.org"
        >
          <Globe size={13} color="#124676" />
          <span>Open in OpenStreetMap</span>
          <ExternalLink size={11} color="#64748B" />
        </a>
      </div>

      {/* Bottom Left: OpenStreetMap Reverse Geocoded Location Pill */}
      <div
        className="tracking-map-osm-badge"
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#1E293B',
          border: '1px solid #CBD5E1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          maxWidth: '360px'
        }}
        title={`OpenStreetMap Location: ${osmAddress}`}
      >
        <MapPin size={13} color="#D2252F" style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <strong>OSM:</strong> {isFetchingOsm ? 'Geocoding...' : osmAddress}
        </span>
      </div>

      {/* Bottom Right: Live Flight Metrics HUD Overlay */}
      <div
        className="tracking-map-hud-badge"
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          minWidth: '200px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} color="#2563EB" />
            Live Flight Telemetry
          </span>
          <span style={{
            fontSize: '9.5px',
            fontWeight: '800',
            color: delivery?.delivery_status === 'ARRIVED' ? '#16A34A' : '#1D4ED8',
            backgroundColor: delivery?.delivery_status === 'ARRIVED' ? '#DCFCE7' : '#EFF6FF',
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${delivery?.delivery_status === 'ARRIVED' ? '#86EFAC' : '#BFDBFE'}`
          }}>
            {delivery?.delivery_status || 'IN_TRANSIT'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} color="#124676" />
            Estimated Arrival:
          </span>
          <strong style={{ color: '#124676', fontSize: '13px', fontWeight: '800' }}>
            {delivery?.eta_minutes ?? 0} mins
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Navigation size={12} color="#D2252F" />
            Remaining Distance:
          </span>
          <strong style={{ color: '#D2252F', fontSize: '13px', fontWeight: '800' }}>
            {delivery?.distance_km ?? 0} km
          </strong>
        </div>
      </div>

    </div>
  );
}
