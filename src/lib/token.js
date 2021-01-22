import * as jwt from 'jsonwebtoken';
import generateId from './base64id';

const { TOKEN_SECRET } = process.env;

export function createNewToken(user) {
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
  } catch (err) {
    console.log('err:', err);
    return false;
  }
}