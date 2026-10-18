import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import TrackingMap from '../components/tracking/TrackingMap';
import { useScrollEffects, useScrollReveal } from '../hooks/useScrollEffects';
import {
  Search,
  Route,
  KeyRound,
  MailCheck,
  Building2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Plane,
  Clock,
  ChevronRight,
  ChevronDown,
  Layers,
  Activity,
  Send,
  RotateCcw,
  MapPin,
  Compass,
  AlertCircle
} from 'lucide-react';

// ====================================================
// PRAKASAM DISTRICT INFRASTRUCTURE DATA & A* ROUTING GRAPH
// ====================================================
export const PRAKASAM_BLOOD_BANKS = [
  {
    id: 1,
    name: 'Indian Red Cross Society Blood Centre',
    location: 'Lawyerpet, Ongole',
    town: 'Ongole',
    code: 'VERT-BB-RC',
    lat: 15.5030,
    lng: 80.0450,
    license: 'AP-PRAKASAM-BB-041',
    status: 'ACTIVE_24X7'
  },
  {
    id: 2,
    name: 'RIMS Model Blood Bank',
    location: 'Collectorate Rd, RIMS Campus, Ongole',
    town: 'Ongole',
    code: 'VERT-BB-RIMS',
    lat: 15.5060,
    lng: 80.0510,
    license: 'AP-PRAKASAM-BB-019',
    status: 'ACTIVE_24X7'
  },
  {
    id: 3,
    name: 'Rotary Club Central Blood Bank',
    location: 'Gandhi Road, Chirala',
    town: 'Chirala',
    code: 'VERT-BB-CHIRALA',
    lat: 15.8200,
    lng: 80.3500,
    license: 'AP-PRAKASAM-BB-088',
    status: 'ACTIVE_24X7'
  },
  {
    id: 4,
    name: 'Markapur Regional Blood Storage & Centre',
    location: 'NGO Colony, Markapur',
    town: 'Markapur',
    code: 'VERT-BB-MARKAPUR',
    lat: 15.7330,
    lng: 79.2680,
    license: 'AP-PRAKASAM-BB-102',
    status: 'ACTIVE_24X7'
  }
];

export const PRAKASAM_HOSPITALS = [
  {
    id: 1,
    name: 'RIMS Government General Hospital',
    location: 'Collectorate Road, Ongole',
    town: 'Ongole',
    code: 'VERT-HOSP-RIMS',
    lat: 15.5057,
    lng: 80.0499,
    emergencyDept: 'Apex Trauma & Emergency Unit',
    vertipadStatus: 'OPERATIONAL'
  },
  {
    id: 2,
    name: 'KIMS Hospital & Research Centre',
    location: 'NH-16 Bypass Road, Ongole',
    town: 'Ongole',
    code: 'VERT-HOSP-KIMS',
    lat: 15.5186,
    lng: 80.0355,
    emergencyDept: 'ICU & Emergency Wing',
    vertipadStatus: 'OPERATIONAL'
  },
  {
    id: 3,
    name: 'Area Hospital Chirala',
    location: 'Near Clock Tower, Chirala',
    town: 'Chirala',
    code: 'VERT-HOSP-CHIRALA',
    lat: 15.8246,
    lng: 80.3522,
    emergencyDept: 'Casualty & Trauma Care',
    vertipadStatus: 'OPERATIONAL'
  },
  {
    id: 4,
    name: 'Area Hospital Markapur',
    location: 'Station Road, Markapur',
    town: 'Markapur',
    code: 'VERT-HOSP-MARKAPUR',
    lat: 15.7350,
    lng: 79.2700,
    emergencyDept: 'Emergency Resuscitation Unit',
    vertipadStatus: 'OPERATIONAL'
  },
  {
    id: 5,
    name: 'Area Hospital Kandukur',
    location: 'Pamur Road, Kandukur',
    town: 'Kandukur',
    code: 'VERT-HOSP-KANDUKUR',
    lat: 15.2167,
    lng: 79.9042,
    emergencyDept: 'Emergency & Maternity Ward',
    vertipadStatus: 'OPERATIONAL'
  }
];

// Route Nodes in Prakasam Flight Corridors
const ROUTE_NODES_MAP = {
  'VERT-BB-RC': { code: 'VERT-BB-RC', name: 'Red Cross Ongole Vertiport', lat: 15.5030, lng: 80.0450 },
  'VERT-HOSP-RIMS': { code: 'VERT-HOSP-RIMS', name: 'RIMS Hospital Helipad/Vertipad', lat: 15.5057, lng: 80.0499 },
  'VERT-HOSP-KIMS': { code: 'VERT-HOSP-KIMS', name: 'KIMS Hospital Vertiport', lat: 15.5186, lng: 80.0355 },
  'VERT-BB-RIMS': { code: 'VERT-BB-RIMS', name: 'RIMS Blood Bank Pad', lat: 15.5060, lng: 80.0510 },
  'WP-MED-CORR-1': { code: 'WP-MED-CORR-1', name: 'Central Medical Skyway Node Alpha', lat: 15.5100, lng: 80.0420 },
  'WP-ONG-NORTH': { code: 'WP-ONG-NORTH', name: 'Ongole North Aerial Waypoint', lat: 15.5350, lng: 80.0600 },
  'WP-CHIRALA-ENTRY': { code: 'WP-CHIRALA-ENTRY', name: 'Chirala Approach Waypoint', lat: 15.8050, lng: 80.3300 },
  'VERT-HOSP-CHIRALA': { code: 'VERT-HOSP-CHIRALA', name: 'Area Hospital Chirala Drone Deck', lat: 15.8246, lng: 80.3522 },
  'VERT-BB-CHIRALA': { code: 'VERT-BB-CHIRALA', name: 'Chirala Rotary Blood Bank Pad', lat: 15.8200, lng: 80.3500 },
  'WP-MARKAPUR-ENTRY': { code: 'WP-MARKAPUR-ENTRY', name: 'Markapur Eastern Skyway', lat: 15.7200, lng: 79.3100 },
  'VERT-HOSP-MARKAPUR': { code: 'VERT-HOSP-MARKAPUR', name: 'Area Hospital Markapur Vertiport', lat: 15.7350, lng: 79.2700 },
  'VERT-BB-MARKAPUR': { code: 'VERT-BB-MARKAPUR', name: 'Markapur Regional Blood Bank Pad', lat: 15.7330, lng: 79.2680 },
  'VERT-HOSP-KANDUKUR': { code: 'VERT-HOSP-KANDUKUR', name: 'Area Hospital Kandukur Vertipad', lat: 15.2167, lng: 79.9042 }
};

// Route Edges / Airspace Corridors with distances in km
const ROUTE_EDGES_LIST = [
  { from: 'VERT-BB-RC', to: 'WP-MED-CORR-1', distance: 0.85, corridor: 'Ongole Inner Medical Link 1' },
  { from: 'WP-MED-CORR-1', to: 'VERT-BB-RC', distance: 0.85, corridor: 'Ongole Inner Medical Link 1' },
  { from: 'WP-MED-CORR-1', to: 'VERT-HOSP-RIMS', distance: 1.05, corridor: 'RIMS Emergency Aerial Inbound' },
  { from: 'VERT-HOSP-RIMS', to: 'WP-MED-CORR-1', distance: 1.05, corridor: 'RIMS Emergency Aerial Outbound' },
  { from: 'VERT-BB-RC', to: 'VERT-HOSP-RIMS', distance: 1.25, corridor: 'Ongole Medical Trunk Link' },
  { from: 'VERT-HOSP-RIMS', to: 'VERT-BB-RC', distance: 1.25, corridor: 'Ongole Medical Trunk Link' },
  { from: 'WP-MED-CORR-1', to: 'VERT-HOSP-KIMS', distance: 1.95, corridor: 'KIMS Inbound Medical Corridor' },
  { from: 'VERT-HOSP-KIMS', to: 'WP-MED-CORR-1', distance: 1.95, corridor: 'KIMS Outbound Medical Corridor' },
  { from: 'VERT-BB-RC', to: 'VERT-HOSP-KIMS', distance: 2.30, corridor: 'Red Cross to KIMS Direct Corridor' },
  { from: 'VERT-HOSP-KIMS', to: 'VERT-BB-RC', distance: 2.30, corridor: 'Red Cross to KIMS Direct Corridor' },
  { from: 'VERT-BB-RIMS', to: 'VERT-HOSP-RIMS', distance: 0.20, corridor: 'RIMS Campus Internal Drone Shuttle' },
  { from: 'VERT-HOSP-RIMS', to: 'VERT-BB-RIMS', distance: 0.20, corridor: 'RIMS Campus Internal Drone Shuttle' },
  { from: 'VERT-BB-RIMS', to: 'WP-MED-CORR-1', distance: 1.10, corridor: 'RIMS Blood Bank Skyway Link' },
  { from: 'WP-MED-CORR-1', to: 'VERT-BB-RIMS', distance: 1.10, corridor: 'RIMS Blood Bank Skyway Link' },
  { from: 'VERT-HOSP-RIMS', to: 'WP-ONG-NORTH', distance: 3.45, corridor: 'Ongole Coastal-East Outbound Corridor' },
  { from: 'WP-ONG-NORTH', to: 'VERT-HOSP-RIMS', distance: 3.45, corridor: 'Ongole Coastal-East Inbound Corridor' },
  { from: 'WP-ONG-NORTH', to: 'WP-CHIRALA-ENTRY', distance: 42.10, corridor: 'Ongole-Chirala Coastal Medical Skyway' },
  { from: 'WP-CHIRALA-ENTRY', to: 'WP-ONG-NORTH', distance: 42.10, corridor: 'Ongole-Chirala Coastal Medical Skyway' },
  { from: 'WP-CHIRALA-ENTRY', to: 'VERT-HOSP-CHIRALA', distance: 3.10, corridor: 'Chirala Vertiport Final Approach' },
  { from: 'VERT-HOSP-CHIRALA', to: 'WP-CHIRALA-ENTRY', distance: 3.10, corridor: 'Chirala Vertiport Final Approach' },
  { from: 'VERT-BB-CHIRALA', to: 'VERT-HOSP-CHIRALA', distance: 0.70, corridor: 'Chirala Blood Bank to Area Hospital Direct' },
  { from: 'VERT-HOSP-CHIRALA', to: 'VERT-BB-CHIRALA', distance: 0.70, corridor: 'Chirala Area Hospital to Blood Bank Direct' },
  { from: 'WP-CHIRALA-ENTRY', to: 'VERT-BB-CHIRALA', distance: 2.80, corridor: 'Chirala Rotary Blood Bank Approach' },
  { from: 'VERT-BB-CHIRALA', to: 'WP-CHIRALA-ENTRY', distance: 2.80, corridor: 'Chirala Rotary Blood Bank Approach' },
  { from: 'WP-MED-CORR-1', to: 'WP-MARKAPUR-ENTRY', distance: 88.50, corridor: 'Nallamala Medical Aerial Trunk Line' },
  { from: 'WP-MARKAPUR-ENTRY', to: 'WP-MED-CORR-1', distance: 88.50, corridor: 'Nallamala Medical Aerial Trunk Line' },
  { from: 'WP-MARKAPUR-ENTRY', to: 'VERT-HOSP-MARKAPUR', distance: 4.50, corridor: 'Markapur Area Hospital Final Approach' },
  { from: 'VERT-HOSP-MARKAPUR', to: 'WP-MARKAPUR-ENTRY', distance: 4.50, corridor: 'Markapur Area Hospital Final Approach' },
  { from: 'VERT-BB-MARKAPUR', to: 'VERT-HOSP-MARKAPUR', distance: 0.40, corridor: 'Markapur Regional Drone Shuttle' },
  { from: 'VERT-HOSP-MARKAPUR', to: 'VERT-BB-MARKAPUR', distance: 0.40, corridor: 'Markapur Regional Drone Shuttle' },
  { from: 'WP-MARKAPUR-ENTRY', to: 'VERT-BB-MARKAPUR', distance: 4.20, corridor: 'Markapur Blood Bank Approach' },
  { from: 'VERT-BB-MARKAPUR', to: 'WP-MARKAPUR-ENTRY', distance: 4.20, corridor: 'Markapur Blood Bank Approach' },
  { from: 'VERT-BB-RC', to: 'VERT-HOSP-KANDUKUR', distance: 35.80, corridor: 'Ongole-Kandukur Highway Airway' },
  { from: 'VERT-HOSP-KANDUKUR', to: 'VERT-BB-RC', distance: 35.80, corridor: 'Ongole-Kandukur Highway Airway' },
  { from: 'WP-ONG-NORTH', to: 'VERT-HOSP-KIMS', distance: 3.20, corridor: 'KIMS North Connector Link' },
  { from: 'VERT-HOSP-KIMS', to: 'WP-ONG-NORTH', distance: 3.20, corridor: 'KIMS North Connector Link' }
];

// Haversine distance heuristic
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// A* Shortest Pathfinding Algorithm for Prakasam Drone Corridors
function findAStarShortestPath(startCode, endCode) {
  const nodes = ROUTE_NODES_MAP;
  const edges = ROUTE_EDGES_LIST;

  const startNode = nodes[startCode];
  const endNode = nodes[endCode];

  if (!startNode || !endNode) {
    return null;
  }

  if (startCode === endCode) {
    return {
      distanceKm: 0.20,
      flightMinutes: 1.5,
      flightMinutesFormatted: '1 min 30 secs',
      corridorName: 'On-Site Vertipad Transfer Corridor',
      waypoints: [startNode, endNode]
    };
  }

  const openSet = new Set([startCode]);
  const cameFrom = new Map();
  const corridorUsed = new Map();

  const gScore = {};
  const fScore = {};

  Object.keys(nodes).forEach((k) => {
    gScore[k] = Infinity;
    fScore[k] = Infinity;
  });

  gScore[startCode] = 0;
  fScore[startCode] = haversineDistance(startNode.lat, startNode.lng, endNode.lat, endNode.lng);

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;
    for (const code of openSet) {
      if (fScore[code] < lowestF) {
        lowestF = fScore[code];
        current = code;
      }
    }

    if (current === endCode) {
      const pathCodes = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        pathCodes.unshift(current);
      }
      const waypoints = pathCodes.map((c) => nodes[c]);
      const totalDist = parseFloat(gScore[endCode].toFixed(2));
      // Standard cruising speed: 65 km/h + 2 min vertical ascent/descent buffer
      const rawMinutes = (totalDist / 65) * 60 + (totalDist < 1 ? 1 : 2);
      const flightMinutes = parseFloat(rawMinutes.toFixed(1));
      const totalSecs = Math.round(flightMinutes * 60);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      const flightMinutesFormatted = `${mins} min${mins !== 1 ? 's' : ''}${secs > 0 ? ` ${secs} sec${secs !== 1 ? 's' : ''}` : ''}`;
      const lastCorridor = corridorUsed.get(endCode) || 'Prakasam A* Emergency Skyway';

      return {
        distanceKm: totalDist,
        flightMinutes,
        flightMinutesFormatted,
        corridorName: lastCorridor,
        waypoints
      };
    }

    openSet.delete(current);

    const neighbors = edges.filter((e) => e.from === current);
    for (const edge of neighbors) {
      const neighbor = edge.to;
      const tentativeG = gScore[current] + edge.distance;
      if (tentativeG < gScore[neighbor]) {
        cameFrom.set(neighbor, current);
        corridorUsed.set(neighbor, edge.corridor);
        gScore[neighbor] = tentativeG;
        const h = haversineDistance(nodes[neighbor].lat, nodes[neighbor].lng, endNode.lat, endNode.lng);
        fScore[neighbor] = tentativeG + h;
        openSet.add(neighbor);
      }
    }
  }

  // Fallback to direct corridor arc if discrete graph doesn't bridge distant cluster
  const directDist = parseFloat(haversineDistance(startNode.lat, startNode.lng, endNode.lat, endNode.lng).toFixed(2));
  const rawMinutes = (directDist / 65) * 60 + 2;
  const flightMinutes = parseFloat(rawMinutes.toFixed(1));
  const totalSecs = Math.round(flightMinutes * 60);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const flightMinutesFormatted = `${mins} min${mins !== 1 ? 's' : ''}${secs > 0 ? ` ${secs} sec${secs !== 1 ? 's' : ''}` : ''}`;
  const midLat = (startNode.lat + endNode.lat) / 2 + 0.005;
  const midLng = (startNode.lng + endNode.lng) / 2;

  return {
    distanceKm: directDist,
    flightMinutes,
    flightMinutesFormatted,
    corridorName: `${startNode.name.split(' ')[0]} - ${endNode.name.split(' ')[0]} Direct Skyway`,
    waypoints: [
      startNode,
      {
        code: 'WP-INTERMEDIATE-ARC',
        name: 'Inter-District Air Corridor Node',
        lat: midLat,
        lng: midLng
      },
      endNode
    ]
  };
}

export default function Home() {
  useScrollReveal();
  const { scrollY } = useScrollEffects();
  const [metrics, setMetrics] = useState({
    hospitalsCount: 5,
    bloodBanksCount: 4,
    requestsCount: 3,
    deliveriesCompleted: 1,
    availableUnits: 94
  });

  // State for interactive A* pathfinding in Operations Center
  const [nowTime, setNowTime] = useState(new Date());
  const [selectedBloodBankId, setSelectedBloodBankId] = useState(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState(1);

  // Live ticking clock (updates every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedBloodBank = useMemo(() => {
    return PRAKASAM_BLOOD_BANKS.find((b) => b.id === Number(selectedBloodBankId)) || PRAKASAM_BLOOD_BANKS[0];
  }, [selectedBloodBankId]);

  const selectedHospital = useMemo(() => {
    return PRAKASAM_HOSPITALS.find((h) => h.id === Number(selectedHospitalId)) || PRAKASAM_HOSPITALS[0];
  }, [selectedHospitalId]);

  // Compute shortest path via A* Algorithm
  const routePlan = useMemo(() => {
    return findAStarShortestPath(selectedBloodBank.code, selectedHospital.code);
  }, [selectedBloodBank.code, selectedHospital.code]);

  // Formatted dispatch departure and exact touchdown arrival timestamps
  const departureTimeStr = nowTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';

  const flightSecs = Math.round((routePlan?.flightMinutes || 3.2) * 60);
  const estimatedArrivalDate = new Date(nowTime.getTime() + flightSecs * 1000);
  const exactArrivalTimeStr = estimatedArrivalDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';

  const handleBloodBankChange = (e) => {
    setSelectedBloodBankId(Number(e.target.value));
  };

  const handleHospitalChange = (e) => {
    setSelectedHospitalId(Number(e.target.value));
  };

  // Dynamic delivery object passed to TrackingMap
  const activeDelivery = useMemo(() => {
    const waypoints = routePlan?.waypoints || [];
    let lat = selectedBloodBank.lat;
    let lng = selectedBloodBank.lng;

    if (waypoints.length >= 2) {
      // Place drone along corridor to show flight path in action
      const p1 = waypoints[0];
      const p2 = waypoints[1];
      lat = p1.lat + (p2.lat - p1.lat) * 0.48;
      lng = p1.lng + (p2.lng - p1.lng) * 0.48;
    } else if (waypoints.length > 0) {
      lat = waypoints[0].lat;
      lng = waypoints[0].lng;
    }

    return {
      id: `${selectedBloodBank.id}-${selectedHospital.id}`,
      drone_identifier: 'LD-HEXA-01 (Apex Lifter)',
      delivery_status: 'IN_TRANSIT',
      eta_minutes: Math.ceil(routePlan?.flightMinutes || 3.2),
      distance_km: routePlan?.distanceKm || 1.25,
      speed_kmh: 65,
      battery_pct: 97,
      origin_name: selectedBloodBank.name,
      destination_name: selectedHospital.name,
      current_lat: lat,
      current_lng: lng,
      waypoints: waypoints
    };
  }, [routePlan, selectedBloodBank, selectedHospital]);

  useEffect(() => {
    publicAPI.getMetrics()
      .then((res) => {
        if (res.data?.success && res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      })
      .catch((e) => console.log('Metrics load notice:', e.message));
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* ====================================================
          SECTION 1: HERO SECTION (16:9 ASPECT RATIO ON LAPTOP SCREEN WITH BG VIDEO)
          ==================================================== */}
      <section className="hero-16-9-section">
        {/* Responsive Background Video Container */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.95) saturate(1.08)'
            }}
          >
            <source src="/videos/hero-drone-bg.mp4" type="video/mp4" />
          </video>

          {/* Elegant Translucent Gradient Overlay for Maximum Legibility across Desktop and Mobile */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.82) 45%, rgba(238, 245, 250, 0.68) 100%)',
              backdropFilter: 'blur(2px)'
            }}
          />
        </div>

        <div className="container-custom" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: '680px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EEF5FA',
                border: '1px solid #B8D3E9',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#124676',
                marginBottom: '16px'
              }}
            >
              <Zap size={14} fill="#124676" />
              <span>AI POWERED EMERGENCY BLOOD DELIVERY SYSTEM USING DRONE</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 4.4vw, 56px)',
                fontWeight: '800',
                lineHeight: '1.1',
                color: '#152238',
                letterSpacing: '-1.5px',
                marginBottom: '18px'
              }}
            >
              FROM BLOOD BANK<br />
              TO BEDSIDE<br />
              <span style={{ color: '#D2252F' }}>IN A FLASH</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(15px, 1.2vw, 18px)',
                lineHeight: '1.6',
                color: '#475569',
                maxWidth: '560px',
                marginBottom: '28px'
              }}
            >
              LifeDrone connects hospitals and blood banks through intelligent delivery coordination,
              secure package handovers, and drone-assisted medical logistics.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <Link to="/how-it-works" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                <span>How It Works</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Scroll Down Responsive Indicator (fades on scroll down, returns on scroll up) */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: scrollY > 60 ? 'translate(-50%, 12px)' : 'translate(-50%, 0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            opacity: scrollY > 60 ? 0 : 0.85,
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#124676', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Scroll To Explore
          </span>
          <div className="animate-bounce">
            <ChevronDown size={16} color="#D2252F" />
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 2: PROBLEM AND SOLUTION PREVIEW
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container-custom">
          {/* Visual 2-Column Split: Simplified Problem/Solution + High-Res Medical Drone Image */}
          <div
            className="scroll-reveal"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
              marginBottom: '64px'
            }}
          >
            {/* Left: Simplified & Impactful Text */}
            <div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#D2252F',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'inline-block',
                  backgroundColor: '#FEF2F2',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  marginBottom: '12px'
                }}
              >
                The Critical Window
              </span>

              <h2
                style={{
                  fontSize: 'clamp(28px, 3.2vw, 42px)',
                  fontWeight: '800',
                  color: '#152238',
                  lineHeight: '1.2',
                  letterSpacing: '-0.8px',
                  marginBottom: '16px'
                }}
              >
                When Every Minute Matters
              </h2>

              <p style={{ fontSize: '17px', color: '#64748B', lineHeight: '1.6', marginBottom: '14px' }}>
                Road traffic and long distances cause dangerous delays when patients need emergency blood.
              </p>

              <p style={{ fontSize: '17px', color: '#152238', lineHeight: '1.6', fontWeight: '600', marginBottom: '24px' }}>
                LifeDrone flies blood directly from blood banks to hospitals in minutes—bypassing city traffic with smart, autonomous drones.
              </p>

              {/* Quick Highlight Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#124676'
                  }}
                >
                  <Zap size={14} color="#D2252F" />
                  <span>Minutes, Not Hours</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#124676'
                  }}
                >
                  <Activity size={14} color="#124676" />
                  <span>2°C–6°C Cold Chain Protected</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#124676'
                  }}
                >
                  <ShieldCheck size={14} color="#16A34A" />
                  <span>Secure PIN Handover</span>
                </div>
              </div>
            </div>

            {/* Right: Realistic Medical Drone Flight Image */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -10px rgba(18, 70, 118, 0.16)',
                  border: '1px solid #E2E8F0',
                  position: 'relative'
                }}
              >
                <img
                  src="/images/critical-window-drone.jpg"
                  alt="Autonomous medical delivery drone transporting emergency blood over city to hospital rooftop vertipad"
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16 / 10',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {/* Floating Image Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '14px',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <span className="pulse-indicator pulse-green" style={{ width: '7px', height: '7px' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#124676' }}>
                    Zero Road Traffic &bull; Direct Hospital Helipad Transit
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px'
            }}
          >
            {/* Card 1 */}
            <div className="card-sharp-hover scroll-reveal scroll-delay-1" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#EEF5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#124676',
                  marginBottom: '20px'
                }}
              >
                <Zap size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                1. Faster Coordination
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                Hospitals search live inventory across participating blood banks by component,
                group, and urgency, replacing chaotic phone calls with instant request pipelines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-sharp-hover scroll-reveal scroll-delay-2" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D2252F',
                  marginBottom: '20px'
                }}
              >
                <Route size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                2. Intelligent Route Planning
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                The backend A* pathfinding algorithm calculates optimal corridor waypoints between
                vertipads, minimizing flight duration while maintaining strict airspace adherence.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-sharp-hover scroll-reveal scroll-delay-3" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  marginBottom: '20px'
                }}
              >
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                3. Secure Delivery Handover
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                Cryptographic single-use passkeys delivered exclusively to authorized hospital receivers
                prevent misdelivery, tampering, and unverified package handoffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 3: HOW LIFEDRONE WORKS (7-STEP TIMELINE)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#F5F8FC' }}>
        <div className="container-custom">
          <div className="scroll-reveal" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              End-to-End Workflow
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-0.8px' }}>
              How LifeDrone Operates
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>
              From initial blood bank query to vertipad touchdown, every phase is validated,
              logged, and guarded by role-based authorizations.
            </p>
          </div>

          {/* 7-Step Horizontal / Responsive Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                step: '01',
                title: 'Hospital Searches for Blood',
                desc: 'Hospital staff search participating blood banks by blood group, component, quantity, and clinical urgency.',
                icon: Search
              },
              {
                step: '02',
                title: 'Hospital Places a Request',
                desc: 'Hospital enters patient reference details, required-by deadline, and selects an authorized designated receiver.',
                icon: Building2
              },
              {
                step: '03',
                title: 'Blood Bank Reviews the Request',
                desc: 'Blood bank verifies inventory availability, inspects compatibility requirements, and accepts or rejects the order.',
                icon: ShieldCheck
              },
              {
                step: '04',
                title: 'Package Preparation',
                desc: 'Authorized staff complete the medical packaging checklist, ensuring cold chain integrity (+2°C to +6°C) and tamper seals.',
                icon: Layers
              },
              {
                step: '05',
                title: 'Dispatch and Route Planning',
                desc: 'Staff authorize dispatch. The system calculates an A* path over configured airspace corridors and generates a secure passkey.',
                icon: Route
              },
              {
                step: '06',
                title: 'Live Delivery Status',
                desc: 'Designated hospital receiver receives email alerts with real-time tracking links and 5-minute flight telemetry pings.',
                icon: Plane
              },
              {
                step: '07',
                title: 'Secure Package Handover',
                desc: 'Hospital receiver enters single-use passkey at the vertipad to verify receipt and complete custody transfer.',
                icon: KeyRound
              }
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className={`card-sharp-hover scroll-reveal scroll-delay-${(index % 3) + 1}`}
                  style={{
                    padding: '24px 28px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    alignItems: 'center',
                    gap: '24px'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: '#EEF5FA',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#124676'
                    }}
                  >
                    <IconComp size={24} />
                    <span style={{ fontSize: '11px', fontWeight: '800', marginTop: '2px' }}>{item.step}</span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                      Step {index + 1}: {item.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="scroll-reveal"
            style={{
              marginTop: '36px',
              textAlign: 'center',
              backgroundColor: '#EFF6FF',
              border: '1px solid #B8D3E9',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '13px',
              color: '#0D375E'
            }}
          >
            <strong>Operational Transparency:</strong> LifeDrone currently runs in <em>Demonstration Simulation Mode</em> over the Prakasam District aerial corridor graph. Simulated drone positions are clearly distinguished from physical GPS avionics telemetry.
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 4: OUR SOLUTIONS (6 SOLUTION CARDS)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container-custom">
          <div className="scroll-reveal" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#D2252F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              System Capabilities
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-0.8px' }}>
              Our Core Solutions
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>
              Comprehensive emergency logistics toolset designed specifically for clinical blood bank and trauma center operations.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px'
            }}
          >
            {[
              {
                icon: Search,
                title: '1. Blood Availability Search',
                desc: 'Real-time query of blood bank inventory across Prakasam district by blood group, component, unit count, and cold expiry.'
              },
              {
                icon: Route,
                title: '2. Intelligent Route Planning',
                desc: 'Deterministic A* algorithm calculates optimal airspace corridors between vertipads using Haversine distance heuristics.'
              },
              {
                icon: KeyRound,
                title: '3. Secure Delivery Verification',
                desc: 'Single-use cryptographically salted passkey verification prevents unverified handovers and prevents token replay.'
              },
              {
                icon: MailCheck,
                title: '4. Email Notification System',
                desc: 'SMTP-powered notification service delivering dispatch alerts, 5-minute telemetry progress pings, and delivery receipts.'
              },
              {
                icon: Building2,
                title: '5. Hospital & Blood Bank Coordination',
                desc: 'Unified, authenticated portals separating hospital administrators, field receivers, blood bank authorizers, and inventory managers.'
              },
              {
                icon: Navigation,
                title: '6. Delivery Status Tracking',
                desc: 'Visual OpenStreetMap console displaying flight paths, distance remaining, drone coordinates, battery, and arrival ETA.'
              }
            ].map((sol, index) => {
              const Icon = sol.icon;
              return (
                <div 
                  key={sol.title} 
                  className={`card-sharp-hover scroll-reveal scroll-delay-${(index % 3) + 1}`} 
                  style={{ padding: '30px' }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#EEF5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#124676',
                      marginBottom: '18px'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#152238', marginBottom: '10px' }}>
                    {sol.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                    {sol.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 5: INTELLIGENT DELIVERY PLATFORM (OPERATIONS CENTER)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#F5F8FC' }}>
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '40px',
              alignItems: 'start'
            }}
          >
            <div className="scroll-reveal">
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Operations Center Preview
              </span>
              <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-0.8px' }}>
                Intelligence Behind Every Delivery
              </h2>
              <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', marginBottom: '24px' }}>
                LifeDrone combines inventory information, delivery workflows, route planning,
                and secure verification to coordinate medical deliveries.
              </p>

              {/* Prakasam District Infrastructure Metrics: Hospitals & Blood Banks */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #124676',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(18, 70, 118, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#EEF5FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#124676'
                      }}
                    >
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Hospitals in Prakasam
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#124676' }}>
                        5 Certified Hospitals
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.45' }}>
                    RIMS Ongole, KIMS Ongole, Chirala, Markapur & Kandukur equipped with certified receiving vertipads.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #D2252F',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(210, 37, 47, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        backgroundColor: '#FDF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D2252F'
                      }}
                    >
                      <Activity size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actively Working Blood Banks
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#D2252F' }}>
                        4 Active Blood Banks
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.45' }}>
                    Indian Red Cross, RIMS Model Bank, Chirala Rotary & Markapur Storage with 24/7 cold storage custody.
                  </p>
                </div>
              </div>

              {/* A* Flight Path & Dispatch Estimator Form */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 4px 20px rgba(18, 70, 118, 0.08)',
                  marginBottom: '26px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#EEF5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#124676'
                    }}
                  >
                    <Route size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#152238', margin: 0 }}>
                      A* Algorithm Shortest Path & Dispatch Estimator
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Select a Blood Bank and Hospital to find the shortest corridor and exact dispatch timeline.
                    </p>
                  </div>
                </div>

                {/* Dropdowns */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '14px',
                    marginBottom: '18px'
                  }}
                >
                  {/* Origin: Blood Bank */}
                  <div>
                    <label
                      htmlFor="select-blood-bank"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#124676',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '6px'
                      }}
                    >
                      <Activity size={13} color="#D2252F" />
                      <span>Select Blood Bank (Origin)</span>
                    </label>
                    <select
                      id="select-blood-bank"
                      value={selectedBloodBankId}
                      onChange={handleBloodBankChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#1E293B',
                        fontWeight: '600',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {PRAKASAM_BLOOD_BANKS.map((bb) => (
                        <option key={bb.id} value={bb.id}>
                          {bb.name} ({bb.town})
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Vertiport: <strong>{selectedBloodBank.code}</strong> &bull; {selectedBloodBank.location}
                    </div>
                  </div>

                  {/* Destination: Hospital */}
                  <div>
                    <label
                      htmlFor="select-hospital"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#124676',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '6px'
                      }}
                    >
                      <Building2 size={13} color="#124676" />
                      <span>Select Hospital (Destination)</span>
                    </label>
                    <select
                      id="select-hospital"
                      value={selectedHospitalId}
                      onChange={handleHospitalChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#1E293B',
                        fontWeight: '600',
                        backgroundColor: '#F8FAFC',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {PRAKASAM_HOSPITALS.map((hosp) => (
                        <option key={hosp.id} value={hosp.id}>
                          {hosp.name} ({hosp.town})
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Vertipad: <strong>{selectedHospital.code}</strong> &bull; {selectedHospital.location}
                    </div>
                  </div>
                </div>

                {/* Telemetry Metrics Grid */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#124676' }}>
                      <Zap size={14} color="#F59E0B" />
                      <span>Planned A* Corridor:</span>
                      <span style={{ color: '#0F172A', fontWeight: '800' }}>{routePlan?.corridorName}</span>
                    </div>
                    <div style={{ fontSize: '11px', backgroundColor: '#EEF5FA', color: '#124676', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      Cruising at 65 km/h
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                        Shortest Distance
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: '#124676', marginTop: '2px' }}>
                        {routePlan?.distanceKm} km
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>
                        Drone Speed
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: '#152238', marginTop: '2px' }}>
                        65 km/h
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #FCA5A5' }}>
                      <div style={{ fontSize: '10.5px', color: '#DC2626', fontWeight: '700', textTransform: 'uppercase' }}>
                        Exact Estimated Time
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: '#D2252F', marginTop: '2px' }}>
                        {routePlan?.flightMinutesFormatted}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch Telemetry & Exact Dispatched Time Note */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #BFDBFE'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={15} color="#1D4ED8" />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E40AF' }}>
                        Live Dispatch Schedule & ETA
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        backgroundColor: '#DBEAFE',
                        color: '#1D4ED8'
                      }}
                    >
                      A* OPTIMIZED CORRIDOR
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '10px',
                      marginBottom: '10px',
                      padding: '10px 12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                        Current Dispatch Window (Takeoff)
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#1E293B', marginTop: '2px' }}>
                        {departureTimeStr}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                        Exact Estimated Touchdown (Arrival)
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#D2252F', marginTop: '2px' }}>
                        {exactArrivalTimeStr}
                      </div>
                    </div>
                  </div>

                  {/* Prominent Exact Estimated Time Note */}
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: '#1E3A8A',
                      lineHeight: '1.55',
                      backgroundColor: '#FFFFFF',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #2563EB',
                      border: '1px solid #DBEAFE'
                    }}
                  >
                    <strong>📌 Dispatch Note:</strong> When the medical drone is dispatched at{' '}
                    <strong>{departureTimeStr}</strong> from <strong>{selectedBloodBank.name}</strong>, the exact estimated arrival at{' '}
                    <strong>{selectedHospital.name}</strong> vertipad is{' '}
                    <strong>{exactArrivalTimeStr}</strong> via the shortest A* path (Distance:{' '}
                    <strong>{routePlan?.distanceKm} km</strong>, Flight duration:{' '}
                    <strong>{routePlan?.flightMinutesFormatted}</strong> @ 65 km/h).
                  </div>
                </div>
              </div>

              <Link to="/blood-access" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>Access Live Operations Portal</span>
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Interactive Operations Console Map */}
            <div className="scroll-reveal scroll-delay-2" style={{ position: 'sticky', top: '100px' }}>
              <TrackingMap delivery={activeDelivery} height="520px" zoom={13} />
            </div>
          </div>
        </div>
      </section>


      {/* ====================================================
          SECTION 7: FINAL CALL TO ACTION
          ==================================================== */}
      <section
        style={{
          padding: '90px 0',
          background: 'linear-gradient(135deg, #124676 0%, #0B2C4D 100%)',
          color: '#FFFFFF',
          textAlign: 'center'
        }}
      >
        <div className="container-custom scroll-reveal" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 46px)', fontWeight: '800', color: '#FFFFFF', marginBottom: '18px', letterSpacing: '-0.8px' }}>
            Help Build a Faster Medical Delivery Network
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6', opacity: '0.9', marginBottom: '36px' }}>
            Connect your hospital or blood bank with LifeDrone and explore
            a smarter way to coordinate critical blood deliveries.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <Link
              to="/hospital/login"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#124676',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Building2 size={18} />
              <span>Hospital Access</span>
            </Link>

            <Link
              to="/blood-bank/login"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(8px)',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={18} />
              <span>Blood Bank Access</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
