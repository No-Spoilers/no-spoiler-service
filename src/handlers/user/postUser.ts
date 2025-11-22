import type { AuthLambdaEvent } from '../../lib/commonMiddleware.js';
import type {
  QueryCommandInput,
  ComparisonOperator,
} from '@aws-sdk/client-dynamodb';

import bcrypt from 'bcryptjs';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';

import { generateId } from '../../lib/base64id.js';
import { createNewToken } from '../../lib/token.js';
import { putDbItem } from '../../lib/dynamodb-client.js';
import { searchDbItems } from '../../lib/dynamodb-client.js';
import { postUserSchema } from '../../schemas/postUserSchema.js';
import { commonMiddleware } from '../../lib/commonMiddleware.js';
import {
  badRequestError,
  internalServerError,
  extractStringValue,
} from '../../lib/utils.js';

interface UserRecord {
  userId: string;
  name: string;
  preservedCaseEmail: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

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

export const handler = commonMiddleware(postUser).use(
  validator({ eventSchema: transpileSchema(postUserSchema) }),
);

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

async function dbQueryUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    const normalizedEmail = email.toLowerCase();

    const params: Partial<QueryCommandInput> = {
      KeyConditions: {
        primary_key: {
          AttributeValueList: [{ S: 'user' }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
        sort_key: {
          AttributeValueList: [{ S: normalizedEmail }],
          ComparisonOperator: 'EQ' as ComparisonOperator,
        },
      },
    };

    const queryResult = await searchDbItems(params);

    if (queryResult instanceof Error) {
      throw queryResult;
    }

    if (!Array.isArray(queryResult) || queryResult.length === 0) return null;

    // Convert DynamoDB AttributeValue to plain object
    const userRecord = queryResult[0];
    if (!userRecord) return null;

    const user: UserRecord = {
      userId: extractStringValue(userRecord.userId),
      name: extractStringValue(userRecord.name),
      preservedCaseEmail: extractStringValue(userRecord.preservedCaseEmail),
      passwordHash: extractStringValue(userRecord.passwordHash),
      createdAt: extractStringValue(userRecord.createdAt),
      updatedAt: extractStringValue(userRecord.updatedAt),
    };

    return user;
  } catch (error) {
    throw internalServerError(error);
  }
}
