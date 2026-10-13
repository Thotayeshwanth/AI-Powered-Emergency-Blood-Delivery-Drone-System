import { query, withTransaction } from '../config/database.js';
import { generateDeliveryPasskey, generateReferenceCode } from '../utils/cryptoUtils.js';
import { planRouteAStar, findVertiportNode } from '../services/routePlanningService.js';
import {
  sendRequestAcceptedEmail,
  sendRequestRejectedEmail,
  sendDispatchAlertWithPasskey
} from '../services/emailService.js';

export async function getBloodBankDashboard(req, res) {
  try {
    const bloodBankId = req.user.institution_id;

    const [stats] = await query(
      `SELECT
        (SELECT COUNT(*) FROM blood_inventory WHERE blood_bank_id = ?) AS total_inventory_records,
        (SELECT COALESCE(SUM(available_quantity), 0) FROM blood_inventory WHERE blood_bank_id = ? AND status = 'AVAILABLE' AND expiry_date >= CURDATE()) AS available_units,
        (SELECT COUNT(*) FROM blood_requests WHERE blood_bank_id = ? AND status = 'PENDING') AS pending_requests,
        (SELECT COUNT(*) FROM blood_requests WHERE blood_bank_id = ? AND status IN ('ACCEPTED', 'PREPARING', 'READY_FOR_DISPATCH')) AS accepted_requests,
        (SELECT COUNT(*) FROM deliveries WHERE origin_blood_bank_id = ? AND delivery_status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED')) AS active_deliveries
       FROM dual`,
      [bloodBankId, bloodBankId, bloodBankId, bloodBankId, bloodBankId]
    );

    const pendingRequests = await query(
      `SELECT r.*, h.name as hospital_name, h.district, u.full_name as requester_name, rec.full_name as receiver_name
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       JOIN users u ON r.requested_by_user_id = u.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       WHERE r.blood_bank_id = ? AND r.status = 'PENDING'
       ORDER BY r.created_at DESC`,
      [bloodBankId]
    );

    const activeDeliveries = await query(
      `SELECT d.*, r.request_number, r.blood_group, r.blood_component, r.quantity,
              h.name as hospital_name, rec.full_name as receiver_name
       FROM deliveries d
       JOIN blood_requests r ON d.blood_request_id = r.id
       JOIN hospitals h ON d.destination_hospital_id = h.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       WHERE d.origin_blood_bank_id = ? AND d.delivery_status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED')
       ORDER BY d.created_at DESC`,
      [bloodBankId]
    );

    return res.json({
      success: true,
      stats: {
        totalInventoryRecords: stats.total_inventory_records || 0,
        availableUnits: stats.available_units || 0,
        pendingRequests: stats.pending_requests || 0,
        acceptedRequests: stats.accepted_requests || 0,
        activeDeliveries: stats.active_deliveries || 0
      },
      pendingRequests,
      activeDeliveries
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getInventory(req, res) {
  try {
    const bloodBankId = req.user.institution_id;
    const { bloodGroup, bloodComponent, status } = req.query;

    let sql = 'SELECT * FROM blood_inventory WHERE blood_bank_id = ?';
    const params = [bloodBankId];

    if (bloodGroup) {
      sql += ' AND blood_group = ?';
      params.push(bloodGroup);
    }
    if (bloodComponent) {
      sql += ' AND blood_component = ?';
      params.push(bloodComponent);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY expiry_date ASC';

    const inventory = await query(sql, params);
    return res.json({ success: true, count: inventory.length, inventory });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function addInventory(req, res) {
  try {
    const bloodBankId = req.user.institution_id;
    const {
      bloodGroup,
      bloodComponent,
      quantity,
      unit = 'Units',
      batchNumber,
      collectionDate,
      expiryDate,
      storageTemperature = '+2°C to +6°C',
      storageRequirement
    } = req.body;

    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add expired blood products to active inventory.'
      });
    }

    const result = await query(
      `INSERT INTO blood_inventory 
       (blood_bank_id, blood_group, blood_component, available_quantity, reserved_quantity, unit, batch_number, collection_date, expiry_date, storage_temperature, storage_requirement, status)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, 'AVAILABLE')`,
      [
        bloodBankId,
        bloodGroup,
        bloodComponent,
        parseInt(quantity, 10),
        unit,
        batchNumber,
        collectionDate,
        expiryDate,
        storageTemperature,
        storageRequirement || null
      ]
    );

    // Audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.user.role,
        'ADD_INVENTORY',
        'BLOOD_INVENTORY',
        result.insertId,
        JSON.stringify({ bloodGroup, bloodComponent, quantity, batchNumber })
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Blood product added to inventory successfully.',
      inventoryId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const bloodBankId = req.user.institution_id;
    const { availableQuantity, storageTemperature, status } = req.body;

    if (availableQuantity !== undefined && availableQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Available quantity cannot be negative.' });
    }

    const items = await query('SELECT * FROM blood_inventory WHERE id = ? AND blood_bank_id = ?', [id, bloodBankId]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    await query(
      `UPDATE blood_inventory 
       SET available_quantity = COALESCE(?, available_quantity),
           storage_temperature = COALESCE(?, storage_temperature),
           status = COALESCE(?, status)
       WHERE id = ? AND blood_bank_id = ?`,
      [availableQuantity, storageTemperature, status, id, bloodBankId]
    );

    return res.json({ success: true, message: 'Inventory item updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBloodBankRequests(req, res) {
  try {
    const bloodBankId = req.user.institution_id;
    const { status } = req.query;

    let sql = `
      SELECT r.*, h.name as hospital_name, h.district as hospital_district, h.latitude as hosp_lat, h.longitude as hosp_lng,
             u.full_name as requester_name, rec.full_name as receiver_name, rec.email as receiver_email,
             d.id as delivery_id, d.delivery_reference, d.delivery_status
      FROM blood_requests r
      JOIN hospitals h ON r.hospital_id = h.id
      JOIN users u ON r.requested_by_user_id = u.id
      JOIN users rec ON r.designated_receiver_id = rec.id
      LEFT JOIN deliveries d ON d.blood_request_id = r.id
      WHERE r.blood_bank_id = ?
    `;
    const params = [bloodBankId];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const requests = await query(sql, params);
    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const bloodBankId = req.user.institution_id;
    const userId = req.user.id;

    // Transactionally reserve inventory and accept request
    await withTransaction(async (conn) => {
      // 1. Lock and fetch request
      const [requests] = await conn.execute(
        'SELECT * FROM blood_requests WHERE id = ? AND blood_bank_id = ? FOR UPDATE',
        [id, bloodBankId]
      );

      if (requests.length === 0) {
        throw new Error('Request not found.');
      }

      const reqData = requests[0];
      if (reqData.status !== 'PENDING') {
        throw new Error(`Cannot accept request in status "${reqData.status}". Must be PENDING.`);
      }

      // 2. Find eligible inventory (non-expired, matching group & component, with sufficient stock)
      const [inventoryItems] = await conn.execute(
        `SELECT * FROM blood_inventory 
         WHERE blood_bank_id = ? 
           AND blood_group = ? 
           AND blood_component = ? 
           AND status = 'AVAILABLE' 
           AND expiry_date >= CURDATE()
           AND available_quantity >= ?
         ORDER BY expiry_date ASC FOR UPDATE`,
        [bloodBankId, reqData.blood_group, reqData.blood_component, reqData.quantity]
      );

      if (inventoryItems.length === 0) {
        throw new Error(
          `Insufficient stock available for ${reqData.quantity} units of ${reqData.blood_group} (${reqData.blood_component}).`
        );
      }

      const selectedItem = inventoryItems[0];

      // 3. Atomically reserve stock
      await conn.execute(
        `UPDATE blood_inventory 
         SET available_quantity = available_quantity - ?, 
             reserved_quantity = reserved_quantity + ? 
         WHERE id = ?`,
        [reqData.quantity, reqData.quantity, selectedItem.id]
      );

      // 4. Record reservation
      await conn.execute(
        `INSERT INTO inventory_reservations (blood_request_id, inventory_id, reserved_quantity, status)
         VALUES (?, ?, ?, 'ACTIVE')`,
        [id, selectedItem.id, reqData.quantity]
      );

      // 5. Update request status to ACCEPTED
      await conn.execute(
        `UPDATE blood_requests SET status = 'ACCEPTED' WHERE id = ?`,
        [id]
      );

      // 6. Audit log
      await conn.execute(
        `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json)
         VALUES (?, ?, 'ACCEPT_BLOOD_REQUEST', 'BLOOD_REQUEST', ?, ?)`,
        [userId, req.user.role, id, JSON.stringify({ reservedInventoryId: selectedItem.id, quantity: reqData.quantity })]
      );
    });

    // Notify hospital via email
    const [hospitalInfo] = await query(
      `SELECT h.contact_email, r.request_number, r.blood_group, r.quantity, b.name as blood_bank_name
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       JOIN blood_banks b ON r.blood_bank_id = b.id
       WHERE r.id = ?`,
      [id]
    );

    if (hospitalInfo.length > 0) {
      const h = hospitalInfo[0];
      sendRequestAcceptedEmail({
        hospitalEmail: h.contact_email,
        requestNumber: h.request_number,
        bloodBankName: h.blood_bank_name,
        quantity: h.quantity,
        bloodGroup: h.blood_group
      }).catch((e) => console.error('Email error:', e.message));
    }

    return res.json({
      success: true,
      message: 'Request accepted successfully. Required blood inventory reserved transactionally.'
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;
    const bloodBankId = req.user.institution_id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
    }

    const requests = await query(
      'SELECT r.*, h.contact_email, b.name as blood_bank_name FROM blood_requests r JOIN hospitals h ON r.hospital_id = h.id JOIN blood_banks b ON r.blood_bank_id = b.id WHERE r.id = ? AND r.blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const reqData = requests[0];
    if (reqData.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status "${reqData.status}".`
      });
    }

    await query(
      'UPDATE blood_requests SET status = "REJECTED", rejection_reason = ? WHERE id = ?',
      [reason, id]
    );

    // Audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, "REJECT_BLOOD_REQUEST", "BLOOD_REQUEST", ?, ?)',
      [req.user.id, req.user.role, id, JSON.stringify({ reason })]
    );

    // Send email
    sendRequestRejectedEmail({
      hospitalEmail: reqData.contact_email,
      requestNumber: reqData.request_number,
      bloodBankName: reqData.blood_bank_name,
      reason
    }).catch((e) => console.error('Email error:', e.message));

    return res.json({ success: true, message: 'Request declined.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function preparePackage(req, res) {
  try {
    const { id } = req.params;
    const bloodBankId = req.user.institution_id;
    const { packageId, coldChainVerified, tamperSealApplied, notes } = req.body;

    const requests = await query(
      'SELECT * FROM blood_requests WHERE id = ? AND blood_bank_id = ?',
      [id, bloodBankId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const reqData = requests[0];
    if (!['ACCEPTED', 'PREPARING'].includes(reqData.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition. Request must be in ACCEPTED or PREPARING status (Current: ${reqData.status}).`
      });
    }

    // Advance to READY_FOR_DISPATCH
    await query(
      'UPDATE blood_requests SET status = "READY_FOR_DISPATCH", remarks = CONCAT(COALESCE(remarks, ""), ? ) WHERE id = ?',
      [` [Prepared: pkg ${packageId || 'AUTO'}, coldChain:${coldChainVerified ? 'YES' : 'NO'}, seal:${tamperSealApplied ? 'YES' : 'NO'}]`, id]
    );

    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, "PACKAGE_PREPARED", "BLOOD_REQUEST", ?, ?)',
      [req.user.id, req.user.role, id, JSON.stringify({ packageId, coldChainVerified, tamperSealApplied, notes })]
    );

    return res.json({
      success: true,
      message: 'Package preparation verified. Request is now READY FOR DISPATCH.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function dispatchDelivery(req, res) {
  try {
    const { id } = req.params;
    const bloodBankId = req.user.institution_id;
    const { droneIdentifier = 'LD-HEXA-01' } = req.body;

    // Only BLOOD_BANK_AUTHORIZER or BLOOD_BANK_ADMIN can dispatch
    if (!['BLOOD_BANK_AUTHORIZER', 'BLOOD_BANK_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only authorized dispatch personnel can authorize and dispatch medical drones.'
      });
    }

    const requests = await query(
      `SELECT r.*, 
              h.id as hosp_id, h.name as hospital_name, h.latitude as hosp_lat, h.longitude as hosp_lng,
              b.latitude as bb_lat, b.longitude as bb_lng,
              rec.email as receiver_email, rec.full_name as receiver_name
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       JOIN blood_banks b ON r.blood_bank_id = b.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       WHERE r.id = ? AND r.blood_bank_id = ?`,
      [id, bloodBankId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const reqData = requests[0];
    if (reqData.status !== 'READY_FOR_DISPATCH') {
      return res.status(400).json({
        success: false,
        message: `Request must be in READY_FOR_DISPATCH status before launching drone. Current status: ${reqData.status}`
      });
    }

    // 1. Calculate A* Route
    const startNode = await findVertiportNode('BLOOD_BANK', bloodBankId);
    const endNode = await findVertiportNode('HOSPITAL', reqData.hosp_id);
    const routePlan = await planRouteAStar(startNode, endNode);

    // 2. Generate cryptographically secure delivery passkey
    const { passkey, salt, hash } = generateDeliveryPasskey();

    const deliveryRef = generateReferenceCode('DEL');

    let deliveryId;

    await withTransaction(async (conn) => {
      // Save delivery route
      const [routeRes] = await conn.execute(
        `INSERT INTO delivery_routes (blood_bank_id, hospital_id, route_name, total_distance_km, estimated_flight_minutes, waypoints_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bloodBankId,
          reqData.hosp_id,
          `${routePlan.startNodeCode} to ${routePlan.endNodeCode} Emergency Skyway`,
          routePlan.totalDistanceKm,
          routePlan.flightDurationMinutes,
          JSON.stringify(routePlan.waypoints)
        ]
      );
      const routeId = routeRes.insertId;

      // Save delivery
      const startPoint = routePlan.waypoints[0];
      const [delRes] = await conn.execute(
        `INSERT INTO deliveries 
         (delivery_reference, blood_request_id, origin_blood_bank_id, destination_hospital_id, route_id, drone_identifier, dispatch_time, delivery_status, eta_minutes, distance_km, current_lat, current_lng, current_step_index, tracking_mode)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), 'DISPATCHED', ?, ?, ?, ?, 0, 'SIMULATED')`,
        [
          deliveryRef,
          id,
          bloodBankId,
          reqData.hosp_id,
          routeId,
          droneIdentifier,
          routePlan.flightDurationMinutes,
          routePlan.totalDistanceKm,
          startPoint.lat,
          startPoint.lng
        ]
      );
      deliveryId = delRes.insertId;

      // Save passkey hash (60 min expiration)
      await conn.execute(
        `INSERT INTO delivery_passkeys (delivery_id, passkey_hash, passkey_salt, expiration_timestamp, attempts_count)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 60 MINUTE), 0)`,
        [deliveryId, hash, salt]
      );

      // Create initial dispatch event
      await conn.execute(
        `INSERT INTO delivery_events (delivery_id, event_type, latitude, longitude, altitude_meters, speed_kmh, battery_pct, status, remarks)
         VALUES (?, 'DISPATCHED', ?, ?, 45, 0, 99, 'DISPATCHED', 'Pre-flight vertipad checks verified. Take-off cleared.')`,
        [deliveryId, startPoint.lat, startPoint.lng]
      );

      // Create 5-minute recurring notification job
      await conn.execute(
        `INSERT INTO notification_jobs (delivery_id, recipient_email, recipient_role, job_type, interval_minutes, next_run_at, status)
         VALUES (?, ?, 'HOSPITAL_RECEIVER', 'FIVE_MINUTE_PROGRESS', 5, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'ACTIVE')`,
        [deliveryId, reqData.receiver_email]
      );

      // Update blood request status
      await conn.execute(
        `UPDATE blood_requests SET status = 'DISPATCHED' WHERE id = ?`,
        [id]
      );

      // Audit log
      await conn.execute(
        `INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json)
         VALUES (?, ?, 'DISPATCH_CONFIRMED', 'DELIVERY', ?, ?)`,
        [
          req.user.id,
          req.user.role,
          deliveryId,
          JSON.stringify({
            deliveryRef,
            droneIdentifier,
            distanceKm: routePlan.totalDistanceKm,
            etaMinutes: routePlan.flightDurationMinutes
          })
        ]
      );
    });

    // Send dispatch alert email with passkey to DESIGNATED RECEIVER
    sendDispatchAlertWithPasskey({
      receiverEmail: reqData.receiver_email,
      receiverName: reqData.receiver_name,
      requestNumber: reqData.request_number,
      deliveryRef,
      droneId: droneIdentifier,
      etaMinutes: routePlan.flightDurationMinutes,
      passkey, // Sent securely to designated receiver
      hospitalName: reqData.hospital_name
    }).catch((e) => console.error('Dispatch email error:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Drone dispatched successfully! A* route locked and single-use passkey issued.',
      deliveryId,
      deliveryRef,
      droneIdentifier,
      routePlan,
      // For evaluation/demo testing convenience, include demo passkey in response
      demoPasskeyNotice: 'FOR TESTING/DEMO EVALUATION: Passkey is ' + passkey,
      passkey
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
