import { query, withTransaction } from '../config/database.js';
import { haversineDistanceKm } from './routePlanningService.js';
import { sendArrivalAlertEmail } from './emailService.js';

/**
 * Advances or calculates the simulated drone's current position and telemetry
 * along its planned route waypoints.
 */
export async function updateDeliverySimulation(deliveryId) {
  const deliveries = await query(
    `SELECT d.*, 
            r.waypoints_json, r.total_distance_km, r.estimated_flight_minutes,
            h.name as hospital_name, h.latitude as hosp_lat, h.longitude as hosp_lng,
            u.email as receiver_email, u.full_name as receiver_name
     FROM deliveries d
     LEFT JOIN delivery_routes r ON d.route_id = r.id
     JOIN hospitals h ON d.destination_hospital_id = h.id
     JOIN blood_requests req ON d.blood_request_id = req.id
     JOIN users u ON req.designated_receiver_id = u.id
     WHERE d.id = ?`,
    [deliveryId]
  );

  if (deliveries.length === 0) return null;
  const delivery = deliveries[0];

  // If already delivered or cancelled, no simulation movement needed
  if (['DELIVERED', 'CANCELLED', 'FAILED'].includes(delivery.delivery_status)) {
    return delivery;
  }

  // Parse waypoints
  let waypoints = [];
  try {
    waypoints = typeof delivery.waypoints_json === 'string' 
      ? JSON.parse(delivery.waypoints_json) 
      : (delivery.waypoints_json || []);
  } catch (e) {
    waypoints = [];
  }

  if (waypoints.length < 2) {
    return delivery;
  }

  const dispatchTime = new Date(delivery.dispatch_time || delivery.created_at).getTime();
  const now = Date.now();
  const elapsedMinutes = (now - dispatchTime) / 60000;
  const totalMinutes = Math.max(3, delivery.estimated_flight_minutes || 5);

  // Calculate progression ratio (0 to 1.0)
  // For demonstration responsiveness: complete full journey within ~3 minutes of real time
  // or based on real-time elapsed ratio
  const progressRatio = Math.min(1.0, elapsedMinutes / (totalMinutes > 15 ? 5 : totalMinutes));

  // Determine current position by linear interpolation across waypoints
  const totalSegments = waypoints.length - 1;
  const segmentFloat = progressRatio * totalSegments;
  const currentSegmentIndex = Math.min(totalSegments - 1, Math.floor(segmentFloat));
  const segmentT = segmentFloat - currentSegmentIndex;

  const p1 = waypoints[currentSegmentIndex];
  const p2 = waypoints[currentSegmentIndex + 1];

  const currentLat = parseFloat((p1.lat + (p2.lat - p1.lat) * segmentT).toFixed(7));
  const currentLng = parseFloat((p1.lng + (p2.lng - p1.lng) * segmentT).toFixed(7));

  // Remaining distance to final destination
  const destWaypoint = waypoints[waypoints.length - 1];
  const distanceRemaining = parseFloat(
    haversineDistanceKm(currentLat, currentLng, destWaypoint.lat, destWaypoint.lng).toFixed(2)
  );

  const etaMinutesRemaining = Math.max(0, Math.ceil((1.0 - progressRatio) * totalMinutes));
  const batteryPct = Math.max(20, Math.round(98 - progressRatio * 25));
  const altitude = progressRatio < 0.1 || progressRatio > 0.95 ? 35 : 75;
  const speed = progressRatio >= 0.99 ? 0 : 65.0;

  let newStatus = delivery.delivery_status;
  let hasArrivedNow = false;

  if (progressRatio >= 1.0) {
    if (newStatus !== 'ARRIVED' && newStatus !== 'DELIVERED') {
      newStatus = 'ARRIVED';
      hasArrivedNow = true;
    }
  } else if (progressRatio > 0.05) {
    newStatus = 'IN_TRANSIT';
  }

  // Update delivery record
  await query(
    `UPDATE deliveries 
     SET current_lat = ?, current_lng = ?, current_step_index = ?, 
         eta_minutes = ?, distance_km = ?, delivery_status = ?,
         arrival_time = CASE WHEN ? = 'ARRIVED' AND arrival_time IS NULL THEN NOW() ELSE arrival_time END
     WHERE id = ?`,
    [currentLat, currentLng, currentSegmentIndex, etaMinutesRemaining, distanceRemaining, newStatus, newStatus, deliveryId]
  );

  // Update blood request status accordingly
  if (newStatus === 'IN_TRANSIT') {
    await query(`UPDATE blood_requests SET status = 'IN_TRANSIT' WHERE id = ? AND status != 'IN_TRANSIT'`, [delivery.blood_request_id]);
  } else if (newStatus === 'ARRIVED') {
    await query(`UPDATE blood_requests SET status = 'ARRIVED' WHERE id = ? AND status != 'ARRIVED' AND status != 'DELIVERED'`, [delivery.blood_request_id]);
  }

  // Record a periodic event if significant movement
  await query(
    `INSERT INTO delivery_events (delivery_id, event_type, latitude, longitude, altitude_meters, speed_kmh, battery_pct, status, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      deliveryId,
      newStatus === 'ARRIVED' ? 'ARRIVED_AT_VERTIPORT' : 'STATUS_UPDATE',
      currentLat,
      currentLng,
      altitude,
      speed,
      batteryPct,
      newStatus,
      `Simulated waypoint leg ${currentSegmentIndex + 1}/${totalSegments}. ETA: ${etaMinutesRemaining}m`
    ]
  );

  if (hasArrivedNow) {
    // Send arrival notification to receiver
    sendArrivalAlertEmail({
      receiverEmail: delivery.receiver_email,
      deliveryRef: delivery.delivery_reference,
      droneId: delivery.drone_identifier,
      hospitalName: delivery.hospital_name
    }).catch((e) => console.error('Arrival email error:', e.message));
  }

  return {
    ...delivery,
    current_lat: currentLat,
    current_lng: currentLng,
    current_step_index: currentSegmentIndex,
    eta_minutes: etaMinutesRemaining,
    distance_km: distanceRemaining,
    delivery_status: newStatus,
    battery_pct: batteryPct,
    altitude_meters: altitude,
    speed_kmh: speed,
    waypoints,
    simulation_label: 'SIMULATED DRONE TRACKING — DEMONSTRATION MODE'
  };
}
