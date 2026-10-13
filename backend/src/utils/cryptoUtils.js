import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit numeric delivery passkey.
 * Uses crypto.randomInt (never Math.random).
 */
export function generateDeliveryPasskey() {
  const min = 100000;
  const max = 999999;
  const passkey = crypto.randomInt(min, max + 1).toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPasskey(passkey, salt);
  return { passkey, salt, hash };
}

/**
 * Computes SHA-256 hash of (passkey + salt)
 */
export function hashPasskey(passkey, salt) {
  return crypto
    .createHash('sha256')
    .update(`${passkey.trim()}${salt}`)
    .digest('hex');
}

/**
 * Verifies if entered passkey matches the stored salt and hash
 */
export function verifyPasskeyHash(inputPasskey, salt, storedHash) {
  if (!inputPasskey || !salt || !storedHash) return false;
  const computedHash = hashPasskey(inputPasskey, salt);
  // Timing-safe comparison to prevent timing attacks
  const computedBuf = Buffer.from(computedHash, 'utf8');
  const storedBuf = Buffer.from(storedHash, 'utf8');
  if (computedBuf.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(computedBuf, storedBuf);
}

/**
 * Generates unique reference code (e.g., REQ-202610-A91B, DEL-202610-82C3)
 */
export function generateReferenceCode(prefix = 'LD') {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${yearMonth}-${randomHex}`;
}
