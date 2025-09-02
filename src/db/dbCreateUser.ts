import bcrypt from 'bcryptjs';
import generateId from '../lib/base64id.js';
import { putDbItem } from '../lib/dynamodb-client.js';
import dbQueryUserByEmail from './dbQueryUserByEmail.js';

interface User {
  primary_key: string;
  sort_key: string;
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface UserResponse {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface ExistingUserResponse {
  existing: true;
  [key: string]: unknown;
}

export default async function dbCreateUser(
  name: string,
  preservedCaseEmail: string,
  password: string
): Promise<UserResponse | ExistingUserResponse> {
  const email = preservedCaseEmail.toLowerCase();
  const now = new Date().toISOString();

  const user = await dbQueryUserByEmail(email);

  if (user) {
    return { existing: true };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser: User = {
    primary_key: 'user',
    sort_key: email,
    userId: `u${generateId(10)}`,
    name,
    preservedCaseEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now
  };

  await putDbItem(newUser);

  const userResponse: UserResponse = {
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.preservedCaseEmail,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  };

  return userResponse;
}
