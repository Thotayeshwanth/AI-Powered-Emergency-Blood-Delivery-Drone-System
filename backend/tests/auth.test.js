import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

test('bcrypt hashes and validates password correctly', async () => {
  const plain = 'Password@123';
  const hash = await bcrypt.hash(plain, 10);
  assert.strictEqual(await bcrypt.compare(plain, hash), true);
  assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false);
});

test('jwt generates and verifies payload', () => {
  const secret = 'test_secret_lifedrone_123';
  const token = jwt.sign({ userId: 1, role: 'HOSPITAL_ADMIN' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.userId, 1);
  assert.strictEqual(decoded.role, 'HOSPITAL_ADMIN');
});
