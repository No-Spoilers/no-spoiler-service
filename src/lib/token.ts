import jwt from 'jsonwebtoken';
import generateId from './base64id.js';

const { TOKEN_SECRET } = process.env;

interface User {
  userId: string;
  [key: string]: unknown;
}

interface TokenPayload {
  [key: string]: unknown;
}

interface VerifiedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
  jti: string;
  sub: string;
  [key: string]: unknown;
}

export function createNewToken(user: User): string {
  if (!TOKEN_SECRET || typeof TOKEN_SECRET !== 'string') {
    throw new Error(`Invalid TOKEN_SECRET ${TOKEN_SECRET}`);
  }

  const payload: TokenPayload = {}; // to be determined

  const jwtId = generateId(20);

  const token = jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: '100d',
    jwtid: jwtId,
    subject: user.userId,
  });

  return token;
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

export type { User, TokenPayload, VerifiedToken };
