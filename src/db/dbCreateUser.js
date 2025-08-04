import bcrypt from 'bcryptjs';
import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';
import dbQueryUserByEmail from './dbQueryUserByEmail.js';

export default async function dbCreateUser(name, preservedCaseEmail, password) {
  const email = preservedCaseEmail.toLowerCase();
  const now = new Date().toISOString();

  const user = await dbQueryUserByEmail(email);

  if (user) {
    user.existing = true;
    return user;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    primary_key: 'user',
    sort_key: email,
    userId:`u${generateId(10)}`,
    name,
    preservedCaseEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now
  }

  await putDbItem(newUser);

  newUser.email = newUser.preservedCaseEmail;
  delete newUser.primary_key;
  delete newUser.sort_key;
  delete newUser.preservedCaseEmail;
  delete newUser.passwordHash;

  return newUser;
}