import { query, withTransaction } from '../config/database.js';
import { generateReferenceCode, verifyPasskeyHash } from '../utils/cryptoUtils.js';
import { updateDeliverySimulation } from '../services/simulationService.js';
import { sendRequestSubmittedEmail, sendDeliveryCompletedEmail } from '../services/emailService.js';
import { haversineDistanceKm } from '../services/routePlanningService.js';

export async function getHospitals(req, res) {
  try {
    const hospitals = await query(
      'SELECT id, name, code, address, district, state, latitude, longitude, contact_phone, contact_email FROM hospitals WHERE is_approved = TRUE'
    );
    return res.json({ success: true, hospitals });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getHospitalDashboard(req, res) {
  try {
    const hospitalId = req.user.institution_id;

    // Counts from database
    const [stats] = await query(
      `SELECT
        (SELECT COUNT(*) FROM blood_requests WHERE hospital_id = ? AND status = 'PENDING') AS pending_requests,
        (SELECT COUNT(*) FROM blood_requests WHERE hospital_id = ? AND status IN ('ACCEPTED', 'PREPARING', 'READY_FOR_DISPATCH')) AS accepted_requests,
        (SELECT COUNT(*) FROM deliveries WHERE destination_hospital_id = ? AND delivery_status IN ('DISPATCHED', 'IN_TRANSIT', 'ARRIVED')) AS active_deliveries,
        (SELECT COUNT(*) FROM deliveries WHERE destination_hospital_id = ? AND delivery_status = 'DELIVERED') AS completed_deliveries,
        (SELECT SUM(available_quantity) FROM blood_inventory WHERE status = 'AVAILABLE' AND expiry_date >= CURDATE()) AS available_network_units
       FROM dual`,
      [hospitalId, hospitalId, hospitalId, hospitalId]
    );

    // Recent requests
    const recentRequests = await query(
      `SELECT r.*, b.name as blood_bank_name, u.full_name as requested_by_name, rec.full_name as receiver_name
       FROM blood_requests r
       JOIN blood_banks b ON r.blood_bank_id = b.id
       JOIN users u ON r.requested_by_user_id = u.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       WHERE r.hospital_id = ?
       ORDER BY r.created_at DESC
       LIMIT 6`,
      [hospitalId]
    );

    // Active deliveries
    const activeDeliveries = await query(
      `SELECT d.*, r.request_number, r.blood_group, r.blood_component, r.quantity,
              b.name as blood_bank_name, rec.full_name as receiver_name
       FROM deliveries d
       JOIN blood_requests r ON d.blood_request_id = r.id
       JOIN blood_banks b ON d.origin_blood_bank_id = b.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       WHERE d.destination_hospital_id = ? AND d.delivery_status IN ('SCHEDULED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED')
       ORDER BY d.created_at DESC`,
      [hospitalId]
    );

    return res.json({
      success: true,
      stats: {
        pendingRequests: stats.pending_requests || 0,
        acceptedRequests: stats.accepted_requests || 0,
        activeDeliveries: stats.active_deliveries || 0,
        completedDeliveries: stats.completed_deliveries || 0,
        availableNetworkUnits: stats.available_network_units || 0
      },
      recentRequests,
      activeDeliveries
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function searchBloodInventory(req, res) {
  try {
    const { bloodGroup, bloodComponent, quantity = 1 } = req.query;
    const hospitalId = req.user.institution_id;

    // Get current hospital location for distance computation
    const hospitals = await query('SELECT latitude, longitude FROM hospitals WHERE id = ?', [hospitalId]);
    const hospLoc = hospitals[0] || { latitude: 15.5057, longitude: 80.0499 };

    let sql = `
      SELECT bi.id as inventory_id, bi.blood_group, bi.blood_component, bi.available_quantity, 
             bi.unit, bi.batch_number, bi.storage_temperature, bi.expiry_date,
             bb.id as blood_bank_id, bb.name as blood_bank_name, bb.address, bb.contact_phone,
             bb.latitude, bb.longitude
      FROM blood_inventory bi
      JOIN blood_banks bb ON bi.blood_bank_id = bb.id
      WHERE bi.status = 'AVAILABLE' 
        AND bi.available_quantity >= ?
        AND bi.expiry_date >= CURDATE()
        AND bb.is_approved = TRUE
    `;
    const params = [parseInt(quantity, 10) || 1];

    if (bloodGroup) {
      sql += ' AND bi.blood_group = ?';
      params.push(bloodGroup);
    }
    if (bloodComponent) {
      sql += ' AND bi.blood_component = ?';
      params.push(bloodComponent);
    }

    sql += ' ORDER BY bi.expiry_date ASC';

    const results = await query(sql, params);

    // Compute approximate aerial distance to each blood bank
    const enriched = results.map((item) => {
      const distanceKm = haversineDistanceKm(
        parseFloat(hospLoc.latitude),
        parseFloat(hospLoc.longitude),
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
      const estFlightMinutes = Math.max(3, Math.ceil((distanceKm / 65) * 60) + 2);
      return {
        ...item,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        estFlightMinutes
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      results: enriched
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBloodRequest(req, res) {
  try {
    const hospitalId = req.user.institution_id;
    const requestedByUserId = req.user.id;
    const {
      bloodBankId,
      designatedReceiverId,
      patientReference,
      bloodGroup,
      bloodComponent,
      quantity,
      urgency,
      requiredByTime,
      remarks
    } = req.body;

    // Validate that receiver belongs to the hospital
    const receivers = await query(
      'SELECT id, email, full_name FROM users WHERE id = ? AND institution_type = "HOSPITAL" AND institution_id = ? AND role = "HOSPITAL_RECEIVER"',
      [designatedReceiverId, hospitalId]
    );

    if (receivers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid designated receiver. Must be an authorized receiver registered to your hospital.'
      });
    }

    const bloodBanks = await query('SELECT id, name, contact_email FROM blood_banks WHERE id = ?', [bloodBankId]);
    if (bloodBanks.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected blood bank not found.' });
    }

    const requestNumber = generateReferenceCode('REQ');

    const result = await query(
      `INSERT INTO blood_requests 
       (request_number, hospital_id, blood_bank_id, requested_by_user_id, designated_receiver_id, patient_reference, blood_group, blood_component, quantity, urgency, required_by_time, remarks, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        requestNumber,
        hospitalId,
        bloodBankId,
        requestedByUserId,
        designatedReceiverId,
        patientReference,
        bloodGroup,
        bloodComponent,
        quantity,
        urgency,
        requiredByTime,
        remarks || null
      ]
    );

    // Send confirmation email
    sendRequestSubmittedEmail({
      hospitalEmail: req.user.email,
      requestNumber,
      bloodGroup,
      component: bloodComponent,
      quantity,
      bloodBankName: bloodBanks[0].name
    }).catch((e) => console.error('Email error:', e.message));

    // Audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.user.role,
        'CREATE_BLOOD_REQUEST',
        'BLOOD_REQUEST',
        result.insertId,
        JSON.stringify({ requestNumber, urgency, quantity, bloodGroup })
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Blood request registered successfully.',
      requestId: result.insertId,
      requestNumber
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getHospitalRequests(req, res) {
  try {
    const hospitalId = req.user.institution_id;
    const { status, search } = req.query;

    let sql = `
      SELECT r.*, b.name as blood_bank_name, b.contact_phone as blood_bank_phone,
             u.full_name as requested_by_name, rec.full_name as receiver_name, rec.email as receiver_email,
             d.id as delivery_id, d.delivery_reference, d.delivery_status
      FROM blood_requests r
      JOIN blood_banks b ON r.blood_bank_id = b.id
      JOIN users u ON r.requested_by_user_id = u.id
      JOIN users rec ON r.designated_receiver_id = rec.id
      LEFT JOIN deliveries d ON d.blood_request_id = r.id
      WHERE r.hospital_id = ?
    `;
    const params = [hospitalId];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (r.request_number LIKE ? OR r.patient_reference LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.created_at DESC';

    const requests = await query(sql, params);
    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRequestDetails(req, res) {
  try {
    const { id } = req.params;
    const hospitalId = req.user.institution_id;

    const requests = await query(
      `SELECT r.*, 
              h.name as hospital_name, h.address as hospital_address, h.latitude as hosp_lat, h.longitude as hosp_lng,
              b.name as blood_bank_name, b.address as blood_bank_address, b.latitude as bb_lat, b.longitude as bb_lng,
              b.contact_phone as blood_bank_phone, b.contact_email as blood_bank_email,
              u.full_name as requested_by_name, u.email as requested_by_email,
              rec.full_name as receiver_name, rec.email as receiver_email, rec.phone_number as receiver_phone,
              d.id as delivery_id, d.delivery_reference, d.delivery_status, d.drone_identifier, d.eta_minutes, d.distance_km,
              d.current_lat, d.current_lng, d.dispatch_time, d.arrival_time, d.completion_time
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       JOIN blood_banks b ON r.blood_bank_id = b.id
       JOIN users u ON r.requested_by_user_id = u.id
       JOIN users rec ON r.designated_receiver_id = rec.id
       LEFT JOIN deliveries d ON d.blood_request_id = r.id
       WHERE r.id = ? AND r.hospital_id = ?`,
      [id, hospitalId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];

    // Notification logs for this request
    const emailLogs = await query(
      `SELECT recipient_email, subject, template_name, status, sent_at 
       FROM email_logs 
       WHERE recipient_email IN (?, ?) 
       ORDER BY sent_at DESC LIMIT 10`,
      [request.requested_by_email, request.receiver_email]
    );

    return res.json({
      success: true,
      request,
      emailLogs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function cancelBloodRequest(req, res) {
  try {
    const { id } = req.params;
    const hospitalId = req.user.institution_id;
    const { reason } = req.body;

    const requests = await query(
      'SELECT id, status, blood_bank_id, request_number FROM blood_requests WHERE id = ? AND hospital_id = ?',
      [id, hospitalId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];
    if (['DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel request once package is dispatched or in-flight.'
      });
    }

    // Cancel transactionally: restore inventory if already reserved
    await withTransaction(async (conn) => {
      // Find active reservations
      const [reservations] = await conn.execute(
        'SELECT * FROM inventory_reservations WHERE blood_request_id = ? AND status = "ACTIVE"',
        [id]
      );

      for (const resv of reservations) {
        // Restore stock
        await conn.execute(
          'UPDATE blood_inventory SET available_quantity = available_quantity + ?, reserved_quantity = reserved_quantity - ? WHERE id = ?',
          [resv.reserved_quantity, resv.reserved_quantity, resv.inventory_id]
        );
        await conn.execute(
          'UPDATE inventory_reservations SET status = "CANCELLED_AND_RESTORED", released_at = NOW() WHERE id = ?',
          [resv.id]
        );
      }

      await conn.execute(
        'UPDATE blood_requests SET status = "CANCELLED", rejection_reason = ? WHERE id = ?',
        [reason || 'Cancelled by hospital requester', id]
      );
    });

    return res.json({ success: true, message: 'Blood request cancelled successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getDeliveryTracking(req, res) {
  try {
    const { id } = req.params;
    const hospitalId = req.user.institution_id;

    // Check delivery belongs to this hospital
    const deliveries = await query(
      'SELECT id FROM deliveries WHERE id = ? AND destination_hospital_id = ?',
      [id, hospitalId]
    );

    if (deliveries.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    // Update simulation coordinates
    const trackingData = await updateDeliverySimulation(id);

    // Fetch recent delivery events
    const events = await query(
      'SELECT event_type, latitude, longitude, altitude_meters, speed_kmh, battery_pct, status, remarks, recorded_at FROM delivery_events WHERE delivery_id = ? ORDER BY recorded_at DESC LIMIT 15',
      [id]
    );

    return res.json({
      success: true,
      delivery: trackingData,
      events,
      disclaimer: 'SIMULATED DRONE TRACKING — DEMONSTRATION MODE'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function verifyDeliveryPasskey(req, res) {
  try {
    const { id } = req.params;
    const { passkey } = req.body;
    const hospitalId = req.user.institution_id;
    const userId = req.user.id;

    // Only HOSPITAL_RECEIVER or HOSPITAL_ADMIN can verify passkey
    if (!['HOSPITAL_RECEIVER', 'HOSPITAL_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only authorized hospital receivers can verify delivery passkeys.'
      });
    }

    // Get delivery & passkey record
    const deliveries = await query(
      `SELECT d.*, r.designated_receiver_id, r.request_number,
              h.name as hospital_name, u.email as receiver_email, u.full_name as receiver_name,
              pk.id as passkey_id, pk.passkey_hash, pk.passkey_salt, pk.expiration_timestamp, 
              pk.used_timestamp, pk.is_revoked, pk.attempts_count
       FROM deliveries d
       JOIN blood_requests r ON d.blood_request_id = r.id
       JOIN hospitals h ON d.destination_hospital_id = h.id
       JOIN users u ON r.designated_receiver_id = u.id
       LEFT JOIN delivery_passkeys pk ON pk.delivery_id = d.id
       WHERE d.id = ? AND d.destination_hospital_id = ?`,
      [id, hospitalId]
    );

    if (deliveries.length === 0) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const item = deliveries[0];

    if (!item.passkey_id) {
      return res.status(400).json({ success: false, message: 'No passkey generated for this delivery.' });
    }

    if (item.used_timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Passkey has already been used and is deactivated. Delivery is already confirmed.'
      });
    }

    if (item.is_revoked) {
      return res.status(400).json({ success: false, message: 'Passkey has been revoked.' });
    }

    if (new Date(item.expiration_timestamp) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Passkey has expired. Please contact blood bank authorizer for a fresh token.'
      });
    }

    // Verify hash
    const isValid = verifyPasskeyHash(passkey, item.passkey_salt, item.passkey_hash);

    if (!isValid) {
      // Increment attempt counter
      await query('UPDATE delivery_passkeys SET attempts_count = attempts_count + 1 WHERE id = ?', [item.passkey_id]);
      return res.status(400).json({
        success: false,
        message: 'Invalid passkey code. Verification failed.'
      });
    }

    // Atomically consume passkey and complete delivery
    await withTransaction(async (conn) => {
      // Mark passkey used
      await conn.execute(
        'UPDATE delivery_passkeys SET used_timestamp = NOW(), used_by_user_id = ? WHERE id = ? AND used_timestamp IS NULL',
        [userId, item.passkey_id]
      );

      // Mark delivery DELIVERED
      await conn.execute(
        'UPDATE deliveries SET delivery_status = "DELIVERED", completion_time = NOW() WHERE id = ?',
        [id]
      );

      // Mark blood request DELIVERED
      await conn.execute(
        'UPDATE blood_requests SET status = "DELIVERED" WHERE id = ?',
        [item.blood_request_id]
      );

      // Release inventory reservations permanently
      await conn.execute(
        'UPDATE inventory_reservations SET status = "RELEASED_FOR_DELIVERY", released_at = NOW() WHERE blood_request_id = ?',
        [item.blood_request_id]
      );

      // Record handover event
      await conn.execute(
        `INSERT INTO delivery_events (delivery_id, event_type, latitude, longitude, altitude_meters, speed_kmh, battery_pct, status, remarks)
         VALUES (?, 'HANDOVER_VERIFIED', ?, ?, 0, 0, 80, 'DELIVERED', 'Passkey securely verified. Payload custody transferred.')`,
        [id, item.current_lat || 15.5057, item.current_lng || 80.0499]
      );

      // Audit log
      await conn.execute(
        'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userId,
          req.user.role,
          'PASSKEY_VERIFIED_DELIVERY_COMPLETED',
          'DELIVERY',
          id,
          JSON.stringify({ deliveryRef: item.delivery_reference, receiverName: item.receiver_name })
        ]
      );
    });

    // Send receipt email
    sendDeliveryCompletedEmail({
      receiverEmail: item.receiver_email,
      deliveryRef: item.delivery_reference,
      receiverName: item.receiver_name,
      hospitalName: item.hospital_name,
      completedAt: new Date().toISOString()
    }).catch((e) => console.error('Completed email error:', e.message));

    return res.json({
      success: true,
      message: 'Passkey verified successfully! Medical handover confirmed and delivery completed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
