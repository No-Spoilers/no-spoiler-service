import jwt from 'jsonwebtoken';
import generateId from './base64id.js';

const { TOKEN_SECRET } = process.env;

export function createNewToken(user) {
  if (!TOKEN_SECRET || typeof TOKEN_SECRET !== 'string') {
    throw `Invalid TOKEN_SECRET ${TOKEN_SECRET}`;
  }

  const payload = {}; // to be determined

  const jwtId = generateId(20);

  const token = jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: '100d',
    jwtid: jwtId,
    subject: user.userId
  })

  return token;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, TOKEN_SECRET);
  } catch (error) {
    console.error(error);
    return false;
  }
}