import { planRouteAStar, findVertiportNode } from '../services/routePlanningService.js';
import { query } from '../config/database.js';

export async function calculateRoute(req, res) {
  try {
    const { startNodeCode, endNodeCode, bloodBankId, hospitalId } = req.body;

    let start = startNodeCode;
    let end = endNodeCode;

    if (!start && bloodBankId) {
      start = await findVertiportNode('BLOOD_BANK', bloodBankId);
    }
    if (!end && hospitalId) {
      end = await findVertiportNode('HOSPITAL', hospitalId);
    }

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Origin vertiport and destination vertiport must be provided.'
      });
    }

    const plan = await planRouteAStar(start, end);
    return res.json({ success: true, plan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDeliveryRoute(req, res) {
  try {
    const { id } = req.params;
    const routes = await query(
      `SELECT r.*, d.delivery_reference, d.drone_identifier, d.delivery_status 
       FROM delivery_routes r
       JOIN deliveries d ON d.route_id = r.id
       WHERE d.id = ?`,
      [id]
    );

    if (routes.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found for delivery.' });
    }

    const route = routes[0];
    const waypoints = typeof route.waypoints_json === 'string'
      ? JSON.parse(route.waypoints_json)
      : route.waypoints_json;

    return res.json({
      success: true,
      route: {
        ...route,
        waypoints
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getNetworkGraph(req, res) {
  try {
    const nodes = await query('SELECT * FROM route_nodes');
    const edges = await query('SELECT * FROM route_edges WHERE is_active = TRUE');
    return res.json({ success: true, nodes, edges });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
