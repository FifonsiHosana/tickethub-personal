import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import config from '@/config/config.js';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateOTP(length = 6) {
  const digits = '0123456789';

  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
}

export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, config.auth.jwt_secret, {
    expiresIn: '1h',
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.auth.jwt_secret);
}

export function getOtpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}
