import test from 'node:test';
import assert from 'node:assert';
import { generateDeliveryPasskey, hashPasskey, verifyPasskeyHash } from '../src/utils/cryptoUtils.js';

test('generateDeliveryPasskey produces 6-digit numeric passkey with salt and hash', () => {
  const { passkey, salt, hash } = generateDeliveryPasskey();
  assert.strictEqual(passkey.length, 6);
  assert.ok(/^\d{6}$/.test(passkey), 'Passkey should be strictly 6 digits');
  assert.ok(salt.length >= 16, 'Salt should be secure hex string');
  assert.ok(hash.length === 64, 'SHA-256 hash length should be 64 characters');
});

test('verifyPasskeyHash verifies matching passkey and rejects bad code', () => {
  const { passkey, salt, hash } = generateDeliveryPasskey();
  assert.strictEqual(verifyPasskeyHash(passkey, salt, hash), true);
  assert.strictEqual(verifyPasskeyHash('000000', salt, hash), false);
  assert.strictEqual(verifyPasskeyHash(passkey + '1', salt, hash), false);
  assert.strictEqual(verifyPasskeyHash('', salt, hash), false);
});
