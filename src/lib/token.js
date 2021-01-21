import * as jwt from 'jsonwebtoken';
import generateId from './base64id';

const { TOKEN_SECRET } = process.env;

export function createNewToken(user) {
  const payload = {
    userId: user.sort_key,
    name: user.name
  };

  const jwtId = generateId(20);

  const token = jwt.sign(payload, TOKEN_SECRET, {
    expiresIn: '1h',
    jwtid: jwtId,
    subject: user.sort_key
  })

  return token;
}