import { query } from '../config/database.js';
import { sendProgressUpdateEmail } from '../services/emailService.js';
import { updateDeliverySimulation } from '../services/simulationService.js';

let schedulerInterval = null;

/**
 * Checks active deliveries and executes due notification jobs
 */
export async function processNotificationJobs() {
  try {
    // Find active notification jobs due to run
    const jobs = await query(
      `SELECT nj.*, d.delivery_reference, d.drone_identifier, d.delivery_status, d.eta_minutes, 
              d.current_lat, d.current_lng, d.distance_km,
              h.name as hospital_name
       FROM notification_jobs nj
       JOIN deliveries d ON nj.delivery_id = d.id
       JOIN hospitals h ON d.destination_hospital_id = h.id
       WHERE nj.status = 'ACTIVE' 
         AND nj.next_run_at <= NOW()
         AND d.delivery_status IN ('DISPATCHED', 'IN_TRANSIT')`
    );

    for (const job of jobs) {
      try {
        // First update simulation telemetry
        const simulated = await updateDeliverySimulation(job.delivery_id);

        // Check if delivery has completed or arrived in the meantime
        if (simulated && ['ARRIVED', 'DELIVERED', 'CANCELLED'].includes(simulated.delivery_status)) {
          await query(
            `UPDATE notification_jobs SET status = 'COMPLETED', updated_at = NOW() WHERE id = ?`,
            [job.id]
          );
          continue;
        }

        const currentStatus = simulated ? simulated.delivery_status : job.delivery_status;
        const etaMinutes = simulated ? simulated.eta_minutes : job.eta_minutes;
        const batteryPct = simulated ? simulated.battery_pct : 88;
        const waypointDesc = `Lat ${simulated?.current_lat || job.current_lat}, Lng ${simulated?.current_lng || job.current_lng}`;

        // Send progress email
        await sendProgressUpdateEmail({
          receiverEmail: job.recipient_email,
          deliveryRef: job.delivery_reference,
          droneId: job.drone_identifier,
          currentStatus,
          currentWaypoint: waypointDesc,
          etaMinutes,
          batteryPct
        });

        // Schedule next execution 5 minutes ahead
        await query(
          `UPDATE notification_jobs 
           SET last_sent_at = NOW(), 
               next_run_at = DATE_ADD(NOW(), INTERVAL ? MINUTE), 
               updated_at = NOW()
           WHERE id = ?`,
          [job.interval_minutes || 5, job.id]
        );
      } catch (jobErr) {
        console.error(`[Scheduler Error] Job ID ${job.id}:`, jobErr.message);
        await query(
          `UPDATE notification_jobs SET failure_count = failure_count + 1 WHERE id = ?`,
          [job.id]
        );
      }
    }

    // Automatically complete jobs for deliveries that are no longer active
    await query(
      `UPDATE notification_jobs nj
       JOIN deliveries d ON nj.delivery_id = d.id
       SET nj.status = 'COMPLETED', nj.updated_at = NOW()
       WHERE nj.status = 'ACTIVE' AND d.delivery_status IN ('DELIVERED', 'CANCELLED', 'FAILED')`
    );
  } catch (err) {
    console.error('[Notification Scheduler] Tick failure:', err.message);
  }
}

/**
 * Starts background scheduler ticker
 */
export function startNotificationScheduler() {
  if (schedulerInterval) return;
  console.log('Starting LifeDrone Notification & Simulation Scheduler (30s interval)...');
  // Check every 30 seconds for due 5-minute notifications or simulation updates
  schedulerInterval = setInterval(processNotificationJobs, 30000);
}

/**
 * Graceful stop
 */
export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('LifeDrone Notification Scheduler stopped.');
  }
}
