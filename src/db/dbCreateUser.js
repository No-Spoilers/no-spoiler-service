import bcrypt from 'bcryptjs';
import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';
import dbQueryUserByEmail from './dbQueryUserByEmail.js';

export default async function dbCreateUser(name, preservedCaseEmail, password) {
  const email = preservedCaseEmail.toLowerCase();
  const now = new Date().toISOString();

  const result = await dbQueryUserByEmail(email);
  if (result) {
    result.existing = true;
    return result;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    primary_key: 'user',
    sort_key: email,
    userId:`u${generateId(10)}`,
    name,
    preservedCaseEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now
  }

  await putDbItem(user);

  user.email = user.preservedCaseEmail;
  delete user.primary_key;
  delete user.sort_key;
  delete user.preservedCaseEmail;
  delete user.passwordHash;

  return user;
}