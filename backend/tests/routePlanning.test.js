import test from 'node:test';
import assert from 'node:assert';
import pool from '../src/config/database.js';
import { haversineDistanceKm, planRouteAStar } from '../src/services/routePlanningService.js';

test('haversineDistanceKm calculates accurate distance between Ongole and Chirala', () => {
  // Ongole (15.5057, 80.0499) to Chirala (15.8246, 80.3522) ~ 48-50 km
  const dist = haversineDistanceKm(15.5057, 80.0499, 15.8246, 80.3522);
  assert.ok(dist > 40 && dist < 60, `Distance should be ~49km, got ${dist}`);
});

test('haversineDistanceKm returns 0 for identical coordinates', () => {
  const dist = haversineDistanceKm(15.5057, 80.0499, 15.5057, 80.0499);
  assert.strictEqual(dist, 0);
});

test('A* pathfinding finds route between Red Cross Ongole and RIMS Ongole', async () => {
  const plan = await planRouteAStar('VERT-BB-RC', 'VERT-HOSP-RIMS');
  assert.strictEqual(plan.success, true);
  assert.ok(plan.waypoints.length >= 2, 'Route must have at least 2 waypoints');
  assert.strictEqual(plan.waypoints[0].code, 'VERT-BB-RC');
  assert.strictEqual(plan.waypoints[plan.waypoints.length - 1].code, 'VERT-HOSP-RIMS');
  assert.ok(plan.totalDistanceKm > 0, 'Distance must be positive');
  assert.ok(plan.flightDurationMinutes > 0, 'Duration must be positive');
});

test.after(async () => {
  await pool.end();
});
