import { query } from '../config/database.js';

/**
 * Calculates Great-Circle Distance (Haversine formula) in kilometers
 * Admissible heuristic for 2D spatial pathfinding.
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
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

/**
 * Loads route graph nodes and edges from database
 */
async function loadGraphData() {
  const nodes = await query('SELECT * FROM route_nodes');
  const edges = await query('SELECT * FROM route_edges WHERE is_active = TRUE');

  const nodeMap = new Map();
  for (const n of nodes) {
    nodeMap.set(n.node_code, {
      id: n.id,
      code: n.node_code,
      name: n.name,
      lat: parseFloat(n.latitude),
      lng: parseFloat(n.longitude),
      altitude: n.altitude_meters,
      nodeType: n.node_type,
      entityId: n.entity_id
    });
  }

  const adjacency = new Map();
  for (const [code] of nodeMap) {
    adjacency.set(code, []);
  }

  for (const e of edges) {
    if (adjacency.has(e.from_node_code) && nodeMap.has(e.to_node_code)) {
      adjacency.get(e.from_node_code).push({
        to: e.to_node_code,
        distance: parseFloat(e.distance_km),
        corridorName: e.airspace_corridor_name
      });
    }
  }

  return { nodeMap, adjacency };
}

/**
 * A* Pathfinding Algorithm
 * Finds shortest route path from startNodeCode to endNodeCode
 */
export async function planRouteAStar(startNodeCode, endNodeCode) {
  const { nodeMap, adjacency } = await loadGraphData();

  if (!nodeMap.has(startNodeCode)) {
    throw new Error(`Start vertiport node "${startNodeCode}" not found in route graph.`);
  }
  if (!nodeMap.has(endNodeCode)) {
    throw new Error(`Destination vertiport node "${endNodeCode}" not found in route graph.`);
  }

  const targetNode = nodeMap.get(endNodeCode);

  // Priority queue / open set implementation
  const openSet = new Set([startNodeCode]);
  const cameFrom = new Map();

  const gScore = new Map();
  const fScore = new Map();

  for (const [code] of nodeMap) {
    gScore.set(code, Infinity);
    fScore.set(code, Infinity);
  }

  gScore.set(startNodeCode, 0);
  const initialH = haversineDistanceKm(
    nodeMap.get(startNodeCode).lat,
    nodeMap.get(startNodeCode).lng,
    targetNode.lat,
    targetNode.lng
  );
  fScore.set(startNodeCode, initialH);

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let current = null;
    let lowestF = Infinity;
    for (const code of openSet) {
      const f = fScore.get(code);
      if (f < lowestF) {
        lowestF = f;
        current = code;
      }
    }

    if (current === endNodeCode) {
      // Reconstruct path
      const pathCodes = [current];
      while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        pathCodes.unshift(current);
      }

      const waypoints = pathCodes.map((code) => nodeMap.get(code));
      const totalDistanceKm = parseFloat(gScore.get(endNodeCode).toFixed(2));
      // Average drone cruising speed: 65 km/h + 2 min vertical take-off and landing overhead
      const flightDurationMinutes = Math.max(3, Math.ceil((totalDistanceKm / 65) * 60) + 2);

      return {
        success: true,
        startNodeCode,
        endNodeCode,
        waypoints,
        totalDistanceKm,
        flightDurationMinutes,
        algorithm: 'A* with Haversine Admissible Heuristic',
        corridorsChecked: openSet.size + cameFrom.size,
        disclaimer: 'SIMULATED DRONE ROUTING — Demonstration Corridor Graph'
      };
    }

    openSet.delete(current);
    const currentNode = nodeMap.get(current);
    const neighbors = adjacency.get(current) || [];

    for (const neighbor of neighbors) {
      const neighborNode = nodeMap.get(neighbor.to);
      const tentativeG = gScore.get(current) + neighbor.distance;

      if (tentativeG < gScore.get(neighbor.to)) {
        cameFrom.set(neighbor.to, current);
        gScore.set(neighbor.to, tentativeG);
        const h = haversineDistanceKm(
          neighborNode.lat,
          neighborNode.lng,
          targetNode.lat,
          targetNode.lng
        );
        fScore.set(neighbor.to, tentativeG + h);
        openSet.add(neighbor.to);
      }
    }
  }

  // If unreachable in discrete graph, provide direct aerial corridor fallback calculation
  const startNode = nodeMap.get(startNodeCode);
  const directDistance = parseFloat(
    haversineDistanceKm(startNode.lat, startNode.lng, targetNode.lat, targetNode.lng).toFixed(2)
  );
  const directFlightMinutes = Math.max(3, Math.ceil((directDistance / 65) * 60) + 2);

  // Generate intermediate interpolated corridor waypoint for smooth visualization
  const midLat = (startNode.lat + targetNode.lat) / 2 + 0.005; // slight airspace arc
  const midLng = (startNode.lng + targetNode.lng) / 2;

  return {
    success: true,
    isDirectCorridor: true,
    startNodeCode,
    endNodeCode,
    waypoints: [
      startNode,
      {
        code: 'WP-INTERMEDIATE-CRUISE',
        name: 'Inter-Hospital Corridor Arc',
        lat: midLat,
        lng: midLng,
        altitude: 80,
        nodeType: 'CORRIDOR_WAYPOINT'
      },
      targetNode
    ],
    totalDistanceKm: directDistance,
    flightDurationMinutes: directFlightMinutes,
    algorithm: 'Direct Haversine Emergency Corridor (Graph Pathfinding Fallback)',
    disclaimer: 'SIMULATED DRONE ROUTING — Demonstration Corridor Graph'
  };
}

/**
 * Helper to find vertiport node code by hospital or blood bank ID
 */
export async function findVertiportNode(entityType, entityId) {
  const nodeType = entityType === 'HOSPITAL' ? 'HOSPITAL_VERTIPORT' : 'BLOOD_BANK_VERTIPORT';
  const rows = await query(
    'SELECT node_code FROM route_nodes WHERE node_type = ? AND entity_id = ? LIMIT 1',
    [nodeType, entityId]
  );
  if (rows.length > 0) return rows[0].node_code;

  // Fallback to primary vertiports if specific not matched
  return entityType === 'HOSPITAL' ? 'VERT-HOSP-RIMS' : 'VERT-BB-RC';
}
