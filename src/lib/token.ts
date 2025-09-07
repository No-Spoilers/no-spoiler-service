import jwt from 'jsonwebtoken';
import { generateId } from './base64id.js';

const { TOKEN_SECRET } = process.env;

export type User = {
  userId: string;
  [key: string]: unknown;
};

export type TokenPayload = {
  [key: string]: unknown;
};

export type VerifiedToken = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  jti: string;
  sub: string;
  [key: string]: unknown;
};

export function createNewToken(user: User): string {
  if (!TOKEN_SECRET || typeof TOKEN_SECRET !== 'string') {
    throw new Error('Invalid TOKEN_SECRET');
  }

  return jwt.sign({}, TOKEN_SECRET, {
    expiresIn: '100d',
    jwtid: generateId(20),
    subject: user.userId,
  });
}

export function verifyToken(token: string): VerifiedToken | false {
  try {
    if (!TOKEN_SECRET || typeof TOKEN_SECRET !== 'string') {
      return false;
    }
    return jwt.verify(token, TOKEN_SECRET) as VerifiedToken;
  } catch (error) {
    console.error(error);
    return false;
  }
}
