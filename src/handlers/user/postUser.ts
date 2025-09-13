import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';

import validator from '@middy/validator';
import { postUserSchema } from '../../schemas/postUserSchema.js';

import bcrypt from 'bcryptjs';
import { transpileSchema } from '@middy/validator/transpile';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import { createNewToken } from '../../lib/token.js';
import { generateId } from '../../lib/base64id.js';
import { putDbItem } from '../../lib/dynamodb-client.js';
import { dbQueryUserByEmail } from '../../db/dbQueryUserByEmail.js';
import { badRequestError, internalServerError } from '../../lib/utils.js';

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

interface PostUserBody {
  name: string;
  email: string;
  password: string;
}

interface PostUserEvent extends AuthLambdaEvent {
  body: PostUserBody;
}

interface UserResponse {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  token: string;
  [key: string]: unknown;
}

async function postUser(event: PostUserEvent) {
  const { name, email, password } = event.body;

  try {
    const user = await dbCreateUser(name, email, password);

    if (!('userId' in user)) {
      throw new Error('Silently failed to create user');
    }

    // Create a user object compatible with createNewToken
    const userForToken = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const token = createNewToken(userForToken);

    const returnObject: UserResponse = {
      ...userForToken,
      token,
    };

    return {
      statusCode: 201,
      body: JSON.stringify(returnObject),
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return badRequestError(`User with email:${email} already exists.`);
    }
    return internalServerError(error);
  }
}

export const handler = commonMiddleware(postUser).use(
  validator({ eventSchema: transpileSchema(postUserSchema) }),
);

export async function dbCreateUser(
  name: string,
  preservedCaseEmail: string,
  password: string,
) {
  const email = preservedCaseEmail.toLowerCase();
  const now = new Date().toISOString();

  const user = await dbQueryUserByEmail(email);

  if (user) {
    throw new Error('User already exists');
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
    updatedAt: now,
  };

  await putDbItem(newUser);

  return {
    userId: newUser.userId,
    name: newUser.name,
    email: newUser.preservedCaseEmail,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
}
